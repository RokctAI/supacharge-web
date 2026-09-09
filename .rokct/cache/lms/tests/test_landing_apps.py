# Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

"""Contract tests for lms_sdk's app downloads and its web-only rules.

Run from the repository root:

    python3 -m unittest discover -s lms/nextjs/tests -v

Ray, 2026-09-09: "supacharge need to show these apps, ios is demoted for
now. apk and desktop app" - and, the same day, "supacharge web doesnt play
lessons or whatch libray but you should be able to watch schedule if you are
logged in. for attending lessons it should ask you to download app on phone
or download desktop app". The things that must never silently drift are:
which apps the landing shows (and that iOS stays in code but off every
surface), that every surface reads the ONE filtered list, that the lesson
route renders the download prompt and not a player, that the schedule stays
under the prefix auth_sdk gates, and that the version is said once. Stdlib
plus node (22.6+, --experimental-strip-types), the shape base_sdk's own
tests/test_manifest.py takes.
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
TEMPLATES = os.path.join(SDK_ROOT, "templates")
LANDING = os.path.join(TEMPLATES, "components", "custom", "landing")
CUSTOM = os.path.join(TEMPLATES, "components", "custom")
LESSON_DIR = os.path.join(
    TEMPLATES, "app", "handson", "all", "lms", "courses", "[courseName]", "learn", "[lessonId]"
)

CONFIG = os.path.join(LANDING, "lms-landing-config.ts")
HEADER_MENU = os.path.join(LANDING, "lms-header-menu.ts")
HERO_FORM = os.path.join(LANDING, "lms-hero-form.tsx")
HERO_COPY = os.path.join(LANDING, "lms-hero-copy.ts")
MARKS = os.path.join(TEMPLATES, "public", "brand", "marks")
THEME_CSS = os.path.join(LANDING, "lms-theme.css")
FOOTER_CHROME = os.path.join(LANDING, "lms-footer-chrome.ts")
FOOTER_SECTION = os.path.join(CUSTOM, "lms-footer-section.tsx")
PROMPT = os.path.join(CUSTOM, "lms-download-app.tsx")
TUTORS_SECTION = os.path.join(CUSTOM, "lms-tutors-section.tsx")
TESTIMONIALS_SECTION = os.path.join(CUSTOM, "lms-testimonials-section.tsx")
LMS_MARQUEE = os.path.join(LANDING, "lms-marquee.tsx")
LESSON_PAGE = os.path.join(LESSON_DIR, "page.tsx")
LESSON_PLAYBACK = os.path.join(LESSON_DIR, "_components", "lesson-playback.tsx")

RELEASES_PAGE = "https://github.com/RokctAI/supacharge/releases/latest"

# The surfaces that offer the app. Each reads LMS_SHOWN_APPS and never the
# raw LMS_APPS, so a demoted entry cannot leak through one of them. Since
# 1.15.0 the hero's surface is its copy (the badges the frame draws), not
# its form, which draws nothing.
APP_SURFACES = {
    "header menu": HEADER_MENU,
    "hero copy": HERO_COPY,
    "footer section": FOOTER_SECTION,
    "download prompt": PROMPT,
}


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)
LINE_COMMENT_RE = re.compile(r"^\s*//.*$", re.M)


def code_of(path):
    """The file with its comments stripped, so a word in a comment - the
    doc that says iOS is demoted, say - is never mistaken for code."""
    return LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path)))


def load_manifest():
    with open(os.path.join(SDK_ROOT, "manifest.json"), encoding="utf-8") as f:
        return json.load(f)


def lift_apps(overrides=None, shown=False):
    """LMS_APPS as node reads it: the literal lifted out of the config.

    The array is a plain literal by design (its doc comment says so) so no
    bundler or path alias is needed - the export line is rewritten to a
    const, the type annotation dropped, and node prints it as JSON. With
    `shown` the LMS_SHOWN_APPS expression is lifted too and its result is
    what comes back; `overrides` ({id: {field: value}}) are applied to the
    literal first, so a test can set one storeUrl the way a maintainer
    would.
    """
    source = read(CONFIG)
    match = re.search(r"^export const LMS_APPS: LandingApp\[\] = \[\n.*?^\];", source, re.S | re.M)
    if not match:
        raise AssertionError("LMS_APPS literal not found in lms-landing-config.ts")
    literal = match.group(0).replace("export const LMS_APPS: LandingApp[] =", "const LMS_APPS =", 1)
    script = literal + "\n"
    for app_id, fields in (overrides or {}).items():
        for field, value in fields.items():
            script += f"LMS_APPS.find((app) => app.id === {json.dumps(app_id)})[{json.dumps(field)}] = {json.dumps(value)};\n"
    if shown:
        shown_match = re.search(r"^export const LMS_SHOWN_APPS: LandingApp\[\] = (.*?);$", source, re.M)
        if not shown_match:
            raise AssertionError("LMS_SHOWN_APPS expression not found in lms-landing-config.ts")
        script += "const LMS_SHOWN_APPS = " + shown_match.group(1) + ";\nconsole.log(JSON.stringify(LMS_SHOWN_APPS));\n"
    else:
        script += "console.log(JSON.stringify(LMS_APPS));\n"
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "apps.mts")
        with open(path, "w", encoding="utf-8") as f:
            f.write(script)
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", path],
            capture_output=True, text=True, timeout=60,
        )
    if run.returncode != 0:
        raise AssertionError(run.stderr)
    return json.loads(run.stdout.strip().splitlines()[-1])


class TestApps(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.apps = lift_apps()
        cls.by_id = {app["id"]: app for app in cls.apps}

    def test_shown_apps_are_the_android_and_the_desktop_build_in_that_order(self):
        """Ray, 2026-09-09: Google Play, AppGallery, Windows, left to right;
        the AppGallery badge on the Android download until it is listed."""
        shown = lift_apps(shown=True)
        self.assertEqual([app["id"] for app in shown], ["android", "huawei", "desktop"])
        by_id = {app["id"]: app for app in shown}
        self.assertEqual(by_id["huawei"]["href"], "/download/android")
        self.assertEqual(by_id["huawei"]["href"], by_id["android"]["href"])

    def test_ios_is_kept_in_code_and_not_shown_and_appgallery_is_shown_unlisted(self):
        self.assertIn("ios", self.by_id, "the iOS entry is demoted, not removed")
        self.assertIs(self.by_id["ios"]["shown"], False)
        self.assertEqual(self.by_id["ios"]["storeUrl"], "")
        # AppGallery is shown on the Android download, unlisted as yet.
        self.assertIs(self.by_id["huawei"]["shown"], True)
        self.assertEqual(self.by_id["huawei"]["storeUrl"], "")
        source = read(CONFIG)
        self.assertIn("demoted for now", source)

    def test_one_store_url_flips_a_store_entry_on_and_relinks_it(self):
        """1.16.0 (Ray, 2026-09-09: "but eventually we getting in those
        stores except windows"): setting an entry's storeUrl - one config
        line - shows it and links every surface to the listing in place of
        the direct download; nothing else changes."""
        listing = "https://store.example/supacharge"
        for app_id in ("ios", "huawei", "android"):
            with self.subTest(app=app_id):
                shown = lift_apps(overrides={app_id: {"storeUrl": listing}}, shown=True)
                by_id = {app["id"]: app for app in shown}
                self.assertIn(app_id, by_id)
                self.assertEqual(by_id[app_id]["href"], listing)
                self.assertEqual(
                    [app["id"] for app in shown if app["id"] != app_id],
                    [app["id"] for app in self.apps if app["shown"] and app["id"] != app_id],
                )
                for other in shown:
                    if other["id"] != app_id:
                        self.assertEqual(other["href"], self.by_id[other["id"]]["href"])
        # Windows has no store, ever: its storeUrl is documented empty.
        self.assertEqual(self.by_id["desktop"]["storeUrl"], "")

    def test_labels_are_the_words_ray_asked_for(self):
        self.assertEqual(self.by_id["android"]["label"], "Android app")
        self.assertEqual(self.by_id["desktop"]["label"], "Desktop app")

    def test_badges_say_what_the_stores_say(self):
        """1.16.0: the hero badge reads the store's own badge wording over
        the store's mark, and "Download for / Windows" for the platform
        with no store; the platform names stay for the descriptions."""
        self.assertEqual(self.by_id["android"]["badge"], {"eyebrow": "GET IT ON", "label": "Google Play"})
        self.assertEqual(self.by_id["ios"]["badge"], {"eyebrow": "Download on the", "label": "App Store"})
        self.assertEqual(self.by_id["huawei"]["badge"], {"eyebrow": "EXPLORE IT ON", "label": "AppGallery"})
        self.assertEqual(self.by_id["desktop"]["badge"], {"eyebrow": "Download for", "label": "Windows"})
        self.assertEqual(self.by_id["android"]["platform"], "Android")
        self.assertEqual(self.by_id["desktop"]["platform"], "Windows")
        self.assertEqual(self.by_id["ios"]["platform"], "iOS")
        self.assertEqual(self.by_id["huawei"]["platform"], "Huawei")

    def test_no_hard_coded_store_url(self):
        source = code_of(CONFIG)
        self.assertNotRegex(source, r"(?i)play\.google\.com|apps\.apple\.com|appgallery\.huawei|appgallery\.cloud")
        for app in self.apps:
            with self.subTest(app=app["id"]):
                self.assertIsInstance(app["storeUrl"], str)
                self.assertNotRegex(app["href"], r"(?i)play\.google|apple\.com|huawei")

    def test_no_rendered_word_says_apk(self):
        """1.15.0 (Ray, 2026-09-09: "its saying apk which it should not"):
        the platform is the word, never the file format - on every field a
        surface renders, and in the code of every surface."""
        for app in self.apps:
            fields = {"label": app["label"], "platform": app["platform"], "description": app["description"], **{f"badge.{k}": v for k, v in app["badge"].items()}}
            for field, value in fields.items():
                with self.subTest(app=app["id"], field=field):
                    self.assertNotRegex(value, r"(?i)apk")
        for name, path in {**APP_SURFACES, "hero form": HERO_FORM}.items():
            with self.subTest(surface=name):
                self.assertNotRegex(code_of(path), r"(?i)apk")

    def test_every_entry_is_a_complete_link_opened_in_a_new_tab(self):
        for app in self.apps:
            with self.subTest(app=app["id"]):
                self.assertRegex(app["href"], r"^(https://|/download/)", app["href"])
                # external on every entry, the site's own route included: every
                # surface then renders a plain anchor, never a prefetching Link
                # that could start the download on the visitor's behalf.
                self.assertIs(app["external"], True)
                self.assertTrue(app["description"].strip())
                self.assertIn(app["icon"], {"box", "globe", "smartphone", "message-square", "zap", "wrench", "file-text"})

    def test_shown_destinations_are_the_download_route_never_a_per_version_asset(self):
        """1.15.0: the shown apps go through /download/<platform>, which
        resolves the latest release's asset at request time; the assets
        are named per version (1.4.1), so no href may bake one in."""
        for app in self.apps:
            with self.subTest(app=app["id"]):
                self.assertNotIn("/releases/download/", app["href"])
                if app["shown"]:
                    self.assertRegex(app["href"], r"^/download/[a-z]+$")
                else:
                    # Nothing publishes the demoted platform: the page, not an
                    # invented route.
                    self.assertEqual(app["href"], RELEASES_PAGE)

    def test_icons_are_a_phone_for_android_and_not_a_phone_for_desktop(self):
        self.assertEqual(self.by_id["android"]["icon"], "smartphone")
        self.assertNotEqual(self.by_id["desktop"]["icon"], "smartphone")

    def test_shown_list_is_the_filter_of_the_full_list(self):
        source = read(CONFIG)
        self.assertIn(
            'export const LMS_SHOWN_APPS: LandingApp[] = LMS_APPS.filter((app) => app.shown || app.storeUrl !== "").map((app) => (app.storeUrl ? { ...app, href: app.storeUrl } : app));',
            source,
        )

    def test_the_single_app_link_is_flagged_and_kept(self):
        source = read(CONFIG)
        self.assertIn("  app: LandingLink;", source)
        self.assertIn("FLAGGED, not removed", source)


class TestSurfaces(unittest.TestCase):
    def test_every_surface_reads_the_shown_list_and_never_the_raw_one(self):
        for name, path in APP_SURFACES.items():
            with self.subTest(surface=name):
                source = code_of(path)
                self.assertIn("LMS_SHOWN_APPS", source)
                self.assertNotRegex(source, r"\bLMS_APPS\b")
                self.assertNotRegex(source, r"[\"']ios[\"']")

    def test_hero_badges_are_the_frames_own_store_badges(self):
        """1.15.0 (Ray, 2026-09-09, on a custom button drawn in the badge's
        shape: "cant say this, look at the rokctai hero how it say it"): the
        downloads are base_sdk's HeroBadge entries - one per shown app,
        registered through the hero copy, drawn by the frame exactly as
        rokct.ai's "Available in the / Chrome Web Store" badge is - with the
        small line and the big line taken from the entry's eyebrow and
        platform, and the platform's mark handed to the frame through its
        {src, alt} icon slot."""
        copy = code_of(HERO_COPY)
        self.assertIn("LMS_SHOWN_APPS.map(", copy)
        for field in ("eyebrow: app.badge.eyebrow", "label: app.badge.label", "icon: LMS_APP_MARKS[app.id]"):
            self.assertIn(field, copy)
        self.assertIn("badges: LMS_HERO_BADGES,", copy)
        # The hero form draws no button of its own any more.
        form = code_of(HERO_FORM)
        self.assertIn("return null;", form)
        for word in ("<a", "href", "LMS_APP_GLYPHS", "LMS_SHOWN_APPS", "loginUrl", "LANDING_CONFIG"):
            self.assertNotIn(word, form)
        self.assertNotRegex(form, r"(?i)sign in")

    def test_hero_badge_marks_are_base_sdks_files(self):
        """1.16.0 (Ray, 2026-09-09: "we already have nice icons in buttons
        in hero of rokct but supacharge is getting bad ones. we use what
        these platforms use for familiarity"): the Android download wears
        Google Play, the desktop one Windows, the iOS entry the Apple mark
        and the Huawei entry the AppGallery flower; which are drawn is
        LMS_SHOWN_APPS's business. 1.17.0: the files are base_sdk 1.26.0's,
        installed under public/brand/marks on every host, so this SDK ships
        none of them and only names their paths; the public/brand mapping
        stays for the wordmarks and the social still."""
        copy = code_of(HERO_COPY)
        mapping = {
            "android": ("/brand/marks/google-play.svg", "Google Play"),
            "desktop": ("/brand/marks/windows.svg", "Windows"),
            "ios": ("/brand/marks/app-store.svg", "App Store"),
            "huawei": ("/brand/marks/app-gallery.svg", "AppGallery"),
        }
        for app_id, (src, alt) in mapping.items():
            with self.subTest(app=app_id):
                self.assertIn(f'{app_id}: {{ src: "{src}", alt: "{alt}" }}', copy)
        self.assertNotIn('"app-store"', copy)
        self.assertNotIn("android.svg", copy)
        # Every mark named is one of base's files under /brand/marks/.
        for value in re.findall(r'src: "([^"]+)"', copy):
            self.assertRegex(value, r"^/brand/marks/[a-z-]+\.svg$")
        self.assertNotRegex(copy, r"(?i)https?://|cdn\.")
        # This SDK ships no mark: base owns the directory.
        self.assertFalse(os.path.exists(MARKS), MARKS)
        brand = os.path.join(TEMPLATES, "public", "brand")
        self.assertTrue(os.path.isdir(brand))
        self.assertFalse([f for f in os.listdir(brand) if f.endswith(".svg") and "wordmark" not in f], os.listdir(brand))
        installs = load_manifest()["installs"]
        self.assertIn(("templates/public/brand", "public/brand"), [(i["from"], i["to"]) for i in installs])
        self.assertNotIn("marks", json.dumps(installs))
        self.assertFalse(os.path.exists(os.path.join(LANDING, "lms-app-glyphs.tsx")))
        self.assertNotIn("lms-app-glyphs", json.dumps(installs))

    def test_no_lms_stylesheet_filters_a_mark(self):
        """1.17.0: base_sdk 1.26.0 applies the dark-mode treatment for the
        two monochrome marks (app-store.svg, windows.svg) itself, keyed on
        the src basename, and never touches a coloured one, so the 1.16.0
        rule that did that under #hero is gone and no lms stylesheet
        reaches a mark: no invert, no filter, no /brand/marks/ selector."""
        css = read(THEME_CSS)
        self.assertNotRegex(css, r'a\[href\^="/download/"\]')
        self.assertNotIn("invert", css)
        self.assertNotIn("filter:", css)
        self.assertNotIn("/brand/marks/", css)
        self.assertNotIn(".sc-app-badge", css)
        for root, _dirs, files in os.walk(TEMPLATES):
            for name in files:
                if name.endswith(".css"):
                    with self.subTest(css=os.path.relpath(os.path.join(root, name), TEMPLATES)):
                        self.assertNotIn("invert", read(os.path.join(root, name)))

    def test_download_prompt_draws_the_same_marks(self):
        """1.16.0: the lesson prompt's buttons carry the hero's marks, read
        from the one LMS_APP_MARKS table rather than a second list of
        paths."""
        source = code_of(PROMPT)
        self.assertIn('import { LMS_APP_MARKS } from "@/components/custom/landing/lms-hero-copy";', source)
        self.assertIn("LMS_APP_MARKS[app.id]", source)
        self.assertNotIn("/brand/marks/", source)

    def test_header_menu_lists_the_apps_as_one_group_of_cards(self):
        source = read(HEADER_MENU)
        self.assertIn('id: "apps"', source)
        self.assertIn("label: LMS_LANDING_CONFIG.app.label", source)
        for field in ("description", "icon"):
            self.assertIn(field, source)
        # The section anchors are still the menu's flat entries.
        for anchor in ("sessions", "subjects", "tutors", "features", "partners", "pricing", "faq"):
            self.assertIn(f'"{anchor}"', source)

    def test_header_declares_the_wordmark_is_the_logo(self):
        """1.13.0 (Ray, 2026-09-09: "supacharge text is the logo right now
        until i design an icon"): the menu tells base_sdk >= 1.21.0's
        header to draw no image in its brand slot."""
        self.assertIn('brand: { logo: "none" }', code_of(HEADER_MENU))
        self.assertIn(
            "Supacharge text is the logo until an icon is designed (Ray, 2026-09-09)",
            read(HEADER_MENU),
        )

    def test_hero_and_footer_no_longer_render_the_single_app_link(self):
        for path in (HERO_FORM, FOOTER_SECTION):
            with self.subTest(path=os.path.basename(path)):
                self.assertNotIn("LMS_LANDING_CONFIG.app;", read(path))

    def test_prompt_is_installed_and_carries_rays_reason(self):
        manifest = load_manifest()
        self.assertIn(
            {"from": "templates/components/custom/lms-download-app.tsx", "to": "components/custom/lms-download-app.tsx"},
            manifest["installs"],
        )
        source = read(PROMPT)
        self.assertIn("we make things to apps", source)
        self.assertIn("Download the app on your phone or download the desktop app.", source)
        self.assertIn("LMS_LANDING_CONFIG.app.label", source)


class TestMarquee(unittest.TestCase):
    def test_tutors_scroll_in_the_marquee_and_testimonials_still_do(self):
        """1.14.0 (Ray, 2026-09-09: "tutor cards should keep scrolling like
        testamonials"): from 640px up the tutors section renders the lms
        marquee - base's row with the card left to the caller - and below
        640px it is still the deck (Ray, 2026-09-08); the testimonials
        section still renders base's own TestimonialsMarquee; and the lms
        marquee runs on base's classes and base's stylesheet, so the two
        rows share one rule set."""
        tutors = code_of(TUTORS_SECTION)
        self.assertIn('from "@/components/custom/landing/lms-marquee"', tutors)
        self.assertIn("<LmsMarquee", tutors)
        self.assertIn("<LmsCardDeck", tutors)
        self.assertIn('className="w-full sm:hidden"', tutors)
        self.assertIn('className="hidden w-full sm:block"', tutors)
        self.assertIn("prefers-reduced-motion: reduce", tutors)

        testimonials = code_of(TESTIMONIALS_SECTION)
        self.assertIn('from "@/components/custom/landing/testimonials-marquee"', testimonials)
        self.assertIn("<TestimonialsMarquee", testimonials)
        self.assertNotIn("lms-marquee", testimonials)

        marquee = code_of(LMS_MARQUEE)
        self.assertIn('import "@/app/styles/rokct-marquee.css"', marquee)
        for cls in ("rokct-marquee", "rokct-marquee-track", "group-hover:[animation-play-state:paused]"):
            with self.subTest(cls=cls):
                self.assertIn(cls, marquee)
        self.assertNotIn("@keyframes", marquee)

        manifest = load_manifest()
        self.assertIn(
            {"from": "templates/components/custom/landing/lms-marquee.tsx", "to": "components/custom/landing/lms-marquee.tsx"},
            manifest["installs"],
        )
        self.assertIn("app/styles/rokct-marquee.css", manifest["requires"])
        self.assertIn("base_sdk >= 1.14.0", manifest["_comment"]["app/styles/rokct-marquee.css"])


class TestWebRules(unittest.TestCase):
    def test_lesson_route_renders_the_prompt_and_no_player(self):
        source = code_of(LESSON_PAGE)
        self.assertIn('from "@/components/custom/lms-download-app"', source)
        self.assertIn("<LmsDownloadAppPrompt", source)
        for player in ("react-player", "ReactPlayer", "editor-content", "fetchLesson"):
            self.assertNotIn(player, source)
        self.assertIn("export default async function LessonPage", source)

    def test_playback_is_kept_flagged_and_imported_by_nothing(self):
        self.assertTrue(os.path.exists(LESSON_PLAYBACK))
        source = read(LESSON_PLAYBACK)
        self.assertIn("NOT USED ON THE WEB", source)
        self.assertIn('from "react-player"', source)
        self.assertIn("export default function LessonPlayback", source)
        for root, _dirs, files in os.walk(TEMPLATES):
            for fname in files:
                if not fname.endswith((".ts", ".tsx")) or fname == "lesson-playback.tsx":
                    continue
                self.assertNotIn("lesson-playback", code_of(os.path.join(root, fname)), os.path.join(root, fname))

    def test_schedule_home_sits_under_the_prefix_auth_sdk_gates(self):
        source = read(CONFIG)
        match = re.search(r'url: "(/[^"]+)"', source)
        self.assertIsNotNone(match, "home.url not found")
        self.assertTrue(match.group(1).startswith("/handson/"), match.group(1))
        self.assertTrue(os.path.exists(os.path.join(TEMPLATES, "app", "handson", "all", "lms", "page.tsx")))
        root_page = read(os.path.join(TEMPLATES, "app", "page.tsx"))
        self.assertIn('redirect("/landing")', root_page)
        self.assertIn("redirect(LMS_LANDING_CONFIG.home.url)", root_page)


class TestVersion(unittest.TestCase):
    def setUp(self):
        self.manifest = load_manifest()

    def test_changelog_leads_with_the_manifest_version(self):
        heads = re.findall(r"^## (\d+\.\d+\.\d+)$", read(os.path.join(SDK_ROOT, "CHANGELOG.md")), re.M)
        self.assertTrue(heads)
        self.assertEqual(heads[0], self.manifest["version"])

    def test_footer_advertises_the_manifest_version(self):
        match = re.search(r'LMS_LANDING_VERSION = "([^"]+)"', read(FOOTER_CHROME))
        self.assertIsNotNone(match)
        self.assertEqual(match.group(1), self.manifest["version"])

    def test_manifest_names_the_base_floor_that_draws_the_cards(self):
        notes = self.manifest["_comment"]
        for key in ("components/custom/landing/header-menu.ts", "components/custom/header-menu.tsx"):
            with self.subTest(key=key):
                self.assertIn(key, self.manifest["requires"])
                self.assertIn("1.18.0", notes[key])

    def test_manifest_names_the_base_floor_that_reads_the_brand(self):
        """The brand declaration is base_sdk 1.21.0's; the registry that
        types it and the header that reads it are required at that floor."""
        notes = self.manifest["_comment"]
        for key in ("components/custom/landing/header-menu.ts", "components/custom/header.tsx"):
            with self.subTest(key=key):
                self.assertIn(key, self.manifest["requires"])
                self.assertIn("base_sdk >= 1.21.0", notes[key])

    def test_manifest_names_the_base_floor_that_ships_the_marks(self):
        """1.17.0: the mark files are base_sdk 1.26.0's, so the floor is
        1.26.0 - stated in the manifest, on the hero-config note and at the
        head of the changelog."""
        notes = self.manifest["_comment"]
        self.assertIn("1.26.0", notes["about"])
        self.assertIn("components/custom/landing/hero-config.ts", self.manifest["requires"])
        self.assertIn("base_sdk >= 1.26.0", notes["components/custom/landing/hero-config.ts"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("base_sdk >= 1.26.0", changelog.split("## 1.16.0")[0])


if __name__ == "__main__":
    unittest.main()
