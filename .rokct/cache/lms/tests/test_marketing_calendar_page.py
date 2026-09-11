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

"""The living marketing calendar's admin page (lms_sdk 1.28.0).

Run from the repository root:

    python3 -m unittest discover -s lms/nextjs/tests -v

Ray, 2026-09-11: "i want it alive like schedule move as time pass". The
things that must never silently drift: that the page loads its data in the
server render and never in an effect, that the entry module carries no
client directive while the copy button does, that every word is read
through the shell's `t` under one prefix with its English beside it, that
the rules list what is underway and what is to come and never the past,
that the countdown and the date ranges read as they should, that the four
files are installed and the i18n requirement named, and that nothing in
this half writes the brand or a host. The rules module is pure and
import-free and runs here under node with types stripped, the shape
tests/test_download_route.py takes; one case feeds it the BACKEND's own
answer for the snapshot day, computed by rlms/marketing_calendar.py, so
the two halves are held to one contract.
"""

import importlib.util
import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from datetime import date

from test_landing_apps import code_of, load_manifest, read

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
TEMPLATES = os.path.join(SDK_ROOT, "templates")
CUSTOM = os.path.join(TEMPLATES, "components", "custom")
RULES = os.path.join(CUSTOM, "landing", "lms-calendar-rules.ts")
ENTRY = os.path.join(CUSTOM, "lms-marketing-calendar.tsx")
CLIENT = os.path.join(CUSTOM, "lms-marketing-calendar.client.tsx")
PAGE = os.path.join(TEMPLATES, "app", "admin", "calendar", "page.tsx")
ACTIONS = os.path.join(TEMPLATES, "app", "actions", "handson", "all", "lms", "calendar", "actions.ts")
TYPES = os.path.join(TEMPLATES, "app", "actions", "handson", "all", "lms", "calendar", "types.ts")
SERVICE = os.path.join(TEMPLATES, "app", "services", "all", "lms", "marketing-calendar.ts")
FOOTER_CHROME = os.path.join(CUSTOM, "landing", "lms-footer-chrome.ts")
FRAPPE_MANIFEST = os.path.join(SDK_ROOT, os.pardir, "frappe", "manifest.json")
BACKEND_MODULE = os.path.join(
    SDK_ROOT, os.pardir, "frappe", "src", "tenant", "rlms", "marketing_calendar.py"
)

NEW_FILES = {
    "rules": RULES,
    "entry": ENTRY,
    "client": CLIENT,
    "page": PAGE,
    "actions": ACTIONS,
    "types": TYPES,
    "service": SERVICE,
}

PREFIX = "app.lms.calendar"

#: The day the snapshot document was written (11 September 2026).
SNAPSHOT_DAY = "2026-09-11"

USE_CLIENT_LINE_RE = re.compile(r'^\s*"use client";', re.M)

DRIVER = """
import * as rules from "./lms-calendar-rules.ts";
const cases = JSON.parse(process.argv[2]);
const spec = (s) => ({ key: s.key, fallback: s.fallback, params: s.params ?? null });
const out = {
  prefix: rules.LABEL_PREFIX,
  limit: rules.UPCOMING_LIMIT,
  statusLabels: Object.fromEntries(Object.entries(rules.STATUS_LABELS).map(([k, v]) => [k, spec(v)])),
  kindLabels: Object.fromEntries(Object.entries(rules.KIND_LABELS).map(([k, v]) => [k, spec(v)])),
  variants: Object.fromEntries(cases.statuses.map((s) => [s, rules.statusVariant(s)])),
  countdown: cases.countdown.map((e) => spec(rules.countdown(e))),
  ranges: cases.ranges.map(([a, b]) => rules.formatRange(a, b)),
  dates: cases.dates.map((d) => rules.formatDate(d)),
  webcal: cases.webcal.map((u) => rules.webcalUrl(u)),
  upcoming: cases.upcoming.map(([cal, limit]) =>
    (limit === null ? rules.upcomingWindows(cal) : rules.upcomingWindows(cal, limit)).map((e) => e.id)),
  rangeLabels: cases.rangeLabels.map((e) => spec(rules.rangeLabel(e))),
};
console.log(JSON.stringify(out));
"""


def run_rules(cases):
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        shutil.copy(RULES, os.path.join(tmp, "lms-calendar-rules.ts"))
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


def event(event_id, start, end, days_until, days_until_end, active, kind="campaign"):
    return {
        "id": event_id, "kind": kind, "status": "gazetted", "label": event_id,
        "start": start, "end": end, "theme": None,
        "days_until": days_until, "days_until_end": days_until_end, "active": active,
    }


def backend_calendar(today):
    """The backend's own answer for [today], as api.lms.marketing_calendar
    would serialise it (rlms/marketing_calendar.build_calendar, then
    to_json_ready) - the contract the page draws."""
    spec = importlib.util.spec_from_file_location("rlms_marketing_calendar_for_page", BACKEND_MODULE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.to_json_ready(module.build_calendar(date.fromisoformat(today)))


EMPTY = {
    "prefix": None, "statuses": [], "countdown": [], "ranges": [], "dates": [],
    "webcal": [], "upcoming": [], "rangeLabels": [],
}


class TestRules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        events = [
            event("past", "2026-08-01", "2026-08-10", -41, -32, False),
            event("underway-late", "2026-09-03", "2026-09-23", -8, 12, True),
            event("underway-early", "2026-09-01", "2026-09-30", -10, 19, True),
            event("soon", "2026-09-15", "2026-10-12", 4, 31, False),
            event("later", "2026-10-06", "2026-10-06", 25, 25, False, kind="term_open"),
            event("open-ended", "2027-12-09", None, 454, None, False, kind="holiday"),
        ]
        cls.out = run_rules(dict(EMPTY, **{
            "statuses": ["gazetted", "published", "customary", "school_set", "approximate"],
            "countdown": [
                {"days_until": 4, "days_until_end": 31, "active": False},
                {"days_until": 1, "days_until_end": 1, "active": False},
                {"days_until": 0, "days_until_end": 0, "active": True},
                {"days_until": 0, "days_until_end": 9, "active": True},
                {"days_until": -8, "days_until_end": 12, "active": True},
                {"days_until": -8, "days_until_end": 0, "active": True},
                {"days_until": -8, "days_until_end": None, "active": True},
                {"days_until": -41, "days_until_end": -32, "active": False},
                {"days_until": -3, "days_until_end": -1, "active": False},
                {"days_until": -1, "days_until_end": None, "active": False},
            ],
            "ranges": [
                ["2026-10-06", "2026-10-06"],
                ["2026-09-03", "2026-09-23"],
                ["2026-10-13", "2026-11-26"],
                ["2026-12-10", "2027-01-12"],
                ["2027-12-09", None],
            ],
            "dates": ["2026-09-11", "2027-01-05", "junk"],
            "webcal": ["https://site.invalid/api/method/x", "http://site.invalid/x", "webcal://already"],
            "upcoming": [
                [{"events": events}, None],
                [{"events": events}, 2],
                [{"events": events}, 0],
                [{"events": []}, None],
            ],
            "rangeLabels": [
                {"start": "2026-09-03", "end": "2026-09-23"},
                {"start": "2027-12-09", "end": None},
            ],
        }))

    def test_upcoming_lists_underway_first_then_to_come_never_the_past(self):
        self.assertEqual(
            self.out["upcoming"][0],
            ["underway-early", "underway-late", "soon", "later", "open-ended"],
        )
        self.assertEqual(self.out["upcoming"][3], [])

    def test_upcoming_is_capped(self):
        self.assertEqual(self.out["upcoming"][1], ["underway-early", "underway-late"])
        self.assertEqual(self.out["upcoming"][2], [])
        self.assertEqual(self.out["limit"], 14)

    def test_countdown_wording(self):
        got = [(c["key"].split(".")[-1], c["params"]) for c in self.out["countdown"]]
        self.assertEqual(got, [
            ("in_days", {"days": "4"}),
            ("tomorrow", None),
            ("today", None),
            ("starts_today_left", {"days": "9"}),
            ("underway_left", {"days": "12"}),
            ("last_day", None),
            ("underway", None),
            ("ended_days_ago", {"days": "32"}),
            ("ended_yesterday", None),
            ("started_yesterday", None),
        ])
        self.assertEqual(self.out["countdown"][0]["fallback"], "in {{days}} days")
        self.assertEqual(self.out["countdown"][4]["fallback"], "underway, {{days}} days left")

    def test_date_ranges_read_day_first(self):
        self.assertEqual(self.out["ranges"], [
            "6 Oct 2026",
            "3 – 23 Sep 2026",
            "13 Oct – 26 Nov 2026",
            "10 Dec 2026 – 12 Jan 2027",
            "from 9 Dec 2027",
        ])
        self.assertEqual(self.out["dates"], ["11 Sep 2026", "5 Jan 2027", "junk"])
        self.assertEqual(self.out["rangeLabels"][0]["fallback"], "3 – 23 Sep 2026")
        self.assertEqual(self.out["rangeLabels"][1]["key"], PREFIX + ".from_date")
        self.assertEqual(self.out["rangeLabels"][1]["params"], {"date": "9 Dec 2027"})

    def test_status_badges(self):
        self.assertEqual(self.out["variants"], {
            "gazetted": "default", "published": "default", "customary": "secondary",
            "school_set": "secondary", "approximate": "outline",
        })
        self.assertEqual(self.out["statusLabels"]["published"]["fallback"], "Published")
        self.assertEqual(self.out["statusLabels"]["customary"]["fallback"], "Customary")
        self.assertEqual(self.out["statusLabels"]["school_set"]["fallback"], "School-set")

    def test_webcal_link(self):
        self.assertEqual(self.out["webcal"], [
            "webcal://site.invalid/api/method/x", "webcal://site.invalid/x", "webcal://already",
        ])

    def test_every_label_key_sits_under_the_prefix(self):
        self.assertEqual(self.out["prefix"], PREFIX)
        specs = list(self.out["statusLabels"].values()) + list(self.out["kindLabels"].values())
        specs += self.out["countdown"] + self.out["rangeLabels"]
        for label in specs:
            with self.subTest(key=label["key"]):
                self.assertTrue(label["key"].startswith(PREFIX + "."), label["key"])
                self.assertTrue(label["fallback"])

    def test_rules_module_is_import_free(self):
        code = code_of(RULES)
        self.assertNotRegex(code, r"^\s*import ", "the rules must run under bare node")
        self.assertNotRegex(code, r"^\s*export \* from", "the rules must run under bare node")


class TestBackendContract(unittest.TestCase):
    """The page reads the backend's own answer: the snapshot day's calendar
    from rlms/marketing_calendar.py through the rules under node."""

    @classmethod
    def setUpClass(cls):
        cls.calendar = backend_calendar(SNAPSHOT_DAY)
        cls.out = run_rules(dict(EMPTY, **{
            "upcoming": [[cls.calendar, None], [cls.calendar, 200]],
            "countdown": [cls.calendar["next_campaign"]] + cls.calendar["active"],
            "ranges": [[e["start"], e["end"]] for e in cls.calendar["active"]],
        }))

    def test_snapshot_day_reads_week_8_of_term_3_and_the_finals_push_next(self):
        now = self.calendar["now"]
        self.assertTrue(now["in_term"])
        self.assertEqual(now["term"]["label"], "Term 3 2026")
        self.assertEqual(now["week_of_term"], 8)
        self.assertEqual(now["days_left_in_term"], 12)
        self.assertEqual(self.calendar["next_campaign"]["id"], "campaign-finals-2026")
        self.assertEqual(self.out["countdown"][0]["params"], {"days": "4"})

    def test_the_list_opens_with_the_prelims_underway_and_never_shows_the_past(self):
        listed = self.out["upcoming"][0]
        self.assertEqual(listed[0], "prelims-2026")
        self.assertEqual(len(listed), 14)
        self.assertNotIn("term-open-2026-3", listed)
        everything = self.out["upcoming"][1]
        by_id = {e["id"]: e for e in self.calendar["events"]}
        self.assertTrue(all(by_id[i]["active"] or by_id[i]["days_until"] > 0 for i in everything))
        self.assertIn("term-close-2027-4", everything)
        self.assertEqual(self.out["ranges"][0], "3 – 23 Sep 2026")

    def test_every_status_the_backend_answers_has_a_badge(self):
        rules = read(RULES)
        for status in {e["status"] for e in self.calendar["events"]}:
            with self.subTest(status=status):
                self.assertIn(f"{status}: spec(", rules)


class TestPageShape(unittest.TestCase):
    def test_page_is_a_server_component_that_loads_in_the_render(self):
        code = code_of(PAGE)
        self.assertIsNone(USE_CLIENT_LINE_RE.search(code))
        self.assertIn("export default async function AdminMarketingCalendarPage", code)
        self.assertIn('from "@/app/actions/handson/all/lms/calendar/actions"', code)
        self.assertIn("await fetchMarketingCalendar()", code)
        self.assertIn('export const dynamic = "force-dynamic";', code)
        for hook in ("useEffect(", "useState(", "window.", "document."):
            self.assertNotIn(hook, code)
        self.assertIn("<LmsMarketingCalendar calendar={calendar} />", code)
        self.assertIn("<LmsMarketingCalendarDenied />", code)

    def test_entry_has_no_directive_and_the_client_half_does(self):
        entry = code_of(ENTRY)
        self.assertIsNone(USE_CLIENT_LINE_RE.search(entry))
        for hook in ("useState(", "useEffect(", "window.", "document.", "navigator."):
            self.assertNotIn(hook, entry)
        client = code_of(CLIENT)
        self.assertRegex(client.lstrip(), r'^"use client";')
        self.assertIn("navigator.clipboard.writeText(value)", client)
        self.assertIn("export function LmsCopyLinkButton", client)
        self.assertIn('from "@/components/custom/lms-marketing-calendar.client"', entry)
        self.assertIn("<LmsCopyLinkButton", entry)

    def test_entry_draws_now_next_upcoming_and_subscribe(self):
        code = code_of(ENTRY)
        for piece in (
            "function NowCard", "function NextCard", "function WindowRow", "function SubscribeCard",
            "upcomingWindows(calendar)", "webcalUrl(calendar.feed_url)", "countdown(", "formatRange(",
            "StatusBadge", "export function LmsMarketingCalendar", "export function LmsMarketingCalendarDenied",
            "calendar.calendar_name", "calendar.feed_url", "week_of_term", "days_left_in_term",
            "days_until_opening", "next_campaign",
        ):
            with self.subTest(piece=piece):
                self.assertIn(piece, code)

    def test_every_word_is_read_through_the_shells_t(self):
        code = code_of(ENTRY)
        self.assertIn('import t from "@/app/lib/i18n";', code)
        self.assertIn("const value = t(key, params);", code)
        names = set(re.findall(r'\bL\(\s*"([a-z_]+)"', code))
        for name in (
            "title", "subtitle", "now_eyebrow", "next_eyebrow", "upcoming_heading",
            "subscribe_eyebrow", "subscribe_link", "copy_link", "copied", "denied",
            "week_of_term", "days_left_in_term", "days_until_opening", "holiday_after",
            "computed_on", "no_next", "no_upcoming", "feed_token_hint",
        ):
            with self.subTest(name=name):
                self.assertIn(name, names)
        # No raw English between tags: every text node is an expression.
        jsx_text = re.findall(r">\s*([A-Za-z][^<{}]*?)\s*<", code)
        self.assertEqual(jsx_text, [], jsx_text)
        self.assertRegex(code, r'word\(`\$\{LABEL_PREFIX\}\.\$\{name\}`')

    def test_action_gates_with_the_host_role_first(self):
        code = code_of(ACTIONS)
        self.assertRegex(code.lstrip(), r'^"use server";')
        self.assertIn('from "@/app/lib/roles"', code)
        self.assertIn("if (!(await verifyLmsRole())) return null;", code)
        self.assertIn("MarketingCalendarService.getCalendar(today)", code)

    def test_service_calls_the_whitelisted_alias_and_degrades_to_null(self):
        code = code_of(SERVICE)
        self.assertIn('"api.lms.marketing_calendar"', code)
        self.assertIn("extends BaseService", code)
        self.assertIn("return null;", code)
        self.assertNotIn("throw ", code)
        self.assertIn('from "@/app/services/common/base"', code)

    def test_types_are_the_rules_wire_types(self):
        code = code_of(TYPES)
        self.assertIn('from "@/components/custom/landing/lms-calendar-rules"', code)
        for name in ("MarketingCalendar", "CalendarEvent", "CalendarNow", "CalendarStatus"):
            self.assertIn(name, code)
        entry = code_of(ENTRY)
        self.assertIn("type MarketingCalendar", entry)

    def test_no_brand_host_or_placeholder_in_the_calendar_files(self):
        for name, path in NEW_FILES.items():
            code = code_of(path)  # the licence header names gnu.org
            with self.subTest(file=name):
                self.assertNotRegex(code, r"(?i)supacharge")
                self.assertNotRegex(code, r"https?://", "no host: the feed URL comes from the backend")
                self.assertNotRegex(code, r"(?i)\b(demo|sample|example|lorem)\b")

    def test_aliases_are_registered_in_the_backend_manifest(self):
        with open(FRAPPE_MANIFEST, encoding="utf-8") as f:
            methods = json.load(f)["app_type"]["tenant"]["hooks"]["whitelisted_methods"]
        self.assertIn("{app_name}.api.lms.marketing_calendar", methods)
        self.assertIn("{app_name}.api.lms.marketing_calendar_ics", methods)
        self.assertTrue(methods["{app_name}.api.lms.marketing_calendar"].endswith(".get_calendar"))


class TestManifest(unittest.TestCase):
    def test_the_four_files_are_installed_with_comments(self):
        pairs = {i["from"]: i for i in load_manifest()["installs"]}
        for source, dest in (
            ("templates/app/admin/calendar/page.tsx", "app/admin/calendar/page.tsx"),
            ("templates/components/custom/lms-marketing-calendar.tsx", "components/custom/lms-marketing-calendar.tsx"),
            ("templates/components/custom/lms-marketing-calendar.client.tsx", "components/custom/lms-marketing-calendar.client.tsx"),
            ("templates/components/custom/landing/lms-calendar-rules.ts", "components/custom/landing/lms-calendar-rules.ts"),
        ):
            with self.subTest(source=source):
                self.assertIn(source, pairs)
                self.assertEqual(pairs[source]["to"], dest)
                self.assertIn("1.28.0", pairs[source]["_comment"])
                self.assertTrue(os.path.exists(os.path.join(SDK_ROOT, source)))

    def test_actions_and_service_ride_the_directory_mappings(self):
        tos = {i["to"] for i in load_manifest()["installs"]}
        self.assertIn("app/actions/handson/all/lms", tos)
        self.assertIn("app/services/all/lms", tos)
        self.assertTrue(os.path.exists(ACTIONS))
        self.assertTrue(os.path.exists(SERVICE))

    def test_i18n_is_required_and_explained(self):
        manifest = load_manifest()
        self.assertIn("app/lib/i18n/index.ts", manifest["requires"])
        self.assertIn(PREFIX, manifest["_comment"]["app/lib/i18n/index.ts"])
        self.assertIn("1.28.0", manifest["_comment"]["app/lib/i18n/index.ts"])

    def test_about_and_changelog_name_the_calendar(self):
        manifest = load_manifest()
        self.assertIn("i want it alive like schedule move as time pass", manifest["_comment"]["about"])
        self.assertIn("api.lms.marketing_calendar_ics", manifest["_comment"]["about"])
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = " ".join(changelog.split("## 1.27.0")[0].split())
        self.assertIn("## 1.28.0", head)
        self.assertIn("i want it alive like schedule move as time pass", head)
        self.assertIn("nsc_exam_windows.json", head)
        self.assertIn("marketing_calendar_feed_token", head)
        self.assertEqual(manifest["version"], "1.28.0")
        self.assertIn('LMS_LANDING_VERSION = "1.28.0"', read(FOOTER_CHROME))
        for line in changelog.splitlines():
            self.assertFalse(re.match(r"#[^#\s]", line), line)


if __name__ == "__main__":
    unittest.main()
