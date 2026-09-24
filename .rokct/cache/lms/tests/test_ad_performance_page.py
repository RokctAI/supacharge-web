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

"""The ad-performance report on the admin calendar page (lms_sdk 1.32.0).

Run from the repository root:

    python3 -m unittest discover -s lms/nextjs/tests -v

The things that must never silently drift: that the report loads in the same
server render as the calendar and neither can take the other down, that the
rules module stays pure and import-free (it runs here under node with types
stripped, the shape test_marketing_calendar_page.py takes), that flags read
worst-first and are capped, that a figure the backend could not compute is
never drawn as 0, that every word is read through the shell's `t` under one
prefix with its English beside it, that the not-connected state says plainly
that no ad account is connected and shows no invented numbers, that no
credential VALUE is ever written anywhere, and that nothing on this surface
pauses an ad or moves a budget. One case feeds the rules the BACKEND's own
report, computed by rlms/ad_performance.py, so the two halves are held to
one contract.
"""

import importlib.util
import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from datetime import date, timedelta

from test_landing_apps import code_of, load_manifest, read

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
TEMPLATES = os.path.join(SDK_ROOT, "templates")
CUSTOM = os.path.join(TEMPLATES, "components", "custom")
RULES = os.path.join(CUSTOM, "landing", "lms-ad-performance-rules.ts")
ENTRY = os.path.join(CUSTOM, "lms-ad-performance.tsx")
PAGE = os.path.join(TEMPLATES, "app", "admin", "calendar", "page.tsx")
ACTIONS = os.path.join(
    TEMPLATES, "app", "actions", "handson", "all", "lms", "calendar", "actions.ts"
)
TYPES = os.path.join(
    TEMPLATES, "app", "actions", "handson", "all", "lms", "calendar", "types.ts"
)
SERVICE = os.path.join(TEMPLATES, "app", "services", "all", "lms", "ad-performance.ts")
FOOTER_CHROME = os.path.join(CUSTOM, "landing", "lms-footer-chrome.ts")
FRAPPE_MANIFEST = os.path.join(SDK_ROOT, os.pardir, "frappe", "manifest.json")
BACKEND_MODULE = os.path.join(
    SDK_ROOT, os.pardir, "frappe", "src", "tenant", "rlms", "ad_performance.py"
)

NEW_FILES = {"rules": RULES, "entry": ENTRY, "service": SERVICE}

PREFIX = "app.lms.adperf"

#: The two site_config.json key NAMES the integration reads. The names are
#: documentation; a VALUE must never appear in this repository.
CONF_KEYS = ("tiktok_ads_access_token", "tiktok_ads_advertiser_id")

USE_CLIENT_LINE_RE = re.compile(r'^\s*"use client";', re.M)

DRIVER = """
import * as rules from "./lms-ad-performance-rules.ts";
const cases = JSON.parse(process.argv[2]);
const spec = (s) => ({ key: s.key, fallback: s.fallback, params: s.params ?? null });
const out = {
  prefix: rules.LABEL_PREFIX,
  limit: rules.FLAG_RENDER_LIMIT,
  statusLabels: Object.fromEntries(
    Object.entries(rules.STATUS_LABELS).map(([k, v]) => [k, spec(v)])),
  severityLabels: Object.fromEntries(
    Object.entries(rules.SEVERITY_LABELS).map(([k, v]) => [k, spec(v)])),
  flagLabels: Object.fromEntries(
    Object.entries(rules.FLAG_LABELS).map(([k, v]) => [k, spec(v)])),
  actionLabels: Object.fromEntries(
    Object.entries(rules.ACTION_LABELS).map(([k, v]) => [k, spec(v)])),
  severityVariants: Object.fromEntries(
    cases.severities.map((s) => [s, rules.severityVariant(s)])),
  statusVariants: Object.fromEntries(
    cases.statuses.map((s) => [s, rules.statusVariant(s)])),
  sorted: cases.flagSets.map((set) => rules.sortFlags(set).map((f) => f.id)),
  visible: cases.visible.map(([set, limit]) =>
    (limit === null ? rules.visibleFlags(set) : rules.visibleFlags(set, limit)).map((f) => f.id)),
  hidden: cases.visible.map(([set, limit]) =>
    limit === null ? rules.hiddenFlagCount(set) : rules.hiddenFlagCount(set, limit)),
  deltas: cases.deltas.map((d) => rules.formatDelta(d)),
  metrics: cases.metrics.map(([v, digits]) => rules.formatMetric(v, digits)),
  percents: cases.percents.map((v) => rules.formatPercent(v)),
  counts: cases.counts.map((v) => rules.formatCount(v)),
  money: cases.money.map(([v, c]) => rules.formatMoney(v, c)),
  summaries: cases.summaries.map((r) => rules.summaryCounts(r)),
  windows: cases.windows.map((r) => spec(rules.windowLabel(r))),
  synced: cases.synced.map((r) => spec(rules.lastSyncedLabel(r))),
  ordered: cases.ordered.map((r) => rules.orderedAds(r).map((a) => a.ad_id)),
};
console.log(JSON.stringify(out));
"""


def run_rules(cases):
    node = shutil.which("node")
    if not node:
        raise unittest.SkipTest("node is not installed")
    with tempfile.TemporaryDirectory() as tmp:
        shutil.copy(RULES, os.path.join(tmp, "lms-ad-performance-rules.ts"))
        driver = os.path.join(tmp, "driver.ts")
        with open(driver, "w", encoding="utf-8") as f:
            f.write(DRIVER)
        run = subprocess.run(
            [node, "--experimental-strip-types", "--no-warnings", driver, json.dumps(cases)],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=tmp,
        )
    if run.returncode != 0:
        raise AssertionError(run.stderr)
    return json.loads(run.stdout.strip().splitlines()[-1])


def flag(flag_id, severity, ad_id="ad-1", code="cpa_rising"):
    return {
        "id": flag_id,
        "ad_id": ad_id,
        "ad_name": ad_id,
        "code": code,
        "severity": severity,
        "action": "pause",
        "headline": flag_id,
        "detail": flag_id,
    }


def signal(ad_id, status, spend):
    return {
        "ad_id": ad_id,
        "ad_name": ad_id,
        "campaign_id": "camp-1",
        "campaign_name": "camp-1",
        "status": status,
        "spend": spend,
        "impressions": 1000,
        "clicks": 10,
        "conversions": 1,
        "cpa": None,
        "cpa_baseline": None,
        "cpa_change_pct": None,
        "ctr": None,
        "ctr_baseline": None,
        "ctr_change_pct": None,
        "frequency": None,
        "flags": [],
    }


EMPTY = {
    "severities": [],
    "statuses": [],
    "flagSets": [],
    "visible": [],
    "deltas": [],
    "metrics": [],
    "percents": [],
    "counts": [],
    "money": [],
    "summaries": [],
    "windows": [],
    "synced": [],
    "ordered": [],
}


def backend_module():
    spec = importlib.util.spec_from_file_location(
        "rlms_ad_performance_for_page", BACKEND_MODULE
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def backend_report():
    """A report as `api.lms.ad_performance` would serialise it, built by the
    backend's own module from obviously synthetic rows — the contract the
    page draws. No credential and no live account is involved."""
    ap = backend_module()
    today = date(2026, 9, 12)
    _, recent_end, _, baseline_end = ap.window_bounds(today)

    def row(day, ad_id, **fields):
        base = {
            "platform": "tiktok",
            "ad_id": ad_id,
            "ad_name": "Ad " + ad_id,
            "campaign_id": "camp-1",
            "campaign_name": "Term opener push",
            "date": day.isoformat(),
            "currency": "ZAR",
        }
        base.update(fields)
        return base

    rows = [
        row(recent_end, "ad-1", spend=900.0, conversions=2, impressions=40000, clicks=200,
            frequency=3.6),
        row(baseline_end, "ad-1", spend=300.0, conversions=3, impressions=40000, clicks=800),
        row(recent_end, "ad-2", spend=400.0, conversions=0, impressions=20000, clicks=100),
        row(baseline_end, "ad-2", spend=400.0, conversions=4, impressions=20000, clicks=100),
        row(recent_end, "ad-3", spend=100.0, conversions=5, impressions=10000, clicks=300),
        row(baseline_end, "ad-3", spend=100.0, conversions=5, impressions=10000, clicks=300),
    ]
    return ap.build_report(rows, today, generated_at="2026-09-12T05:00:00+00:00")


class TestRules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        flags = [
            flag("c:watch", "watch", ad_id="c"),
            flag("a:act", "act", ad_id="a"),
            flag("b:watch", "watch", ad_id="b"),
            flag("a:frequency_high", "act", ad_id="a", code="frequency_high"),
        ]
        report = {
            "connected": True,
            "platform": "tiktok",
            "generated_at": "2026-09-12T05:00:00+00:00",
            "window_days": 7,
            "baseline_days": 7,
            "last_synced": "2026-09-12",
            "currency": "ZAR",
            "ads": [
                signal("ad-healthy", "healthy", 10),
                signal("ad-decaying", "decaying", 20),
                signal("ad-watch", "watch", 900),
                signal("ad-decaying-bigger", "decaying", 300),
            ],
            "flags": flags,
        }
        cls.report = report
        cls.out = run_rules(
            dict(
                EMPTY,
                **{
                    "severities": ["act", "watch"],
                    "statuses": ["healthy", "watch", "decaying"],
                    "flagSets": [flags, []],
                    "visible": [[flags, None], [flags, 2], [flags, 0]],
                    "deltas": [62.4, -33.6, 0, None, 0.4],
                    "metrics": [[1.234, 2], [3.649, 1], [None, 2]],
                    "percents": [1.4, None],
                    "counts": [1234567, 0, None, 999],
                    "money": [[12345.5, "ZAR"], [7, None], [None, "ZAR"], [0, "ZAR"]],
                    "summaries": [report],
                    "windows": [report],
                    "synced": [report, dict(report, last_synced=None)],
                    "ordered": [report, {"ads": []}],
                }
            )
        )

    def test_flags_read_act_before_watch_and_stay_stable(self):
        self.assertEqual(
            self.out["sorted"][0], ["a:act", "a:frequency_high", "b:watch", "c:watch"]
        )
        self.assertEqual(self.out["sorted"][1], [])

    def test_the_flag_list_is_capped_and_says_how_many_it_left_out(self):
        self.assertEqual(self.out["limit"], 8)
        self.assertEqual(len(self.out["visible"][0]), 4)
        self.assertEqual(self.out["hidden"][0], 0)
        self.assertEqual(self.out["visible"][1], ["a:act", "a:frequency_high"])
        self.assertEqual(self.out["hidden"][1], 2)
        self.assertEqual(self.out["visible"][2], [])
        self.assertEqual(self.out["hidden"][2], 4)

    def test_badges_read_act_and_decay_loudest(self):
        self.assertEqual(
            self.out["severityVariants"], {"act": "default", "watch": "secondary"}
        )
        self.assertEqual(
            self.out["statusVariants"],
            {"healthy": "outline", "watch": "secondary", "decaying": "default"},
        )

    def test_a_percentage_move_carries_its_sign(self):
        self.assertEqual(self.out["deltas"], ["+62%", "-34%", "0%", "", "0%"])

    def test_a_figure_the_backend_could_not_compute_formats_as_nothing(self):
        self.assertEqual(self.out["metrics"], ["1.23", "3.6", ""])
        self.assertEqual(self.out["percents"], ["1.40%", ""])
        self.assertEqual(self.out["money"], ["ZAR 12 345.50", "7.00", "", "ZAR 0.00"])
        self.assertEqual(self.out["counts"], ["1 234 567", "0", "", "999"])

    def test_the_money_formatter_never_writes_a_currency_of_its_own(self):
        code = code_of(RULES)
        self.assertNotRegex(code, r"[R$€£]\s*\$\{")
        self.assertNotIn('"ZAR"', code)
        self.assertNotIn("toLocaleString", code, "the page must read the same everywhere")

    def test_the_summary_counts_each_status_and_the_acting_flags(self):
        self.assertEqual(
            self.out["summaries"][0],
            {"ads": 4, "decaying": 2, "watch": 1, "healthy": 1, "act": 2, "flags": 4},
        )

    def test_the_window_and_the_freshness_are_said_in_words(self):
        self.assertEqual(self.out["windows"][0]["params"], {"days": "7", "baseline": "7"})
        self.assertEqual(self.out["synced"][0]["params"], {"date": "2026-09-12"})
        self.assertEqual(self.out["synced"][1]["key"], PREFIX + ".never_synced")
        self.assertEqual(self.out["synced"][1]["params"], None)

    def test_the_table_lists_the_worst_ad_first_then_the_biggest_spend(self):
        self.assertEqual(
            self.out["ordered"][0],
            ["ad-decaying-bigger", "ad-decaying", "ad-watch", "ad-healthy"],
        )
        self.assertEqual(self.out["ordered"][1], [])

    def test_every_label_key_sits_under_the_prefix(self):
        self.assertEqual(self.out["prefix"], PREFIX)
        specs = []
        for group in ("statusLabels", "severityLabels", "flagLabels", "actionLabels"):
            specs += list(self.out[group].values())
        specs += self.out["windows"] + self.out["synced"]
        for label in specs:
            with self.subTest(key=label["key"]):
                self.assertTrue(label["key"].startswith(PREFIX + "."), label["key"])
                self.assertTrue(label["fallback"])

    def test_every_suggested_action_reads_as_a_suggestion(self):
        for name, label in self.out["actionLabels"].items():
            with self.subTest(action=name):
                self.assertIn("Suggested", label["fallback"])

    def test_rules_module_is_import_free(self):
        code = code_of(RULES)
        self.assertNotRegex(code, r"^\s*import ", "the rules must run under bare node")
        self.assertNotRegex(code, r"^\s*export \* from", "the rules must run under bare node")


class TestBackendContract(unittest.TestCase):
    """The page reads the backend's own answer: a report from
    rlms/ad_performance.py through the rules under node."""

    @classmethod
    def setUpClass(cls):
        cls.report = backend_report()
        cls.out = run_rules(
            dict(
                EMPTY,
                **{
                    "severities": sorted({f["severity"] for f in cls.report["flags"]}),
                    "statuses": sorted({a["status"] for a in cls.report["ads"]}),
                    "flagSets": [cls.report["flags"]],
                    "visible": [[cls.report["flags"], None]],
                    "summaries": [cls.report],
                    "windows": [cls.report],
                    "synced": [cls.report],
                    "ordered": [cls.report],
                }
            )
        )

    def test_the_backend_answers_the_wire_contract_the_types_declare(self):
        code = read(RULES)
        for key in self.report:
            with self.subTest(key=key):
                self.assertIn(key, code)
        for key in self.report["ads"][0]:
            with self.subTest(signal=key):
                self.assertIn(key, code)
        for key in self.report["flags"][0]:
            with self.subTest(flag=key):
                self.assertIn(key, code)

    def test_every_code_severity_action_and_status_the_backend_raises_has_a_label(self):
        code = read(RULES)
        for flag in self.report["flags"]:
            with self.subTest(flag=flag["code"]):
                self.assertIn(f"{flag['code']}: spec(", code)
                self.assertIn(f"{flag['action']}: spec(", code)
                self.assertIn(f"{flag['severity']}: spec(", code)
        for ad in self.report["ads"]:
            with self.subTest(status=ad["status"]):
                self.assertIn(f"{ad['status']}: spec(", code)

    def test_the_decaying_ad_reads_first_and_its_act_flags_lead(self):
        self.assertEqual(self.out["ordered"][0][0], "ad-1")
        severities = [
            f["severity"]
            for f in sorted(
                self.report["flags"], key=lambda f: self.out["sorted"][0].index(f["id"])
            )
        ]
        self.assertEqual(severities, sorted(severities, key=lambda s: s != "act"))
        self.assertEqual(self.out["summaries"][0]["ads"], 3)
        self.assertGreaterEqual(self.out["summaries"][0]["decaying"], 1)

    def test_the_report_is_reporting_only(self):
        actions = {flag["action"] for flag in self.report["flags"]}
        self.assertTrue(actions)
        for name in actions:
            with self.subTest(action=name):
                self.assertIn(name, {"refresh_creative", "pause", "shift_budget", "reconnect"})


class TestPageShape(unittest.TestCase):
    def test_the_page_loads_both_payloads_in_one_server_render(self):
        code = code_of(PAGE)
        self.assertIsNone(USE_CLIENT_LINE_RE.search(code))
        self.assertIn("await Promise.all([", code)
        self.assertIn("fetchMarketingCalendar(),", code)
        self.assertIn("fetchAdPerformance(),", code)
        self.assertIn('export const dynamic = "force-dynamic";', code)
        for hook in ("useEffect(", "useState("):
            self.assertNotIn(hook, code)
        for browser in ("window", "document", "navigator"):
            with self.subTest(browser=browser):
                self.assertIsNone(re.search(rf"(?<![A-Za-z]){browser}\.[A-Za-z_]", code))

    def test_the_report_is_drawn_below_the_calendar_and_cannot_take_it_down(self):
        code = code_of(PAGE)
        calendar_at = code.index("<LmsMarketingCalendar calendar={calendar} />")
        report_at = code.index("<LmsAdPerformance report={adPerformance} />")
        self.assertLess(calendar_at, report_at, "the windows come first")
        self.assertIn("<LmsAdPerformanceNotConnected />", code)
        # A refused or missing report renders nothing at all; the calendar
        # is never inside the report's condition.
        self.assertIn("adPerformance ? (", code)
        self.assertIn(") : null}", code)

    def test_the_entry_is_a_server_component(self):
        code = code_of(ENTRY)
        self.assertIsNone(USE_CLIENT_LINE_RE.search(code))
        for hook in ("useState(", "useEffect("):
            self.assertNotIn(hook, code)
        # A browser global, not the English word in a sentence about the
        # trailing window: the member access is what would need a client.
        for browser in ("window", "document", "navigator", "localStorage"):
            with self.subTest(browser=browser):
                self.assertIsNone(re.search(rf"(?<![A-Za-z]){browser}\.[A-Za-z_]", code))
        self.assertIn("export function LmsAdPerformance", code)
        self.assertIn("export function LmsAdPerformanceNotConnected", code)

    def test_the_entry_draws_the_summary_the_flags_and_the_table(self):
        code = code_of(ENTRY)
        for piece in (
            "function FlagsCard",
            "function AdTable",
            "function FlagRow",
            "function AdRow",
            "visibleFlags(report.flags)",
            "hiddenFlagCount(report.flags)",
            "orderedAds(report)",
            "summaryCounts(report)",
            "windowLabel(report)",
            "lastSyncedLabel(report)",
            "severityVariant(flag.severity)",
            "statusVariant(ad.status)",
            "ACTION_LABELS[flag.action]",
            "FLAG_LABELS[flag.code]",
            "flag.headline",
            "flag.detail",
            "report.currency",
        ):
            with self.subTest(piece=piece):
                self.assertIn(piece, code)

    def test_a_figure_the_backend_could_not_compute_is_not_drawn_as_zero(self):
        code = code_of(ENTRY)
        self.assertIn("function Figure", code)
        self.assertIn('L("no_data", "no data")', code)
        self.assertIn("overflow-x-auto", code, "the table scrolls, it never squashes")

    def test_every_word_is_read_through_the_shells_t(self):
        code = code_of(ENTRY)
        self.assertIn('import t from "@/app/lib/i18n";', code)
        self.assertIn("const value = t(key, params);", code)
        names = set(re.findall(r'\bL\(\s*"([a-z_]+)"', code))
        for name in (
            "title",
            "summary",
            "reporting_only",
            "flags_eyebrow",
            "flags_title",
            "flags_more",
            "no_flags",
            "no_ads",
            "no_data",
            "table_title",
            "column_ad",
            "column_spend",
            "column_cpa",
            "column_ctr",
            "column_frequency",
            "column_status",
            "not_connected_title",
            "not_connected_body",
            "not_connected_hint",
        ):
            with self.subTest(name=name):
                self.assertIn(name, names)
        jsx_text = re.findall(r">\s*([A-Za-z][^<{}]*?)\s*<", code)
        self.assertEqual(jsx_text, [], jsx_text)
        self.assertRegex(code, r'word\(`\$\{LABEL_PREFIX\}\.\$\{name\}`')

    def test_the_not_connected_state_says_so_plainly_and_invents_nothing(self):
        code = code_of(ENTRY)
        state = code[code.index("export function LmsAdPerformanceNotConnected") :]
        self.assertRegex(state, r"(?i)not connected")
        self.assertNotRegex(state, r"(?i)\b(demo|sample|example|lorem|template)\b")
        self.assertNotRegex(state, r"\b\d+([.,]\d+)?%", "no invented figures")
        for key in CONF_KEYS:
            self.assertIn(key, state, "it names the key to set")

    def test_nothing_on_this_surface_acts_on_the_ad_account(self):
        code = code_of(ENTRY)
        for piece in ("<button", "<form", "onClick", "action={", "fetch("):
            with self.subTest(piece=piece):
                self.assertNotIn(piece, code)
        self.assertIn("reporting_only", code)

    def test_the_action_gates_with_the_host_role_first(self):
        code = code_of(ACTIONS)
        self.assertRegex(code.lstrip(), r'^"use server";')
        self.assertIn('from "@/app/lib/roles"', code)
        self.assertEqual(code.count("if (!(await verifyLmsRole())) return null;"), 2)
        self.assertIn("AdPerformanceService.getReport(today)", code)
        self.assertIn("export async function fetchAdPerformance(", code)

    def test_the_service_calls_the_alias_and_degrades_to_null(self):
        code = code_of(SERVICE)
        self.assertIn('"api.lms.ad_performance"', code)
        self.assertIn("extends BaseService", code)
        self.assertIn("return null;", code)
        self.assertNotIn("throw ", code)
        self.assertIn('from "@/app/services/common/base"', code)

    def test_the_types_are_the_rules_wire_types(self):
        code = code_of(TYPES)
        self.assertIn('from "@/components/custom/landing/lms-ad-performance-rules"', code)
        for name in ("AdPerformanceReport", "AdSignal", "AdFlag", "AdStatus"):
            self.assertIn(name, code)

    def test_no_brand_host_credential_or_placeholder_in_the_new_files(self):
        for name, path in NEW_FILES.items():
            code = code_of(path)  # the licence header names gnu.org
            with self.subTest(file=name):
                self.assertNotRegex(code, r"(?i)supacharge")
                self.assertNotRegex(code, r"https?://", "the host is never written here")
                self.assertNotRegex(code, r"(?i)\b(demo|sample|example|lorem)\b")
                self.assertNotRegex(
                    code,
                    r"(?i)(token|advertiser)\s*[:=]\s*[\"'][A-Za-z0-9_-]{8,}[\"']",
                    "no credential value, ever",
                )

    def test_the_alias_is_registered_in_the_backend_manifest(self):
        with open(FRAPPE_MANIFEST, encoding="utf-8") as f:
            methods = json.load(f)["app_type"]["tenant"]["hooks"]["whitelisted_methods"]
        self.assertIn("{app_name}.api.lms.ad_performance", methods)
        self.assertTrue(
            methods["{app_name}.api.lms.ad_performance"].endswith(".get_ad_performance")
        )


class TestManifest(unittest.TestCase):
    def test_the_two_new_files_are_installed_with_comments(self):
        pairs = {i["from"]: i for i in load_manifest()["installs"]}
        for source, dest in (
            (
                "templates/components/custom/lms-ad-performance.tsx",
                "components/custom/lms-ad-performance.tsx",
            ),
            (
                "templates/components/custom/landing/lms-ad-performance-rules.ts",
                "components/custom/landing/lms-ad-performance-rules.ts",
            ),
        ):
            with self.subTest(source=source):
                self.assertIn(source, pairs)
                self.assertEqual(pairs[source]["to"], dest)
                self.assertIn("1.32.0", pairs[source]["_comment"])
                self.assertTrue(os.path.exists(os.path.join(SDK_ROOT, source)))

    def test_the_action_types_and_service_ride_the_directory_mappings(self):
        tos = {i["to"] for i in load_manifest()["installs"]}
        self.assertIn("app/actions/handson/all/lms", tos)
        self.assertIn("app/services/all/lms", tos)
        for path in (ACTIONS, TYPES, SERVICE):
            self.assertTrue(os.path.exists(path), path)

    def test_i18n_is_required_and_the_new_prefix_named(self):
        manifest = load_manifest()
        self.assertIn("app/lib/i18n/index.ts", manifest["requires"])
        self.assertIn(PREFIX, manifest["_comment"]["app/lib/i18n/index.ts"])

    def test_about_names_the_alias_the_keys_and_the_reporting_only_rule(self):
        about = load_manifest()["_comment"]["about"]
        self.assertIn("api.lms.ad_performance", about)
        self.assertIn("Reporting only", about)
        for key in CONF_KEYS:
            self.assertIn(key, about)

    def test_the_changelog_and_the_footer_carry_this_release(self):
        manifest = load_manifest()
        self.assertGreaterEqual(
            tuple(int(n) for n in manifest["version"].split(".")), (1, 32, 0)
        )
        self.assertIn(f'LMS_LANDING_VERSION = "{manifest["version"]}"', read(FOOTER_CHROME))
        changelog = read(os.path.join(SDK_ROOT, "CHANGELOG.md"))
        head = " ".join(changelog.split("## 1.31.3")[0].split())
        self.assertIn("## 1.32.0", head)
        self.assertIn("api.lms.ad_performance", head)
        self.assertIn("LMS Ad Performance Daily", head)
        self.assertIn("Reporting only", head)
        for key in CONF_KEYS:
            self.assertIn(key, head)
        for line in changelog.splitlines():
            self.assertFalse(re.match(r"#[^#\s]", line), line)


if __name__ == "__main__":
    unittest.main()
