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
SITE_METADATA = os.path.join(LANDING, "lms-site-metadata.ts")
WORDMARK = os.path.join(LANDING, "lms-wordmark.tsx")
HERO_WORDMARK = os.path.join(LANDING, "lms-hero-wordmark.ts")
THEME_TSX = os.path.join(LANDING, "lms-theme.tsx")
THEME_SECTION = os.path.join(CUSTOM, "lms-theme-section.tsx")
THEME_CLASSES = os.path.join(LANDING, "lms-theme-classes.ts")
HERO_FORM = os.path.join(LANDING, "lms-hero-form.tsx")
HERO_COPY = os.path.join(LANDING, "lms-hero-copy.ts")
MARKS = os.path.join(TEMPLATES, "public", "brand", "marks")
THEME_CSS = os.path.join(LANDING, "lms-theme.css")
FOOTER_CHROME = os.path.join(LANDING, "lms-footer-chrome.ts")
FOOTER_SECTION = os.path.join(CUSTOM, "lms-footer-section.tsx")
# 1.18.0: supacharge.app shows no network strip.
NETWORK_STRIP = os.path.join(LANDING, "lms-network-strip.ts")
NETWORK_STRIP_LINE = re.compile(
    r'^  \{ id: "lms-network-strip", load: \(\) => import\("@/components/custom/landing/lms-network-strip"\) \},$'
)
PROMPT = os.path.join(CUSTOM, "lms-download-app.tsx")
TUTORS_SECTION = os.path.join(CUSTOM, "lms-tutors-section.tsx")
# 1.27.0: the founder card on corporate_sdk's /about through base 1.38.0's page slot.
TUTOR_CARD = os.path.join(LANDING, "lms-tutor-card.tsx")
FOUNDERS = os.path.join(LANDING, "lms-founders.ts")
FOUNDER_SECTION = os.path.join(CUSTOM, "lms-founder-section.tsx")
FOUNDER_CLIENT = os.path.join(CUSTOM, "lms-founder-section.client.tsx")
TEAM_ASSETS = os.path.join(LANDING, "team-assets.ts")
DART_CATALOG = os.path.join(
    SDK_ROOT, os.pardir, "dart", "lib", "src", "common", "infrastructure", "repositories",
    "seeded_tutor_catalog.dart",
)
DART_TUTOR_CARD = os.path.join(
    SDK_ROOT, os.pardir, "dart", "lib", "src", "common", "presentation", "pages", "discovery",
    "widgets", "tutor_card.dart",
)
# 1.24.0: the roster (deck or marquee) is the client half; the entry holds meta.
TUTORS_CLIENT = os.path.join(CUSTOM, "lms-tutors-section.client.tsx")
TESTIMONIALS_SECTION = os.path.join(CUSTOM, "lms-testimonials-section.tsx")
LMS_MARQUEE = os.path.join(LANDING, "lms-marquee.tsx")
FEATURES_SECTION = os.path.join(CUSTOM, "lms-features-section.tsx")
SUBJECTS_SECTION = os.path.join(CUSTOM, "lms-subjects-section.tsx")
# 1.25.0: the one curriculum line, Cambridge marked soon.
CURRICULA = os.path.join(LANDING, "lms-curricula.tsx")
PARTNERS_SECTION = os.path.join(CUSTOM, "lms-partners-section.tsx")
FEATURES_CSS = os.path.join(LANDING, "lms-features.css")
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


def lift_header_menu():
    """LMS_HEADER_MENU as node reads it: the literal lifted out of
    lms-header-menu.ts with its three imports stubbed - the app label and
    the shown apps as what lift_apps() gives (the real config, through the
    same lift), the market code as a no-op - and printed as JSON. The menu
    is a plain literal by design, so nothing else is needed."""
    code = code_of(HEADER_MENU)
    match = re.search(r"^const LMS_HEADER_MENU: HeaderMenu = \{\n.*?^\};", code, re.S | re.M)
    if not match:
        raise AssertionError("LMS_HEADER_MENU literal not found in lms-header-menu.ts")
    literal = match.group(0).replace("const LMS_HEADER_MENU: HeaderMenu =", "const LMS_HEADER_MENU =", 1)
    app_label = re.search(r'^  app: \{\n\s*label: "([^"]+)"', read(CONFIG), re.M)
    if not app_label:
        raise AssertionError("LMS_LANDING_CONFIG.app.label not found in lms-landing-config.ts")
    script = (
        "const LMS_LANDING_CONFIG = { app: { label: " + json.dumps(app_label.group(1)) + " } };\n"
        "const LMS_SHOWN_APPS = " + json.dumps(lift_apps(shown=True)) + ";\n"
        "const marketCode = () => \"\";\n"
        + literal + "\n"
        "console.log(JSON.stringify(LMS_HEADER_MENU));\n"
    )
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "header-menu.mts")
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
        # Every section is still linked by id only - since 1.23.0 most of
        # them from inside the panel (TestHeaderGroups) - never by href.
        for anchor in ("sessions", "subjects", "tutors", "features", "partners", "pricing", "faq"):
            self.assertIn(f'"{anchor}"', source)
        self.assertNotIn('href: "#', code_of(HEADER_MENU))

    def test_header_declares_the_wordmark_is_the_logo(self):
        """1.13.0 (Ray, 2026-09-09: "supacharge text is the logo right now
        until i design an icon"): the menu tells base_sdk >= 1.21.0's
        header to draw no image in its brand slot."""
        # 1.20.0 adds `collapse` beside it; the logo is still no image.
        self.assertIn('brand: { logo: "none", collapse:', code_of(HEADER_MENU))
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
        rows share one rule set. Since 1.24.0 the roster is the section's
        client half (lms-tutors-section.client.tsx), rendered by the
        server-readable entry."""
        tutors = code_of(TUTORS_CLIENT)
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


FEATURE_TREATMENTS = {"glow", "numeral", "list", "gradient", "outlined"}


def lift_features():
    """LMS_LANDING_CONFIG.features as node reads it: the block lifted out of
    the config literal, its `icon: Name` references quoted so the block
    evaluates without lucide."""
    source = read(CONFIG)
    match = re.search(r"^  features: \{\n.*?^  \},$", source, re.S | re.M)
    if not match:
        raise AssertionError("features block not found in lms-landing-config.ts")
    literal = re.sub(r"icon: (\w+),", r'icon: "\1",', match.group(0))
    literal = "const F = {\n" + literal[len("  features: {\n"):-1] + ";"
    script = literal + "\nconsole.log(JSON.stringify(F));\n"
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "features.mts")
        with open(path, "w", encoding="utf-8") as f:
            f.write(script)
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", path],
            capture_output=True, text=True, timeout=60,
        )
    if run.returncode != 0:
        raise AssertionError(run.stderr)
    return json.loads(run.stdout.strip().splitlines()[-1])


def place(items, columns, wide_first):
    """Where each card lands: the browser's own grid auto-placement (row
    flow, no dense packing) over `columns` columns, a wide card spanning
    two, the wide cards ordered first when `wide_first` (the section's
    `order-first lg:order-none`). Returns {name: set of (row, col) cells}."""
    order = sorted(items, key=lambda it: 0 if (wide_first and it.get("wide")) else 1)
    taken = set()
    cells = {}
    row = col = 0
    for it in order:
        span = 2 if it.get("wide") else 1
        while True:
            if col + span > columns:
                row, col = row + 1, 0
            if all((row, col + i) not in taken for i in range(span)):
                break
            col += 1
        cells[it["name"]] = {(row, col + i) for i in range(span)}
        taken |= cells[it["name"]]
        col += span
    return cells


def neighbours(cells):
    """Every pair of cards that touch, beside or above each other."""
    owner = {cell: name for name, cs in cells.items() for cell in cs}
    pairs = set()
    for (r, c), name in owner.items():
        for other in (owner.get((r, c + 1)), owner.get((r + 1, c))):
            if other and other != name:
                pairs.add(tuple(sorted((name, other))))
    return pairs


class TestFeatureCards(unittest.TestCase):
    """The audit finding "eight identical icon-in-square feature cards"
    (Ray, 2026-09-09: "the eight identical feature cards if its your day you
    need to fix"): the cards are a bento - two wide, five treatments, no two
    neighbours alike at any width - and every figure or line a treatment
    adds is copy the config already carries."""

    def test_two_wide_cards_and_a_treatment_each(self):
        items = lift_features()["items"]
        self.assertEqual(len(items), 8)
        self.assertEqual(sum(1 for it in items if it.get("wide")) , 2)
        for it in items:
            with self.subTest(card=it["name"]):
                self.assertIn(it["treatment"], FEATURE_TREATMENTS)
                self.assertEqual(it["treatment"] == "numeral", bool(it.get("figure")))
                self.assertEqual(it["treatment"] == "list", bool(it.get("lines")))
        self.assertGreaterEqual(len({it["treatment"] for it in items}), 4)

    def test_no_two_neighbours_alike_at_any_width(self):
        items = lift_features()["items"]
        by_name = {it["name"]: it["treatment"] for it in items}
        layouts = {
            "lg (5 columns, tour order)": place(items, 5, wide_first=False),
            "sm/md (2 columns, wide first)": place(items, 2, wide_first=True),
            "phone (one row, wide first)": place(items, 10, wide_first=True),
        }
        for label, cells in layouts.items():
            with self.subTest(layout=label):
                used = {cell for cs in cells.values() for cell in cs}
                rows = max(r for r, _ in used) + 1
                columns = max(c for _, c in used) + 1
                self.assertEqual(len(used), rows * columns, f"{label} leaves a hole")
                for a, b in sorted(neighbours(cells)):
                    self.assertNotEqual(by_name[a], by_name[b], f"{a} and {b} touch and are both {by_name[a]}")

    def test_figures_and_lines_are_existing_copy(self):
        items = lift_features()["items"]
        config = code_of(CONFIG)
        for it in items:
            if it.get("figure"):
                with self.subTest(card=it["name"], figure=it["figure"]):
                    words = {"1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six"}
                    self.assertIn(words.get(it["figure"], it["figure"]), it["text"].lower())
            for line in it.get("lines", []):
                with self.subTest(card=it["name"], line=line):
                    self.assertEqual(config.count(f'"{line}"'), 2, "a list line is a string the config already carries, once")

    def test_section_draws_the_bento_from_its_own_sheet(self):
        section = code_of(FEATURES_SECTION)
        self.assertIn('import "@/components/custom/landing/lms-features.css"', section)
        for cls in ("lg:grid-cols-5", "sc-row", "sm:col-span-2 order-first lg:order-none", "sc-card sc-feature"):
            with self.subTest(cls=cls):
                self.assertIn(cls, section)
        self.assertNotIn("bg-[var(--sc-primary)]", section)
        css = read(FEATURES_CSS)
        for treatment in FEATURE_TREATMENTS - {"list", "numeral"}:
            with self.subTest(treatment=treatment):
                self.assertIn(f".sc-feature-{treatment}", css)
        self.assertIn(".sc-feature-figure", css)
        self.assertIn(".sc-feature-line", css)
        self.assertNotRegex(css, r"#[0-9a-fA-F]{3,8}\b")
        self.assertNotIn("@keyframes", css)
        self.assertNotIn("transition", css)
        self.assertIn(
            {"from": "templates/components/custom/landing/lms-features.css", "to": "components/custom/landing/lms-features.css"},
            load_manifest()["installs"],
        )


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


class TestNetworkStrip(unittest.TestCase):
    """1.18.0 (Ray, 2026-09-09: "supacharge dont need the strip yet"):
    base_sdk's network strip - the other sites of the Rokct network under
    "Trusted by", in every shell's footer row by default - is registered
    OFF on this shell, everywhere."""

    def test_registered_where_base_looks(self):
        manifest = load_manifest()
        self.assertTrue(os.path.exists(NETWORK_STRIP))
        self.assertIn("components/custom/landing/lms-network-strip.ts", {i["to"] for i in manifest["installs"]})
        lines = [i for i in manifest["integrations"] if i["target"] == "components/custom/landing/network-strip.ts"]
        self.assertEqual(len(lines), 1)
        self.assertEqual(lines[0]["placeholder"], "// @rokct-sdk-network-strip-start")
        self.assertRegex(lines[0]["replacement"], NETWORK_STRIP_LINE)
        self.assertIn("components/custom/landing/network-strip.ts", manifest["requires"])
        self.assertIn("base_sdk >= 1.23.0", manifest["_comment"]["components/custom/landing/network-strip.ts"])
        self.assertIn("1.18.0", manifest["_comment"]["about"])

    def test_says_off_everywhere_and_nothing_more(self):
        src = read(NETWORK_STRIP)
        self.assertIn('landing: "none"', src)
        self.assertIn("footer: false", src)
        self.assertIn("export default LMS_NETWORK_STRIP;", src)
        body = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
        body = re.sub(r"^\s*//.*$", "", body, flags=re.M)
        self.assertNotIn("http", body)
        self.assertNotIn("import ", body, "imports nothing, so an older base still compiles the shell")
        for tracker in ("utm", "ref=", "onClick", "gtag", "analytics"):
            self.assertNotIn(tracker, body)
        self.assertNotIn("Trusted by", body)

    def test_no_lms_template_draws_the_strip_itself(self):
        """The strip is base's; with the footer surface off nothing of this
        SDK may draw it or write its heading by hand. The hero's trustLine
        ("Trusted by learners...") is copy about learners, not the strip,
        and lives in lms-hero-copy.ts, which is not checked here."""
        for path in (FOOTER_SECTION, CONFIG, FOOTER_CHROME, HEADER_MENU):
            with self.subTest(file=os.path.relpath(path, SDK_ROOT)):
                # The code, not the comments that recount what base draws.
                code = re.sub(r"/\*.*?\*/", "", read(path), flags=re.S)
                code = re.sub(r"^\s*//.*$", "", code, flags=re.M)
                self.assertNotIn("NetworkStrip", code)
                self.assertNotIn("components/custom/network-strip", code)
                self.assertNotIn("Trusted by", code)
        footer = read(FOOTER_SECTION)
        self.assertIn("<FooterChromeRow", footer)
        self.assertNotIn("networkStrip=", footer, "the registration, not a prop, keeps the strip off")
        # The base floor is unchanged.
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("base_sdk >= 1.26.0", changelog.split("## 1.17.0")[0])
        self.assertNotIn("base_sdk >= 1.27.0", changelog.split("## 1.17.0")[0])


class TestHeaderCollapse(unittest.TestCase):
    """1.20.0 (Ray, 2026-09-10: "the country code is lost in supacharge it
    is only in rokctai"; "since supacharge has not icon cant it fold and
    only leave the first letter as its icon?"): the header brand declares
    base_sdk's collapse with the market's code, and still no image - the
    letter tile is base_sdk 1.28.0's to draw."""

    def test_brand_declares_the_collapse_and_still_no_image(self):
        code = code_of(HEADER_MENU)
        self.assertIn(
            'brand: { logo: "none", collapse: { delayMs: 1500, code: marketCode } },',
            code,
        )
        # No icon path, no tile of this SDK's own: base draws the letter.
        self.assertNotIn("logo: \"/", code)
        self.assertNotIn("<img", code)
        self.assertNotIn("brand-icon", code)

    def test_code_is_the_site_locales_region_and_no_country_is_spelled_here(self):
        code = code_of(HEADER_MENU)
        self.assertIn(
            'import LMS_SITE_METADATA from "@/components/custom/landing/lms-site-metadata";',
            code,
        )
        self.assertIn("return localeRegion(LMS_SITE_METADATA.locale);", code)
        # The letters live in lms-site-metadata.ts's locale only.
        self.assertNotRegex(code, r'"ZA"|\'ZA\'|South Africa')
        self.assertNotIn("getBrandingSync", code)
        self.assertIn('locale: "en_ZA"', code_of(os.path.join(LANDING, "lms-site-metadata.ts")))

    def test_locale_region_under_node(self):
        code = code_of(HEADER_MENU)
        match = re.search(r"^export function localeRegion\(.*?^}\n", code, re.S | re.M)
        self.assertIsNotNone(match, "localeRegion must be a top-level function")
        fn = match.group(0)
        self.assertNotRegex(fn, r"^\s*import\s", "localeRegion must stay import-free so node runs it bare")
        node = shutil.which("node")
        if not node:
            raise unittest.SkipTest("node is not installed")
        cases = {
            "en_ZA": "ZA",
            "en-ZA": "ZA",
            " en_za ": "ZA",
            "zh_Hant_TW": "TW",
            "pt_BR": "BR",
            "en": "",
            "es_419": "",
            "und_Latn": "",
            "": "",
        }
        driver = fn + """
const cases = JSON.parse(process.argv[2]);
const out = {};
for (const [locale, want] of Object.entries(cases)) out[locale] = localeRegion(locale);
out["<null>"] = localeRegion(null);
out["<undefined>"] = localeRegion(undefined);
process.stdout.write(JSON.stringify(out));
"""
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "locale-region.ts")
            with open(path, "w", encoding="utf-8") as f:
                f.write(driver)
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", path, json.dumps(cases)],
                capture_output=True, text=True, check=False,
            )
        self.assertEqual(run.returncode, 0, run.stderr)
        got = json.loads(run.stdout)
        for locale, want in cases.items():
            with self.subTest(locale=locale):
                self.assertEqual(got[locale], want)
        self.assertEqual(got["<null>"], "")
        self.assertEqual(got["<undefined>"], "")

    def test_manifest_and_changelog_name_the_base_floor_that_draws_the_tile(self):
        manifest = load_manifest()
        notes = manifest["_comment"]
        self.assertIn("1.28.0", notes["about"])
        # The header that draws the tile is 1.28.0's; the registry's floor
        # moved on to 1.29.0 with the stem rule (TestBrandString).
        # 1.26.0 moved the registry's floor on again, to 1.36.0 (TestHeaderGroups).
        floors = {
            "components/custom/landing/header-menu.ts": "1.36.0",
            "components/custom/header.tsx": "1.28.0",
        }
        for key, floor in floors.items():
            with self.subTest(key=key):
                self.assertIn(key, manifest["requires"])
                self.assertTrue(notes[key].startswith(f"installed by base_sdk >= {floor}"), notes[key])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("base_sdk >= 1.28.0", changelog.split("## 1.18.0")[0])


class TestHeaderGroups(unittest.TestCase):
    """1.23.0 (Ray, 2026-09-10: "some of menus in header i think there
    should have gone to mega menu"): the bar reads `[Explore v]  Pricing
    FAQ`. 1.26.0 (Ray, 2026-09-10: "header app links first. if possible
    put mobile apps in one row since supa dont have much menu"): the panel
    is Get the app (lead, one row), Explore, Platform, and the trigger's
    word is declared (base_sdk 1.36.0's megaLabel) so the bar is unchanged."""

    def setUp(self):
        self.menu = lift_header_menu()

    def test_groups_are_apps_explore_platform_in_that_order(self):
        self.assertEqual([g["id"] for g in self.menu["groups"]], ["apps", "explore", "platform"])
        self.assertEqual([g["label"] for g in self.menu["groups"]], ["Get the app", "Explore", "Platform"])

    def test_the_trigger_is_still_explore_through_mega_label(self):
        # base 1.36.0 draws the declared megaLabel as the bar's one trigger,
        # whichever group leads the panel.
        self.assertEqual(self.menu["megaLabel"], "Explore")
        self.assertNotEqual(self.menu["groups"][0]["label"], "Explore")

    def test_the_apps_lead_in_one_row(self):
        lead = self.menu["groups"][0]
        self.assertEqual(lead["id"], "apps")
        self.assertEqual(lead["layout"], "row")
        self.assertNotIn("badge", lead)
        for group in self.menu["groups"][1:]:
            with self.subTest(group=group["id"]):
                self.assertNotIn("layout", group)

    def test_explore_column_is_sessions_subjects_tutors_by_anchor(self):
        explore = self.menu["groups"][1]
        self.assertEqual(explore["label"], "Explore")
        self.assertEqual(explore["items"], [{"anchor": "sessions"}, {"anchor": "subjects"}, {"anchor": "tutors"}])
        self.assertNotIn("badge", explore)

    def test_platform_column_is_features_then_partners_by_anchor(self):
        platform = self.menu["groups"][2]
        self.assertEqual(platform["items"], [{"anchor": "features"}, {"anchor": "partners"}])

    def test_section_items_carry_no_label_and_no_badge_of_their_own(self):
        """Labels and badges are the sections' meta.nav: partners' "new" is
        lms-partners-section.tsx's, resolved by base, never restated here."""
        for group in self.menu["groups"][1:]:
            for item in group["items"]:
                with self.subTest(group=group["id"], item=item):
                    self.assertEqual(set(item), {"anchor"})
        self.assertIn('nav: [{ id: "partners", label: "Partners", badge: "new" }]', read(PARTNERS_SECTION))
        code = code_of(HEADER_MENU)
        self.assertNotIn('"new"', code)
        for word in ("Sessions", "Subjects", "Tutors", "Features", "Partners", "Pricing", "FAQ"):
            self.assertNotIn(f'"{word}"', code)

    def test_apps_items_are_unchanged_and_now_first(self):
        apps = self.menu["groups"][0]
        self.assertEqual(apps["id"], "apps")
        self.assertEqual([a["id"] for a in apps["items"]], [a["id"] for a in lift_apps(shown=True)])
        for item in apps["items"]:
            with self.subTest(item=item["id"]):
                self.assertTrue(item.get("description") or item.get("icon"), "an app is a card")

    def test_flat_links_are_pricing_then_faq_and_nothing_else(self):
        self.assertEqual(self.menu["anchors"], ["pricing", "faq"])
        self.assertNotIn("links", self.menu)
        self.assertNotIn("actions", self.menu)

    def test_pricing_is_still_dropped_when_no_plan_renders(self):
        """The rule is lms-pricing.tsx's `renders` predicate, which base asks
        before it lists a nav entry; the menu links the id and nothing else."""
        pricing = read(os.path.join(CUSTOM, "lms-pricing.tsx"))
        self.assertIn("renders: ({ plans }) => showsPricing(plans),", pricing)
        self.assertNotIn("pricing", json.dumps(self.menu["groups"]))

    def test_every_section_is_linked_exactly_once(self):
        ids = list(self.menu["anchors"])
        for group in self.menu["groups"][1:]:
            ids += [item["anchor"] for item in group["items"]]
        self.assertEqual(sorted(ids), sorted(["sessions", "subjects", "tutors", "features", "partners", "pricing", "faq"]))
        self.assertEqual(len(ids), len(set(ids)))

    def test_manifest_and_changelog_record_the_fold(self):
        manifest = load_manifest()
        self.assertIn("Since 1.23.0", manifest["_comment"]["about"])
        entry = next(i for i in manifest["installs"] if i["to"] == "components/custom/landing/lms-header-menu.ts")
        self.assertIn("Since 1.23.0", entry["_comment"])
        self.assertIn("[Explore v]  Pricing  FAQ", entry["_comment"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.22.0")[0]
        self.assertIn("## 1.23.0", changelog)
        self.assertIn("mega menu", changelog)

    def test_manifest_and_changelog_record_apps_first_and_the_floor(self):
        """1.26.0: the two base fields ship in base_sdk 1.36.0, so the
        registry and the panel partials both floor there."""
        manifest = load_manifest()
        # 1.26.0 or any later release: the apps-first layout and the floor stay.
        self.assertGreaterEqual(tuple(int(n) for n in manifest["version"].split(".")), (1, 26, 0))
        notes = manifest["_comment"]
        for key in ("components/custom/landing/header-menu.ts", "components/custom/header-menu.tsx"):
            with self.subTest(key=key):
                self.assertIn(key, manifest["requires"])
                self.assertTrue(notes[key].startswith("installed by base_sdk >= 1.36.0"), notes[key])
                self.assertIn("1.26.0", notes[key])
        entry = next(i for i in manifest["installs"] if i["to"] == "components/custom/landing/lms-header-menu.ts")
        self.assertIn("Since 1.26.0", entry["_comment"])
        self.assertIn('megaLabel: "Explore"', entry["_comment"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.25.0")[0]
        self.assertIn("## 1.26.0", changelog)
        self.assertIn("base_sdk floor is 1.36.0", changelog)
        self.assertIn('layout: "row"', changelog)
        source = code_of(HEADER_MENU)
        self.assertIn('megaLabel: "Explore",', source)
        self.assertIn('layout: "row",', source)
        self.assertEqual(source.count("layout:"), 1)


class TestBrandString(unittest.TestCase):
    """1.21.0 (Ray, 2026-09-10): the brand string is "supacharge.school",
    lowercase, wherever it is written as the brand. base_sdk 1.28.0's
    HeaderBrand has no name field - the wordmark text is the host's
    PLATFORM_NAME - so the name this SDK supplies is the site metadata's
    siteName, and the footer wordmark's accessible name says the same.

    1.22.0 (Ray, 2026-09-10): the landing HERO shows the name's STEM, never
    ".school" - derived from whatever name the shell renders ("we not hard
    coding but saying if value of x has a dot, do this") through base_sdk
    1.29.0's brandStemOf, the one stem rule the header already folds by.
    Metadata, <title>, canonical, og and the header keep the full name.

    1.24.0: base_sdk 1.32.0 renders that stem itself, on the server, when
    the hero copy declares `brand: "stem"` - so the copy declares it, the
    1.22.0 client rewrite is gone, and what this SDK still derives is the
    stem's character COUNT for the size rule, by the same brandStemOf."""

    # base_sdk 1.29.0's brandStemOf (components/custom/landing/header-menu.ts),
    # restated for the bare-node run: the composed build imports the real
    # one, which this SDK's tree does not carry. Same semantics, same edge
    # cases as base's header-brand.test.mts.
    BASE_BRAND_STEM_OF = """
const brandStemOf = (name) => {
  const trimmed = name?.trim() ?? "";
  const dot = trimmed.indexOf(".");
  if (dot <= 0) return null;
  return trimmed.slice(0, dot);
};
"""

    def hero_chars_under_node(self, names):
        code = code_of(THEME_TSX)
        match = re.search(r"^export function heroWordmarkChars\(.*?^}\n", code, re.S | re.M)
        self.assertIsNotNone(match, "heroWordmarkChars must be a top-level function")
        fn = match.group(0).replace("export function", "function", 1)
        node = shutil.which("node")
        if not node:
            raise unittest.SkipTest("node is not installed")
        driver = self.BASE_BRAND_STEM_OF + fn + """
const names = JSON.parse(process.argv[2]);
const out = {};
for (const name of names) out[name] = heroWordmarkChars(name);
process.stdout.write(JSON.stringify(out));
"""
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "hero-chars.ts")
            with open(path, "w", encoding="utf-8") as f:
                f.write(driver)
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", path, json.dumps(names)],
                capture_output=True, text=True, check=False,
            )
        self.assertEqual(run.returncode, 0, run.stderr)
        return json.loads(run.stdout)

    def test_hero_copy_declares_the_stem(self):
        """base_sdk 1.32.0's HeroConfig.brand: "stem" renders
        brandStemOf(PLATFORM_NAME) in the hero on the server, the full name
        on the element's aria-label and title. The copy declares it and
        spells no name of its own for the wordmark."""
        code = code_of(HERO_COPY)
        self.assertIn('brand: "stem",', code)
        self.assertNotRegex(code, r'brand:\s*"name"')
        self.assertNotRegex(code, r'(name|wordmark|text):\s*"[Ss]upacharge')

    def test_no_client_rewrite_of_the_hero_wordmark_remains(self):
        """1.22.0's lms-hero-wordmark.ts (a MutationObserver that rewrote
        the frame's brand span to the stem after the sections loaded) is
        gone: no module, no install, no watch, no attribute it keyed on."""
        self.assertFalse(os.path.exists(HERO_WORDMARK), HERO_WORDMARK)
        theme = code_of(THEME_TSX)
        self.assertNotIn("watchHeroWordmark", theme)
        self.assertNotIn("lms-hero-wordmark", theme)
        self.assertNotIn("textContent", theme)
        self.assertNotRegex(theme, r"observe\(root\.body")
        self.assertNotIn("data-sc-brand-name", read(THEME_CSS))
        manifest = load_manifest()
        froms = [i["from"] for i in manifest["installs"]]
        self.assertNotIn("templates/components/custom/landing/lms-hero-wordmark.ts", froms)
        for root, _dirs, files in os.walk(TEMPLATES):
            for name in files:
                if name.endswith((".ts", ".tsx", ".css")):
                    with self.subTest(file=name):
                        self.assertNotIn("data-sc-brand-name", read(os.path.join(root, name)))

    def test_hero_chars_read_the_stem_rule_from_base_and_write_no_brand(self):
        """The count follows the very name base renders (PLATFORM_NAME) by
        the very rule base derives the stem with (brandStemOf, imported -
        not restated), so the size can never follow a different text."""
        code = code_of(THEME_TSX)
        self.assertIn('import { PLATFORM_NAME } from "@/app/config/platform";', code)
        self.assertIn('import { brandStemOf } from "@/components/custom/landing/header-menu";', code)
        self.assertRegex(code, r"return \(brandStemOf\(name\) \?\? name\)\.length;")
        self.assertNotRegex(code, r"(?i)supacharge")
        self.assertNotRegex(code, r'indexOf\("\."\)|split\("\."\)', "the dot rule belongs to base's brandStemOf")

    def test_hero_chars_under_node(self):
        got = self.hero_chars_under_node(["supacharge.school", "a.b.c", "x.", "  padded.name  ", "rokct", ".x", ""])
        self.assertEqual(got["supacharge.school"], 10)
        self.assertEqual(got["a.b.c"], 1)
        self.assertEqual(got["x."], 1)
        self.assertEqual(got["  padded.name  "], 6)
        # No stem: the whole name is drawn, as base draws it (untrimmed).
        self.assertEqual(got["rokct"], 5)
        self.assertEqual(got[".x"], 2)
        self.assertEqual(got[""], 0)

    def test_hero_chars_are_in_the_first_html(self):
        """LmsTheme renders one <style> rule putting --hero-chars on the
        token class - a build constant, the same on the server and the
        client, so hydration has nothing to reconcile - and no effect
        sets it."""
        code = code_of(THEME_TSX)
        self.assertIn('HERO_CHARS_VAR = "--hero-chars"', code)
        self.assertRegex(code, r"return `\.\$\{LMS_THEME_CLASS\}\{\$\{HERO_CHARS_VAR\}:\$\{heroWordmarkChars\(name\)\}\}`;")
        self.assertIn("return <style>{heroCharsRule(PLATFORM_NAME)}</style>;", code)
        self.assertNotIn("style.setProperty", code)

    def test_hero_size_rule_is_keyed_on_the_span_base_renders(self):
        """base fits the stem to its own 250px slot; the derived size stays
        here, on the one span base's frame renders under brand: "stem"
        (hero > column > brand row > slot > padding div > span), reading
        --hero-chars with the large size as the no-count fallback. The
        1.21.0 clamp for a client-rewritten full name is gone."""
        css = read(THEME_CSS)
        selector = ".sc-landing #hero > div > div:first-child > div > div:last-child > div > span"
        rules = re.findall(re.escape(selector) + r" \{([^}]*)\}", css)
        self.assertEqual(len(rules), 1, rules)
        self.assertRegex(rules[0], r"font-size:\s*min\(72px, calc\(\(100vw - 32px\) / \(var\(--hero-chars, 1\) \* 0\.\d+\)\)\) !important;")
        self.assertIn("font-family: var(--sc-font-brand) !important;", rules[0])
        self.assertIn("color: var(--sc-ink) !important;", rules[0])
        self.assertNotIn("clamp(28px, 8.5vw, 72px)", css)
        self.assertNotIn("span > span", css)

    def test_manifest_and_changelog_retire_the_rewrite_and_name_the_floor(self):
        manifest = load_manifest()
        notes = manifest["_comment"]
        self.assertIn("Since 1.22.0 the hero wordmark shows the site name's STEM", notes["about"])
        self.assertIn("Since 1.24.0 the theme class and the hero stem are in the FIRST HTML", notes["about"])
        self.assertIn("lms-hero-wordmark.ts and the watch lms-theme.tsx started - is gone", notes["about"])
        self.assertIn("base_sdk floor is 1.32.0 since 1.24.0", notes["about"])
        self.assertIn("brandStemOf", notes["components/custom/landing/header-menu.ts"])
        self.assertIn("app/config/platform.ts", manifest["requires"])
        self.assertIn("PLATFORM_NAME", notes["app/config/platform.ts"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = changelog.split("## 1.23.0")[0]
        self.assertIn("base_sdk >= 1.32.0", head)
        self.assertIn("`brand: \"stem\"`", head)
        self.assertIn("`lms-hero-wordmark.ts`", head)
        self.assertIn("`heroWordmarkChars`", head)

    def test_site_name_is_the_brand_string(self):
        code = code_of(SITE_METADATA)
        self.assertIn('siteName: "supacharge.school",', code)
        self.assertRegex(code, r'title: "supacharge\.school — ')
        # The url #285 set stays, and the prose fields are not the brand.
        self.assertIn('url: "https://supacharge.school",', code)
        # 1.26.0 (Ray, 2026-09-10: the .app domain is dropped entirely and
        # must never be written into code again): the site url is the
        # .school host, and it is the only host this module's code writes.
        self.assertEqual(re.findall(r"https?://([A-Za-z0-9.-]+)", code), ["supacharge.school"])
        self.assertIn('locale: "en_ZA"', code)
        self.assertRegex(code, r'description:\s*"Supacharge is the tutoring app')

    def test_wordmark_accessible_name_is_the_brand_string(self):
        code = code_of(WORDMARK)
        self.assertIn('title = "supacharge.school",', code)
        self.assertIn("aria-label={title}", code)

    def test_footer_wordmark_traces_no_registered_mark(self):
        """1.26.0 (Ray, 2026-09-10: "footer supa name has (r)"; the brand
        string is supacharge.school, never decorated): the traced ® that
        used to end LMS_WORDMARK_PATH is gone from the component and from
        the two installed svg files, and the viewBox ends just past the
        "e" instead of past the mark. The name's glyphs are untouched."""
        code = code_of(WORDMARK)
        path = re.search(r'const LMS_WORDMARK_PATH =\s*"([^"]+)";', code)
        self.assertIsNotNone(path)
        subpaths = [s for s in re.split(r"(?=M)", path.group(1)) if s.strip()]
        # The name is 10 glyphs; "a", "p", "e" carry counters, so the trace
        # has more sub-paths than letters, but every one starts inside the
        # name's width - nothing starts right of the "e" (x 658.1).
        self.assertEqual(len(subpaths), 18, len(subpaths))
        starts = [float(re.match(r"M(-?\d+\.?\d*)", s).group(1)) for s in subpaths]
        self.assertLess(max(starts), 660, starts)
        self.assertNotIn("M673.1 38.1", path.group(1))
        self.assertNotIn("M662.5", path.group(1))
        self.assertIn('export const LMS_WORDMARK_VIEWBOX = "0 0 660 124";', code)
        self.assertIn("Math.round((height * 660) / 124)", code)
        for name in ("supacharge-wordmark.svg", "supacharge-wordmark-ink.svg"):
            with self.subTest(file=name):
                svg = read(os.path.join(TEMPLATES, "public", "brand", name))
                self.assertIn('viewBox="0 0 660 124" width="660" height="124"', svg)
                self.assertNotIn("M673.1 38.1", svg)
                d = re.search(r' d="([^"]+)"', svg).group(1)
                self.assertEqual(d, path.group(1), f"{name} is not the component's trace")
        for src in (code, read(FOOTER_SECTION)):
            self.assertNotIn("\u00ae", src)
            self.assertNotIn("&reg;", src)
            self.assertNotIn("00ae", src)

    def test_header_supplies_no_second_spelling(self):
        # No name field exists on base's HeaderBrand; the brand line is as
        # 1.20.0 declared it, and the name is read from site metadata.
        code = code_of(HEADER_MENU)
        self.assertIn(
            'brand: { logo: "none", collapse: { delayMs: 1500, code: marketCode } },',
            code,
        )
        self.assertNotRegex(code, r'(name|text|label|wordmark):\s*"[Ss]upacharge')

    def test_no_other_casing_of_the_brand_is_written(self):
        # Rendered code only (the comments quote the ruling, spellings and all).
        for path in (SITE_METADATA, WORDMARK, HEADER_MENU, FOOTER_SECTION):
            with self.subTest(path=os.path.basename(path)):
                code = code_of(path)
                self.assertNotRegex(code, r"Supacharge School|Supacharge\.school")
        manifest = load_manifest()
        self.assertIn('siteName "supacharge.school"', manifest["_comment"]["about"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        self.assertIn("`supacharge.school`", changelog.split("## 1.20.0")[0])

    def test_hero_wordmark_renders_no_registered_mark(self):
        """1.21.0 (Ray, 2026-09-10: "hero dont show (R) for now i want to
        check if there is any trademark"): the hero wordmark's ::after rule
        is kept but switched off - `content: none` generates no box, so no ®
        and no margin gap after the name - until the trademark check lands.
        Since 1.24.0 it sits on the span base renders."""
        css = read(THEME_CSS)
        blocks = re.findall(r"div:last-child > div > span::after \{([^}]*)\}", css)
        self.assertEqual(len(blocks), 1, blocks)
        self.assertIn("content: none;", blocks[0])
        self.assertNotRegex(blocks[0], r'content:\s*"')
        self.assertNotIn("00ae", blocks[0])
        self.assertNotIn("\u00ae", blocks[0])


class TestServerHooks(unittest.TestCase):
    """1.24.0: base_sdk 1.32.0 renders the landing on the server, and the
    theme class reaches the first HTML through PageSectionMeta.rootClass
    (joined onto the landing root by base) instead of only through the
    client effect that put it on <html> after mount - so the no-JS render
    is themed. The effect stays for what only <html> can carry."""

    def test_theme_section_declares_the_root_class(self):
        code = code_of(THEME_SECTION)
        self.assertIn("rootClass: LMS_ROOT_CLASS,", code)
        self.assertRegex(code, r"export const meta: PageSectionMeta = \{\s*order: -2,\s*nav: \[\],\s*rootClass: LMS_ROOT_CLASS,\s*\};")
        self.assertIn('import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";', code)
        self.assertIn('import { LmsTheme } from "@/components/custom/landing/lms-theme";', code)

    def test_meta_and_its_class_come_from_server_readable_modules(self):
        """base reads meta in the server render; a "use client" module's
        exports are client references there whose properties read as
        undefined (Next compiles each to registerClientReference). So the
        section and the classes module carry no directive, the component
        it renders stays the client one, and the manifest installs the
        classes module."""
        for path in (THEME_SECTION, THEME_CLASSES):
            with self.subTest(path=os.path.basename(path)):
                self.assertNotIn("use client", code_of(path))
        self.assertIn('"use client";', code_of(THEME_TSX))
        classes = code_of(THEME_CLASSES)
        self.assertIn('import { lmsBrand, lmsSans } from "./lms-fonts";', classes)
        self.assertNotIn("useEffect", classes)
        manifest = load_manifest()
        pairs = {i["from"]: i["to"] for i in manifest["installs"]}
        self.assertEqual(
            pairs.get("templates/components/custom/landing/lms-theme-classes.ts"),
            "components/custom/landing/lms-theme-classes.ts",
        )

    def test_root_class_and_effect_share_one_list(self):
        """The server's list and the effect's list are the same constant:
        the token class and the two next/font variables, joined for base."""
        code = code_of(THEME_CLASSES)
        self.assertIn('LMS_THEME_CLASS = "sc-landing"', code)
        self.assertRegex(code, r"LMS_THEME_CLASSES: readonly string\[\] = \[\s*LMS_THEME_CLASS,\s*lmsSans\.variable,\s*lmsBrand\.variable,\s*\];")
        self.assertIn('LMS_ROOT_CLASS = LMS_THEME_CLASSES.join(" ")', code)
        theme = code_of(THEME_TSX)
        self.assertIn('import { LMS_THEME_CLASS, LMS_THEME_CLASSES } from "./lms-theme-classes";', theme)
        self.assertNotRegex(theme, r'LMS_THEME_CLASS = "')

    def test_effect_is_idempotent_with_the_server_class(self):
        """<html> gets only the classes it lacks, and only those come off on
        unmount; the mode default and the mirror are unchanged."""
        code = code_of(THEME_TSX)
        self.assertIn("const added = LMS_THEME_CLASSES.filter((name) => !root.classList.contains(name));", code)
        self.assertIn("added.forEach((name) => root.classList.add(name));", code)
        self.assertIn("added.forEach((name) => root.classList.remove(name));", code)
        self.assertIn('if (defaulted) root.classList.add("dark");', code)
        self.assertIn('attributeFilter: ["class"]', code)

    def test_stylesheet_paints_the_root_and_lands_the_light_set_on_it(self):
        css = read(THEME_CSS)
        self.assertIn(".sc-landing body,\n.sc-landing:not(html) {", css)
        self.assertIn("html.sc-landing:not(.dark),\nhtml.light .sc-landing {", css)

    def test_manifest_and_changelog_name_the_floor(self):
        manifest = load_manifest()
        notes = manifest["_comment"]
        # 1.24.0 or any later release: the floor named here stays.
        self.assertGreaterEqual(tuple(int(n) for n in manifest["version"].split(".")), (1, 24, 0))
        for key in ("components/custom/landing/page-sections.ts", "components/custom/landing/hero-config.ts"):
            with self.subTest(key=key):
                self.assertIn(key, manifest["requires"])
                self.assertIn("base_sdk >= 1.32.0", notes[key])
        self.assertIn("rootClass", notes["components/custom/landing/page-sections.ts"])
        self.assertIn("HeroConfig.brand", notes["components/custom/landing/hero-config.ts"])
        pairs = {i["from"]: i for i in manifest["installs"]}
        self.assertIn("rootClass", pairs["templates/components/custom/lms-theme-section.tsx"]["_comment"])
        self.assertIn('brand: "stem"', pairs["templates/components/custom/landing/lms-hero-copy.ts"]["_comment"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = changelog.split("## 1.23.0")[0]
        self.assertTrue(head.startswith("# Changelog\n\n## "))
        self.assertIn("\n## 1.24.0\n", head)
        self.assertIn("Requires base_sdk >= 1.32.0", head)
        self.assertIn("`PageSectionMeta.rootClass`", head)


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


def dart_founder():
    """The `founder_ray_thompson` TutorProfile as seeded_tutor_catalog.dart
    writes it: each named string argument, adjacent single-quoted literals
    joined the way Dart joins them, comments dropped."""
    source = read(DART_CATALOG)
    start = source.index("id: 'founder_ray_thompson'")
    block = source[start:source.index("),", start)]
    block = re.sub(r"//[^\n]*", "", block)
    fields = {}
    for match in re.finditer(r"(\w+):\s*((?:'(?:[^'\\]|\\.)*'\s*)+)", block):
        literals = re.findall(r"'((?:[^'\\]|\\.)*)'", match.group(2))
        fields[match.group(1)] = "".join(literals)
    return fields


def ts_founder():
    """The one LMS_FOUNDERS entry as lms-founders.ts writes it."""
    source = code_of(FOUNDERS)
    block = source[source.index("export const LMS_FOUNDERS"):]
    block = block[:block.index("];")]
    return dict(re.findall(r'(\w+):\s*\n?\s*"((?:[^"\\]|\\.)*)"', block))


class TestFounderCard(unittest.TestCase):
    """1.27.0 (Ray, 2026-09-10: corporate_sdk owns /about and /team as
    renderers; Supacharge's about page reuses lms's existing founder
    card). The Flutter founder card, ported unchanged in look and copy:
    every string is the Dart catalogue's, the badge and "Hear more" words
    are the card's, the section names the about page and never the
    landing, and the base floor is the page slot's."""

    def test_every_string_is_the_dart_catalogues(self):
        dart = dart_founder()
        ts = ts_founder()
        self.assertEqual(ts["id"], dart["id"])
        for field in ("name", "title", "subject", "bio"):
            with self.subTest(field=field):
                self.assertEqual(ts[field], dart[field], field)
        self.assertEqual(dart["name"], "Ray Thompson")
        self.assertEqual(dart["title"], "To the next level")
        self.assertEqual(dart["subject"], "Supacharge")
        # The portrait and the video are the same persona folder the Dart
        # half vendors (assets/team/founders/Ray_Thompson), served by the
        # shell at /team/...: the Dart path's tail is the web path's tail.
        self.assertEqual(ts["slug"], "founders/Ray_Thompson")
        self.assertTrue(dart["photo"].endswith("/Ray_Thompson/appearance/renders/card_1080x1440.webp"), dart["photo"])
        self.assertTrue(dart["introVideoRef"].endswith("/Ray_Thompson/appearance/intro.mp4"), dart["introVideoRef"])
        self.assertEqual(ts["introVideo"], "/team/founders/Ray_Thompson/appearance/intro.mp4")
        # No other prose is written: the entry has exactly these fields.
        self.assertEqual(set(ts), {"id", "name", "title", "subject", "bio", "slug", "introVideo"})

    def test_the_portrait_is_already_shipped_and_listed(self):
        assets = read(TEAM_ASSETS)
        self.assertIn('"founders/Ray_Thompson": [', assets)
        self.assertIn('"/team/founders/Ray_Thompson/appearance/renders/card_1080x1440.webp",', assets)
        self.assertTrue(os.path.isfile(os.path.join(
            TEMPLATES, "public", "team", "founders", "Ray_Thompson", "appearance", "renders", "card_1080x1440.webp")))
        founders = code_of(FOUNDERS)
        self.assertIn('import { teamAssetsFor } from "@/components/custom/landing/team-assets";', founders)
        self.assertIn("return teamAssetsFor(founder.slug).includes(founder.introVideo) ? founder.introVideo : undefined;", founders)

    def test_badge_and_hear_more_words_are_the_flutter_cards(self):
        """tutor_card.dart: 'founder' for exactly one founder, 'co-founder'
        once more join, 'hear_more' on the back; the card reads the three
        from CardLabels and writes none of them itself."""
        dart = read(DART_TUTOR_CARD)
        for key in ("'founder'", "'co-founder'", "'hear_more'"):
            self.assertIn(key, dart)
        config = code_of(CONFIG)
        self.assertIn('founder: "Founder",', config)
        self.assertIn('coFounder: "Co-Founder",', config)
        self.assertIn('hearMore: "Hear more",', config)
        for key in ("  founder: string;", "  coFounder: string;", "  hearMore: string;"):
            self.assertIn(key, config)
        card = code_of(TUTOR_CARD)
        for word in ("Founder", "Co-Founder", "Hear more", "Tutor", "Assistant"):
            self.assertNotIn(f'"{word}"', card, f"the card writes {word} itself")
        self.assertIn("labels.coFounder", card)
        self.assertIn("labels.founder", card)
        self.assertIn("{labels.hearMore}", card)

    def test_card_founder_branch_mirrors_the_flutter_card(self):
        card = code_of(TUTOR_CARD)
        self.assertIn('export type LmsTutorCardRole = "tutor" | "assistant" | "founder";', card)
        self.assertIn('const isFounder = role === "founder";', card)
        # No grade badge, whatever the persona lists; Co-Founder past one.
        self.assertIn("const grade = isFounder ? null : gradeLabel(labels, tutor.grades);", card)
        self.assertIn("founderCount > 1", card)
        # The back: subject alone (the grade line is guarded by `grade`),
        # facts for tutors only, "Hear more" for founders only, disabled
        # with nothing wired, and the Start commitment for tutors only.
        self.assertRegex(card, r'\{isTutor && \(\s*<div className="flex flex-col gap-2">')
        self.assertIn("{isFounder && !playing && (", card)
        self.assertIn("disabled={!onHearMore}", card)
        self.assertRegex(card, r"\{isTutor && \(\s*<Link")
        self.assertEqual(card.count("labels.startWith"), 1)
        # The video plays in the card, in place of the text, and ends back to it.
        self.assertIn("const playing = isFounder && introVideo !== undefined;", card)
        self.assertIn("onEnded={introVideo.onEnded}", card)
        # Tutor and assistant cards keep their data-card prefix.
        self.assertIn('data-card={`${isFounder ? "founder" : "tutor"}:${persona.slug ?? name}`}', card)

    def test_section_names_the_about_page_and_keeps_the_contract(self):
        entry = code_of(FOUNDER_SECTION)
        self.assertIsNone(USE_CLIENT_LINE_RE.search(entry))
        self.assertIn("export const meta: PageSectionMeta = {", entry)
        self.assertIn('  page: "about",', entry)
        self.assertIn("  nav: [],", entry)
        self.assertIn("  renders: () => LMS_FOUNDERS.length > 0,", entry)
        self.assertIn('from "@/components/custom/lms-founder-section.client"', entry)
        client = code_of(FOUNDER_CLIENT)
        self.assertRegex(client.lstrip(), r'^"use client";')
        self.assertIn("useState<string | null>(null)", client)
        self.assertIn('role="founder"', client)
        self.assertIn("founderCount={founders.length}", client)
        self.assertIn("onHearMore={video ? () => setPlaying(founder.id) : undefined}", client)
        self.assertIn('import "@/components/custom/landing/lms-theme.css";', client)
        self.assertIn("${LMS_ROOT_CLASS}", client)
        # The landing's own sections never render it, and nothing on the
        # landing links to a founders anchor.
        for path in (TUTORS_SECTION, TUTORS_CLIENT, HEADER_MENU):
            self.assertNotIn("founder", code_of(path).lower(), path)
        registered = dict(registered_sections())
        self.assertEqual(registered["lms-founder-section"], FOUNDER_SECTION)
        self.assertEqual(list(registered)[-1], "lms-founder-section")

    def test_manifest_and_changelog_name_the_floor(self):
        manifest = load_manifest()
        notes = manifest["_comment"]
        self.assertIn("1.27.0", notes["about"])
        self.assertIn("1.38.0", notes["about"])
        self.assertTrue(notes["components/custom/landing/page-sections.ts"].startswith("installed by base_sdk >= 1.38.0"))
        self.assertIn("PageSectionMeta.page", notes["components/custom/landing/page-sections.ts"])
        pairs = {i["from"]: i["to"] for i in manifest["installs"]}
        for name in ("landing/lms-founders.ts", "lms-founder-section.tsx", "lms-founder-section.client.tsx"):
            self.assertEqual(pairs[f"templates/components/custom/{name}"], f"components/custom/{name}")
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = changelog.split("## 1.26.0")[0]
        self.assertIn("\n## 1.27.0\n", head)
        self.assertIn("base_sdk >=\n  1.38.0", head)
        self.assertIn("`PageSectionMeta.page`", head)
        for line in head.splitlines():
            if line.startswith("#") and line != "# Changelog":
                self.assertRegex(line, r"^## \d+\.\d+\.\d+$", line)


if __name__ == "__main__":
    unittest.main()


SECTION_LINE_RE = re.compile(r'\{ id: "([^"]+)", load: \(\) => import\("@/components/custom/([^"]+)"\) \}')
USE_CLIENT_LINE_RE = re.compile(r'^\s*(?:"use client"|\'use client\');?\s*$', re.M)


def registered_sections():
    """(registry id, entry template path) for every page-sections line the
    manifest injects - the modules base loads on the server."""
    manifest = load_manifest()
    lines = [i for i in manifest["integrations"] if i["target"] == "components/custom/landing/page-sections.ts"]
    out = []
    for line in lines:
        match = SECTION_LINE_RE.search(line["replacement"])
        assert match, line["replacement"]
        out.append((match.group(1), os.path.join(CUSTOM, match.group(2) + ".tsx")))
    return out


class TestServerSafeSections(unittest.TestCase):
    """1.24.0: base_sdk 1.32.0 loads every registered section on the server
    and reads its `meta` there, where a "use client" module's exports are
    client references whose properties read as undefined. So the ENTRY
    module of every section has no directive and exports `meta`; whatever
    needs the client lives in a sibling <name>.client.tsx that starts
    with "use client", is rendered by the entry and is installed by the
    manifest beside it."""

    def test_the_registry_names_every_section(self):
        ids = [i for i, _ in registered_sections()]
        self.assertEqual(ids, [
            "lms-theme-section", "lms-floating-nav", "lms-sessions-section",
            "lms-subjects-section", "lms-tutors-section", "lms-features-section",
            "lms-partners-section", "lms-pricing", "lms-faq-section",
            "lms-testimonials-section", "lms-footer-section",
            # 1.27.0: the founder card, registered here and drawn on /about
            # only (meta.page "about"), never on the landing.
            "lms-founder-section",
        ])

    def test_every_entry_is_installed_has_no_directive_and_exports_meta(self):
        installed = {i["to"] for i in load_manifest()["installs"]}
        for section_id, path in registered_sections():
            with self.subTest(section=section_id):
                self.assertTrue(os.path.exists(path), path)
                self.assertIn(f"components/custom/{section_id}.tsx", installed)
                code = code_of(path)
                self.assertIsNone(USE_CLIENT_LINE_RE.search(code), f"{section_id}.tsx starts a client module")
                self.assertRegex(code, r"export const meta: PageSectionMeta = ")
                self.assertRegex(code, r"export default ")
                for hook in ("useState(", "useEffect(", "useMemo(", "useMediaQuery(", "framer-motion", "window.", "document."):
                    self.assertNotIn(hook, code, f"{section_id}.tsx keeps {hook} out of the server-readable entry")

    def test_each_client_half_starts_with_the_directive_is_installed_and_rendered(self):
        manifest = load_manifest()
        pairs = {i["from"]: i["to"] for i in manifest["installs"]}
        halves = 0
        for section_id, path in registered_sections():
            client = path[:-4] + ".client.tsx"
            if not os.path.exists(client):
                continue
            halves += 1
            with self.subTest(section=section_id):
                code = code_of(client)
                self.assertRegex(code.lstrip(), r'^"use client";', f"{section_id}.client.tsx must start with the directive")
                self.assertNotIn("export const meta", code)
                self.assertEqual(
                    pairs.get(f"templates/components/custom/{section_id}.client.tsx"),
                    f"components/custom/{section_id}.client.tsx",
                )
                entry = code_of(path)
                self.assertIn(f'from "@/components/custom/{section_id}.client"', entry)
        self.assertEqual(halves, 5, "floating nav, tutors, pricing, faq and the founder section carry a client half")

    def test_pricing_keeps_its_pure_rule_in_the_entry(self):
        entry = code_of(os.path.join(CUSTOM, "lms-pricing.tsx"))
        self.assertIn("const showsPricing = (plans: LandingPlan[]) =>", entry)
        self.assertIn("renders: ({ plans }) => showsPricing(plans),", entry)
        client = code_of(os.path.join(CUSTOM, "lms-pricing.client.tsx"))
        self.assertNotIn("showsPricing", client)
        self.assertIn("if (!config || plans.length === 0) return null;", client)

    def test_manifest_and_changelog_state_the_contract(self):
        about = load_manifest()["_comment"]["about"]
        self.assertIn("Since 1.24.0 every registered section ENTRY module", about)
        self.assertIn("<name>.client.tsx", about)
        self.assertIn("`<name>.client.tsx`", read(os.path.join(SDK_ROOT, "CHANGELOG.md")))


def lift_subjects():
    """LMS_LANDING_CONFIG.subjects as node reads it: the block lifted out of
    the config literal (strings and arrays only, so it evaluates bare)."""
    source = read(CONFIG)
    match = re.search(r"^  subjects: \{\n.*?^  \},$", source, re.S | re.M)
    if not match:
        raise AssertionError("subjects block not found in lms-landing-config.ts")
    literal = "const S = {\n" + match.group(0)[len("  subjects: {\n"):-1] + ";"
    script = literal + "\nconsole.log(JSON.stringify(S));\n"
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "subjects.mts")
        with open(path, "w", encoding="utf-8") as f:
            f.write(script)
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", path],
            capture_output=True, text=True, timeout=60,
        )
    if run.returncode != 0:
        raise AssertionError(run.stderr)
    return json.loads(run.stdout.strip().splitlines()[-1])


class TestCurricula(unittest.TestCase):
    """1.25.0 - Ray, 2026-09-10: "add soon label in curriculum for
    cambridge". Cambridge joins the curriculum line as the third
    curriculum with base's MenuLabel pill after it; the subjects eyebrow
    and the Subjects feature card both render the one line."""

    def test_cambridge_is_the_last_curriculum_and_the_only_one_marked_soon(self):
        subjects = lift_subjects()
        self.assertEqual(subjects["eyebrow"], "Built for")
        self.assertEqual([c["name"] for c in subjects["curricula"]], ["CAPS", "IEB", "Cambridge"])
        self.assertEqual(subjects["curricula"][-1], {"name": "Cambridge", "badge": "soon"})
        for c in subjects["curricula"][:-1]:
            with self.subTest(curriculum=c["name"]):
                self.assertNotIn("badge", c)

    def test_the_word_soon_is_never_written_in_copy(self):
        for path in (CONFIG, CURRICULA, SUBJECTS_SECTION, FEATURES_SECTION):
            with self.subTest(path=os.path.basename(path)):
                strings = re.findall(r'"([^"\n]*)"', code_of(path))
                for text in strings:
                    if re.search(r"\bsoon\b", text, re.I):
                        self.assertEqual(text, "soon", f"'soon' only as the badge value, not copy: {text!r}")
        self.assertNotIn("Built for CAPS and IEB", code_of(CONFIG))

    def test_line_renders_the_pill_right_after_cambridge_and_nothing_disabled(self):
        source = code_of(CURRICULA)
        self.assertNotIn("use client", source)
        self.assertIn('import { MenuLabel } from "@/components/custom/menu-label";', source)
        self.assertIn('import type { Curriculum } from "@/components/custom/landing/lms-landing-config";', source)
        # The name and its pill share one non-breaking span: the pill comes
        # right after the name, on the same line, and nothing else follows.
        self.assertRegex(
            source,
            r'<span className="[^"]*whitespace-nowrap[^"]*">\s*\{item\.name\}\s*<MenuLabel badge=\{item\.badge\} />\s*</span>',
        )
        self.assertNotIn("aria-disabled", source)
        self.assertNotIn("<a", source)

    def test_separators_read_caps_comma_ieb_and_cambridge(self):
        fn = re.search(r"export function curriculumSeparator\(.*?\n\}", read(CURRICULA), re.S).group(0)
        node = shutil.which("node")
        if not node:
            raise unittest.SkipTest("node is not installed")
        script = fn + "\nconst names = ['CAPS', 'IEB', 'Cambridge'];\n" \
            "console.log(JSON.stringify(names.map((n, i) => curriculumSeparator(i, names.length) + n).join('')));\n"
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "sep.mts")
            with open(path, "w", encoding="utf-8") as f:
                f.write(script)
            run = subprocess.run(
                [node, "--experimental-strip-types", "--no-warnings", path],
                capture_output=True, text=True, timeout=60,
            )
        self.assertEqual(run.returncode, 0, run.stderr)
        self.assertEqual(json.loads(run.stdout.strip().splitlines()[-1]), "CAPS, IEB and Cambridge")

    def test_eyebrow_and_subjects_card_both_render_the_one_line(self):
        subjects = code_of(SUBJECTS_SECTION)
        self.assertNotIn("use client", subjects)
        self.assertRegex(subjects, r'<p className="sc-eyebrow">\s*<LmsCurricula />\s*</p>')
        self.assertNotIn("config.eyebrow", subjects)
        features = code_of(FEATURES_SECTION)
        self.assertNotIn("use client", features)
        self.assertIn('import { LmsCurricula } from "@/components/custom/landing/lms-curricula";', features)
        self.assertRegex(features, r'feature\.curricula \? \(\s*<li className="sc-feature-line">\s*<span>\s*<LmsCurricula />')
        card = [it for it in lift_features()["items"] if it["name"] == "Subjects"][0]
        self.assertTrue(card.get("curricula"))
        self.assertEqual(card["lines"], ["Grades 10, 11 and 12"])
        for it in lift_features()["items"]:
            if it["name"] != "Subjects":
                with self.subTest(card=it["name"]):
                    self.assertNotIn("curricula", it)

    def test_manifest_and_changelog_record_cambridge(self):
        manifest = load_manifest()
        # 1.25.0 or any later release: the line stays.
        self.assertGreaterEqual(tuple(int(n) for n in manifest["version"].split(".")), (1, 25, 0))
        entry = [e for e in manifest["installs"] if e["from"].endswith("landing/lms-curricula.tsx")]
        self.assertEqual(len(entry), 1)
        self.assertEqual(entry[0]["to"], "components/custom/landing/lms-curricula.tsx")
        self.assertIn("Cambridge", entry[0]["_comment"])
        self.assertIn("components/custom/menu-label.tsx", manifest["requires"])
        self.assertIn("1.25.0", manifest["_comment"]["about"])
        self.assertIn("Cambridge", manifest["_comment"]["components/custom/menu-label.tsx"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = changelog.split("## 1.24.0")[0]
        self.assertIn("## 1.25.0", head)
        self.assertIn("Cambridge", head)
        self.assertIn("add soon label in curriculum for cambridge", head)
        # The footer advertises the manifest version (TestVersion); it moved on with 1.26.0.
        self.assertIn(f'LMS_LANDING_VERSION = "{manifest["version"]}"', read(FOOTER_CHROME))
