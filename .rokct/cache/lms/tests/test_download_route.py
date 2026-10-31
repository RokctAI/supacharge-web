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

"""Contract tests for lms_sdk's download route (1.15.0).

Run from the repository root:

    python3 -m unittest discover -s lms/nextjs/tests -v

Ray, 2026-09-09: "there is no way we can resolve to get the direct download
link?". The release lane names every asset for its version, so the route
asks the public releases API which file is the latest and 302s to it. The
things that must never silently drift: which asset each platform picks (the
release build, never the debug build, the .aab or the updater bundle), that
a missing or broken answer falls back to the releases page and never to an
invented URL, that a platform nothing publishes is refused, and that the
handler reads no token and caches the API. The resolver is pure (no
imports, no environment) and runs here under node with types stripped, the
shape tests/test_landing_apps.py already takes.
"""

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest

from test_landing_apps import lift_apps, code_of, load_manifest, read

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
ROUTE_DIR = os.path.join(SDK_ROOT, "templates", "app", "download", "[platform]")
RESOLVE = os.path.join(ROUTE_DIR, "resolve.ts")
ROUTE = os.path.join(ROUTE_DIR, "route.ts")
LATEST_RELEASE = os.path.join(ROUTE_DIR, "latest-release.ts")
AVAILABLE_APPS = os.path.join(
    SDK_ROOT, "templates", "components", "custom", "landing", "lms-available-apps.ts"
)
FIXTURES = os.path.join(HERE, "fixtures")


def fixture(name):
    with open(os.path.join(FIXTURES, name), encoding="utf-8") as f:
        return json.load(f)


# The real latest release on 2026-10-31 (v2.8.17: no Huawei build), and the
# same release with the agreed app-huawei-v<version>.apk beside the Android
# build (1.39.0; Ray, 2026-10-31).
V2817 = fixture("release-v2.8.17.json")
V2817_HUAWEI = fixture("release-v2.8.17-huawei.json")
DOWNLOAD_2817 = "https://github.com/RokctAI/supacharge/releases/download/v2.8.17/"

RELEASES_PAGE = "https://github.com/RokctAI/supacharge/releases/latest"
RELEASES_API = "https://api.github.com/repos/RokctAI/supacharge/releases/latest"

# The v1.2.9 release as the API lists it (names and sizes real; the lane
# attaches these five every week).
DOWNLOAD = "https://github.com/RokctAI/supacharge/releases/download/v1.2.9/"
V129 = {
    "tag_name": "v1.2.9",
    "html_url": "https://github.com/RokctAI/supacharge/releases/tag/v1.2.9",
    "draft": False,
    "prerelease": False,
    "assets": [
        {"name": "app-debug-v1.2.9.apk", "browser_download_url": DOWNLOAD + "app-debug-v1.2.9.apk"},
        {"name": "app-v1.2.9.aab", "browser_download_url": DOWNLOAD + "app-v1.2.9.aab"},
        {"name": "app-v1.2.9.apk", "browser_download_url": DOWNLOAD + "app-v1.2.9.apk"},
        {"name": "app-windows-v1.2.9.zip", "browser_download_url": DOWNLOAD + "app-windows-v1.2.9.zip"},
        {"name": "update_package.zip", "browser_download_url": DOWNLOAD + "update_package.zip"},
    ],
}

# The installer the lane will attach instead of the zip (Ray, 2026-09-09).
SETUP_EXE = {
    "name": "supacharge-windows-setup-v1.3.0.exe",
    "browser_download_url": DOWNLOAD + "supacharge-windows-setup-v1.3.0.exe",
}

DRIVER = """
import {
  LMS_DOWNLOAD_PLATFORMS, LMS_RELEASES_API, LMS_RELEASES_PAGE,
  availablePlatforms, downloadPlatformOfHref, isDownloadPlatform,
  isHrefAvailable, pickAssetUrl, resolveDownload,
} from "./resolve.ts";
const cases = JSON.parse(process.argv[2]);
// appsAvailableIn (lms-available-apps.ts) over the lifted shown apps; the
// test below holds that module to this same expression.
const appsAvailableIn = (apps, release) => {
  const available = availablePlatforms(release);
  return apps.filter((app) => isHrefAvailable(app.href, available));
};
const out = {
  available: (cases.available ?? []).map((release) => availablePlatforms(release)),
  hrefPlatform: Object.fromEntries((cases.hrefs ?? []).map((h) => [h, downloadPlatformOfHref(h)])),
  hrefAvailable: (cases.hrefAvailable ?? []).map(([href, available]) => isHrefAvailable(href, available)),
  shownIn: (cases.shownIn ?? []).map(([apps, release]) => appsAvailableIn(apps, release).map((app) => app.id)),
  api: LMS_RELEASES_API,
  page: LMS_RELEASES_PAGE,
  platforms: Object.keys(LMS_DOWNLOAD_PLATFORMS),
  names: Object.fromEntries(Object.entries(LMS_DOWNLOAD_PLATFORMS).map(([k, v]) => [k, v.name])),
  is: Object.fromEntries(cases.is.map((v) => [v, isDownloadPlatform(v)])),
  pick: cases.pick.map(([release, platform]) => pickAssetUrl(release, platform)),
  resolve: cases.resolve.map(([release, platform]) => resolveDownload(release, platform)),
};
console.log(JSON.stringify(out));
"""


def run_resolver(cases):
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        shutil.copy(RESOLVE, os.path.join(tmp, "resolve.ts"))
        driver = os.path.join(tmp, "driver.ts")
        with open(driver, "w", encoding="utf-8") as f:
            f.write(DRIVER)
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", driver, json.dumps(cases)],
            capture_output=True, text=True, timeout=60, cwd=tmp,
        )
    if run.returncode != 0:
        raise AssertionError(run.stderr)
    return json.loads(run.stdout.strip().splitlines()[-1])


def with_assets(assets, **fields):
    release = dict(V129, assets=assets)
    release.update(fields)
    return release


class TestResolver(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        shuffled = with_assets(list(reversed(V129["assets"])))
        cls.out = run_resolver({
            "is": ["android", "windows", "huawei", "ios", "desktop", "", "constructor", "__proto__", "Android"],
            "pick": [
                [V129, "android"],
                [V129, "windows"],
                [shuffled, "android"],
                [shuffled, "windows"],
                [with_assets([V129["assets"][0], V129["assets"][1]]), "android"],
                [with_assets([V129["assets"][4]]), "windows"],
                [with_assets(V129["assets"], draft=True), "android"],
                [with_assets(V129["assets"], prerelease=True), "windows"],
                [with_assets([{"name": "app-v1.2.9.apk", "browser_download_url": "http://insecure/app.apk"}]), "android"],
                [with_assets([{"name": "app-v1.2.9.apk"}, None, "junk"]), "android"],
                [with_assets("not a list"), "android"],
                [None, "android"],
                ["a string", "windows"],
                [with_assets([{"name": "app-v2.0.0-rc.1.apk", "browser_download_url": DOWNLOAD + "app-v2.0.0-rc.1.apk"}]), "android"],
                # Ray, 2026-09-09: Windows ships one installer instead of the zip.
                [with_assets([SETUP_EXE]), "windows"],
                [with_assets(V129["assets"] + [SETUP_EXE]), "windows"],
                [with_assets([SETUP_EXE] + V129["assets"]), "windows"],
                [with_assets([{"name": "supacharge-windows-setup-v1.3.0.exe", "browser_download_url": "http://insecure/setup.exe"}, V129["assets"][3]]), "windows"],
                [with_assets([SETUP_EXE]), "android"],
            ],
            "resolve": [
                [V129, "android"],
                [V129, "windows"],
                [with_assets([]), "android"],
                [{"html_url": "http://not-https/tag/v9", "assets": []}, "windows"],
                [None, "windows"],
                [{"message": "API rate limit exceeded"}, "android"],
            ],
        })

    def test_constants_name_the_public_api_and_the_page(self):
        self.assertEqual(self.out["api"], RELEASES_API)
        self.assertEqual(self.out["page"], RELEASES_PAGE)

    def test_the_platform_table_lists_patterns_in_preference_order(self):
        source = read(RESOLVE)
        self.assertIn("-windows-setup-v", source)
        self.assertLess(source.index("-windows-setup-v"), source.index("app-windows-v\\d"), "installer before zip")

    def test_the_platforms_are_android_huawei_and_windows_and_nothing_publishes_ios(self):
        self.assertEqual(self.out["platforms"], ["android", "huawei", "windows"])
        self.assertEqual(
            self.out["names"],
            {"android": "Android", "huawei": "Huawei", "windows": "Windows"},
        )
        self.assertEqual(
            self.out["is"],
            {"android": True, "windows": True, "huawei": True, "ios": False, "desktop": False,
             "": False, "constructor": False, "__proto__": False, "Android": False},
        )

    def test_each_platform_picks_its_release_build_whatever_the_order(self):
        pick = self.out["pick"]
        self.assertEqual(pick[0], DOWNLOAD + "app-v1.2.9.apk")
        self.assertEqual(pick[1], DOWNLOAD + "app-windows-v1.2.9.zip")
        self.assertEqual(pick[2], DOWNLOAD + "app-v1.2.9.apk", "debug build listed first must not win")
        self.assertEqual(pick[3], DOWNLOAD + "app-windows-v1.2.9.zip")

    def test_the_debug_build_the_aab_and_the_updater_bundle_never_match(self):
        pick = self.out["pick"]
        self.assertIsNone(pick[4], "only app-debug and the .aab present: no Android download")
        self.assertIsNone(pick[5], "only update_package.zip present: no Windows download")

    def test_unpublished_releases_and_broken_answers_pick_nothing(self):
        pick = self.out["pick"]
        self.assertIsNone(pick[6], "draft")
        self.assertIsNone(pick[7], "prerelease")
        self.assertIsNone(pick[8], "a non-https asset url")
        self.assertIsNone(pick[9], "assets without a url, or not objects")
        self.assertIsNone(pick[10], "assets not a list")
        self.assertIsNone(pick[11], "no release")
        self.assertIsNone(pick[12], "release not an object")

    def test_a_prerelease_style_version_in_the_name_still_matches(self):
        self.assertEqual(self.out["pick"][13], DOWNLOAD + "app-v2.0.0-rc.1.apk")

    def test_windows_prefers_the_installer_then_the_zip_then_nothing(self):
        pick = self.out["pick"]
        self.assertEqual(pick[14], DOWNLOAD + "supacharge-windows-setup-v1.3.0.exe", "installer alone")
        self.assertEqual(pick[15], DOWNLOAD + "supacharge-windows-setup-v1.3.0.exe", "installer listed after the zip still wins")
        self.assertEqual(pick[16], DOWNLOAD + "supacharge-windows-setup-v1.3.0.exe", "installer listed first")
        self.assertEqual(pick[3], DOWNLOAD + "app-windows-v1.2.9.zip", "zip when no installer (today's releases)")
        self.assertEqual(pick[17], DOWNLOAD + "app-windows-v1.2.9.zip", "an installer with a non-https url is skipped, the zip stands in")
        self.assertIsNone(pick[18], "the installer is not an Android download")
        self.assertIsNone(pick[5], "neither installer nor zip: nothing, so the route falls back to the page")

    def test_resolve_is_direct_when_the_asset_exists_and_the_page_otherwise(self):
        resolve = self.out["resolve"]
        self.assertEqual(resolve[0], {"url": DOWNLOAD + "app-v1.2.9.apk", "direct": True})
        self.assertEqual(resolve[1], {"url": DOWNLOAD + "app-windows-v1.2.9.zip", "direct": True})
        # The release's own page when the API gave one.
        self.assertEqual(resolve[2], {"url": V129["html_url"], "direct": False})
        # A page url that is not https is not trusted either.
        self.assertEqual(resolve[3], {"url": RELEASES_PAGE, "direct": False})
        self.assertEqual(resolve[4], {"url": RELEASES_PAGE, "direct": False})
        self.assertEqual(resolve[5], {"url": RELEASES_PAGE, "direct": False})


class TestHuaweiAndAvailability(unittest.TestCase):
    """1.39.0 (Ray, 2026-10-31): the AppGallery badge shows only when the
    latest release carries a separate Huawei build, app-huawei-v<version>.apk
    beside app-v<version>.apk; /download/huawei never hands out the Android
    file; every badge whose file is missing is hidden; a failed fetch hides
    them all."""

    @classmethod
    def setUpClass(cls):
        cls.shown = lift_apps(shown=True)
        huawei_only = with_assets([
            {"name": "app-huawei-v1.2.9.apk", "browser_download_url": DOWNLOAD + "app-huawei-v1.2.9.apk"},
        ])
        cls.out = run_resolver({
            "is": [],
            "pick": [
                [V2817, "huawei"],
                [V2817_HUAWEI, "huawei"],
                [V2817_HUAWEI, "android"],
                [dict(V2817_HUAWEI, assets=list(reversed(V2817_HUAWEI["assets"]))), "android"],
                [huawei_only, "android"],
                [V2817, "android"],
                [V2817, "windows"],
                [with_assets([{"name": "app-huawei-debug-v1.2.9.apk", "browser_download_url": DOWNLOAD + "x.apk"}]), "huawei"],
                [with_assets([{"name": "app-huawei-v1.2.9.aab", "browser_download_url": DOWNLOAD + "x.aab"}]), "huawei"],
            ],
            "resolve": [
                [V2817, "huawei"],
                [V2817_HUAWEI, "huawei"],
                [None, "huawei"],
            ],
            "available": [V2817, V2817_HUAWEI, V129, huawei_only, None, {"message": "API rate limit exceeded"},
                          with_assets(V129["assets"], draft=True), with_assets([])],
            "hrefs": ["/download/huawei", "/download/android", "/download/windows", "/download/ios",
                      "/download/huawei/x", "https://store.example/x", RELEASES_PAGE],
            "hrefAvailable": [
                ["/download/huawei", ["android", "windows"]],
                ["/download/huawei", ["android", "huawei", "windows"]],
                ["/download/ios", ["android", "huawei", "windows"]],
                ["https://appgallery.example/listing", []],
                [RELEASES_PAGE, []],
            ],
            "shownIn": [
                [cls.shown, V2817],
                [cls.shown, V2817_HUAWEI],
                [cls.shown, V129],
                [cls.shown, huawei_only],
                [cls.shown, None],
                [cls.shown, {"message": "API rate limit exceeded"}],
                [lift_apps(overrides={"huawei": {"storeUrl": "https://appgallery.example/listing"}}, shown=True), None],
            ],
        })

    def test_the_android_pattern_never_matches_the_huawei_file(self):
        pick = self.out["pick"]
        self.assertEqual(pick[2], DOWNLOAD_2817 + "app-v2.8.17.apk")
        self.assertEqual(pick[3], DOWNLOAD_2817 + "app-v2.8.17.apk", "huawei listed first must not win")
        self.assertIsNone(pick[4], "a release with only the Huawei file has no Android download")
        self.assertNotRegex("app-huawei-v2.8.17.apk", r"^app-v\d")

    def test_huawei_picks_its_own_file_and_nothing_else(self):
        pick = self.out["pick"]
        self.assertIsNone(pick[0], "v2.8.17 carries no Huawei build")
        self.assertEqual(pick[1], DOWNLOAD_2817 + "app-huawei-v2.8.17.apk")
        self.assertIsNone(pick[7], "not a debug build")
        self.assertIsNone(pick[8], "not an .aab")
        # Today's release still serves Android and the Windows installer.
        self.assertEqual(pick[5], DOWNLOAD_2817 + "app-v2.8.17.apk")
        self.assertEqual(pick[6], DOWNLOAD_2817 + "supacharge-windows-setup-v2.8.17.exe")

    def test_download_huawei_without_the_file_goes_to_the_page_never_to_android(self):
        resolve = self.out["resolve"]
        self.assertEqual(resolve[0], {"url": V2817["html_url"], "direct": False})
        self.assertNotIn("app-v", resolve[0]["url"])
        self.assertEqual(resolve[1], {"url": DOWNLOAD_2817 + "app-huawei-v2.8.17.apk", "direct": True})
        self.assertEqual(resolve[2], {"url": RELEASES_PAGE, "direct": False})

    def test_available_platforms_are_the_ones_with_a_file(self):
        self.assertEqual(
            self.out["available"],
            [
                ["android", "windows"],
                ["android", "huawei", "windows"],
                ["android", "windows"],
                ["huawei"],
                [],
                [],
                [],
                [],
            ],
        )

    def test_href_platforms_and_availability(self):
        self.assertEqual(
            self.out["hrefPlatform"],
            {"/download/huawei": "huawei", "/download/android": "android",
             "/download/windows": "windows", "/download/ios": None,
             "/download/huawei/x": None, "https://store.example/x": None,
             RELEASES_PAGE: None},
        )
        self.assertEqual(self.out["hrefAvailable"], [False, True, False, True, True])

    def test_badges_shown_and_hidden_by_the_release(self):
        shown_in = self.out["shownIn"]
        self.assertEqual(shown_in[0], ["android", "desktop"], "today: no AppGallery badge")
        self.assertEqual(shown_in[1], ["android", "huawei", "desktop"], "Huawei build attached: badge shown")
        self.assertEqual(shown_in[2], ["android", "desktop"])
        self.assertEqual(shown_in[3], ["huawei"], "Android and Windows hidden when their files are missing")
        self.assertEqual(shown_in[4], [], "a failed fetch hides every direct download")
        self.assertEqual(shown_in[5], [])
        self.assertEqual(shown_in[6], ["huawei"], "a store listing is not a release file and stays")

    def test_the_landing_filters_with_the_same_expression(self):
        source = code_of(AVAILABLE_APPS)
        self.assertIn(
            "const available = availablePlatforms(release);\n"
            "  return LMS_SHOWN_APPS.filter((app) => isHrefAvailable(app.href, available));",
            source,
        )
        self.assertIn("await fetchLatestRelease()", source)
        self.assertIn('from "@/app/download/[platform]/latest-release"', source)
        self.assertIn('typeof window === "undefined"', source)

    def test_the_huawei_entry_links_to_its_own_route(self):
        by_id = {app["id"]: app for app in self.shown}
        self.assertEqual(by_id["huawei"]["href"], "/download/huawei")


class TestRouteHandler(unittest.TestCase):
    def setUp(self):
        self.source = code_of(ROUTE)

    def test_route_is_installed_beside_its_resolver(self):
        self.assertTrue(os.path.isfile(ROUTE))
        self.assertTrue(os.path.isfile(RESOLVE))
        installs = {entry["to"] for entry in load_manifest()["installs"]}
        self.assertIn("app/download", installs)

    def test_handler_reads_no_token_and_no_environment(self):
        fetcher = code_of(LATEST_RELEASE)
        for source in (self.source, fetcher):
            self.assertNotIn("process.env", source)
            self.assertNotRegex(source, r"(?i)authorization|token|secret")
            self.assertNotIn("api.github.com", source, "the URL lives in resolve.ts")
        self.assertIn("LMS_RELEASES_API", fetcher)

    def test_handler_caches_the_api_for_ten_minutes(self):
        """1.39.0: the fetch lives in latest-release.ts, shared by the route
        and the landing's badges - one request, one cache window."""
        fetcher = code_of(LATEST_RELEASE)
        self.assertIn("LMS_RELEASE_REVALIDATE_SECONDS = 600", fetcher)
        self.assertIn("next: { revalidate: LMS_RELEASE_REVALIDATE_SECONDS }", fetcher)
        self.assertIn('import { fetchLatestRelease } from "./latest-release";', self.source)
        self.assertNotRegex(self.source, r"(?<![\w.])fetch\(", "the route makes no fetch of its own")

    def test_handler_redirects_302_refuses_unknown_platforms_and_ignores_prefetches(self):
        self.assertIn("status: 302", self.source)
        self.assertIn("status: 404", self.source)
        self.assertIn("status: 204", self.source)
        self.assertIn("isDownloadPlatform(platform)", self.source)
        for header in ("next-router-prefetch", "rsc", "purpose"):
            self.assertIn(f'"{header}"', self.source)
        self.assertIn("resolveDownload(release, platform)", self.source)

    def test_resolver_imports_nothing(self):
        self.assertNotRegex(code_of(RESOLVE), r"^\s*import\s", "the resolver must stay import-free so node runs it bare")
        self.assertNotIn("process.env", read(RESOLVE))


class TestAppsPointAtTheRoute(unittest.TestCase):
    def test_every_shown_app_names_a_platform_the_route_serves(self):
        platforms = run_resolver({"is": [], "pick": [], "resolve": []})["platforms"]
        for app in lift_apps():
            if not app["shown"]:
                continue
            with self.subTest(app=app["id"]):
                match = re.fullmatch(r"/download/([a-z]+)", app["href"])
                self.assertIsNotNone(match, app["href"])
                self.assertIn(match.group(1), platforms)


if __name__ == "__main__":
    unittest.main()
