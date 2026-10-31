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
"""1.37.0: the landing's "Become a Sponsor or Partner" card and the
/partner/signup page its button opens.

The card is config-driven (LMS_LANDING_CONFIG.partners.join), dark in both
modes, carries three ways to give and one primary button, and that button
is a same-site link to this SDK's own signup page - never WhatsApp, a
phone number or a wa.me link. The page calls api.lms.partner_signup
through the platform gateway, a cmd lms/frappe/manifest.json maps.
"""

import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
TEMPLATES = os.path.join(SDK_ROOT, "templates")
CUSTOM = os.path.join(TEMPLATES, "components", "custom")
CONFIG = os.path.join(CUSTOM, "landing", "lms-landing-config.ts")
THEME_CSS = os.path.join(CUSTOM, "landing", "lms-theme.css")
SECTION = os.path.join(CUSTOM, "lms-partners-section.tsx")
PAGE_DIR = os.path.join(TEMPLATES, "app", "partner", "signup")
PAGE = os.path.join(PAGE_DIR, "page.tsx")
FORM = os.path.join(PAGE_DIR, "partner-signup-form.tsx")
ACTIONS = os.path.join(TEMPLATES, "app", "actions", "handson", "all", "lms", "partner", "actions.ts")
TYPES = os.path.join(TEMPLATES, "app", "actions", "handson", "all", "lms", "partner", "types.ts")
SERVICE = os.path.join(TEMPLATES, "app", "services", "all", "lms", "partner.ts")
FRAPPE_MANIFEST = os.path.join(SDK_ROOT, os.pardir, "frappe", "manifest.json")

HEADING = "Become a Sponsor or Partner"
BODY = (
    "Fund a learner, sponsor a school programme, or partner with us to expand "
    "reach. Every contribution opens a seat for a child who needs it."
)
OFF_SITE = re.compile(r"(?i)whats\s*app|wa\.me|api\.whatsapp|tel:|\+27\s?\d")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def load_manifest():
    with open(os.path.join(SDK_ROOT, "manifest.json"), encoding="utf-8") as f:
        return json.load(f)


def join_block():
    code = read(CONFIG)
    start = code.index("    join: {")
    end = code.index("    cta: {", start)
    return code[start:end]


class SponsorCardConfigTest(unittest.TestCase):
    def test_copy_is_the_brief(self):
        block = join_block()
        self.assertIn(f'heading: "{HEADING}"', block)
        self.assertIn(f'text: "{BODY}"', block)

    def test_three_ways_to_give(self):
        titles = re.findall(r'\{ title: "([^"]+)"', join_block())
        self.assertEqual(
            titles,
            ["Fund a learner", "Sponsor a school programme", "Partner with us"],
        )

    def test_button_opens_our_own_signup_page(self):
        block = join_block()
        self.assertIn('button: { label: "Become a partner", href: "/partner/signup" }', block)
        self.assertIsNone(OFF_SITE.search(block))

    def test_existing_sponsors_note_is_kept(self):
        code = read(CONFIG)
        self.assertIn('heading: "Reports built for sponsors"', code)
        self.assertIn("sponsors: { heading: string; text: string };", code)


class SponsorCardRenderTest(unittest.TestCase):
    def test_section_renders_the_card_from_config(self):
        code = read(SECTION)
        self.assertIn("<LmsSponsorCard join={config.join} />", code)
        self.assertIn('className="sc-sponsor-card', code)
        self.assertIn("join.ways.map(", code)
        self.assertIn('className="sc-btn sc-btn-primary"', code)
        # The old sponsors note still renders.
        self.assertIn("{config.sponsors.heading}", code)

    def test_no_off_site_contact_link_anywhere_new(self):
        for path in (SECTION, PAGE, FORM, ACTIONS, SERVICE, TYPES):
            with self.subTest(path=os.path.basename(path)):
                code = read(path)
                self.assertNotRegex(code, r"(?i)wa\.me|api\.whatsapp|href=\{?[\"']tel:")

    def test_button_only_takes_a_same_site_path(self):
        code = read(SECTION)
        self.assertIn('href.startsWith("/") && !href.startsWith("//")', code)

    def test_card_stands_out_in_brand_orange(self):
        # 1.37.8 (Ray, 2026-10-17: "Sponsors and partners need to stand
        # out its where we asking for money"): orange in both modes, a
        # white pulsing button, no dark panel.
        css = read(THEME_CSS)
        self.assertRegex(css, r"\.sc-sponsor-card \{[^}]*linear-gradient\(135deg, #ff6600 0%, #e23d0b 100%\)")
        self.assertNotIn("#0a0a0a;\n  color: #ffffff;\n}\n.sc-sponsor-eyebrow", css)
        self.assertRegex(css, r"\.sc-sponsor-btn \{[^}]*background: #ffffff;[^}]*animation: sc-sponsor-pulse")
        self.assertRegex(
            css,
            r"@media \(prefers-reduced-motion: reduce\) \{\s*\.sc-sponsor-btn \{ animation: none; \}",
        )
        code = read(SECTION)
        self.assertIn('className="sc-btn sc-sponsor-btn"', code)
        self.assertIn('<RiHeart3Fill className="sc-sponsor-heart" aria-hidden="true" />', code)


class PartnerSignupPageTest(unittest.TestCase):
    def test_page_exists_and_is_installed(self):
        self.assertTrue(os.path.exists(PAGE))
        pairs = {i["from"]: i["to"] for i in load_manifest()["installs"]}
        self.assertEqual(pairs.get("templates/app/partner"), "app/partner")

    def test_form_is_a_client_module_with_the_fields(self):
        code = read(FORM)
        self.assertRegex(code.lstrip(), r'^/\*[\s\S]*?\*/\s*"use client";')
        for field in ("partner-name", "partner-organisation", "partner-email", "partner-password"):
            self.assertIn(f'id="{field}"', code)
        self.assertIn("PARTNER_INTERESTS.map(", code)
        types = read(TYPES)
        for label in ("Fund a learner", "Sponsor a school programme", "Partner with us"):
            self.assertIn(f'label: "{label}"', types)

    def test_signup_goes_through_the_gateway_cmd(self):
        code = read(SERVICE)
        self.assertIn('"api.lms.partner_signup"', code)
        self.assertIn("platformCall", code)
        self.assertIn("requireAuth: false", code)
        self.assertIn('"app/services/base/platform-gateway.ts"', json.dumps(load_manifest()["requires"]))
        frappe = read(FRAPPE_MANIFEST)
        self.assertIn('"{app_name}.api.lms.partner_signup"', frappe)

    def test_payload_is_what_the_backend_signup_takes(self):
        code = read(SERVICE)
        for key in ("email", "password", "first_name", "last_name", "organisation"):
            self.assertRegex(code, rf"\b{key}: string;")
        self.assertIn('help_type: "fund_learner" | "sponsor_school" | "partner";', code)
        action = read(ACTIONS)
        self.assertIn("organisation: valid.data.organisation,", action)
        self.assertIn("help_type: valid.data.interest,", action)
        # The backend accepts and validates the same two fields.
        backend = read(os.path.join(SDK_ROOT, os.pardir, "frappe", "src", "tenant", "rlms", "api", "partner.py"))
        self.assertIn('def signup(email, password, first_name, last_name="", organisation=None, help_type=None):', backend)
        rules = read(os.path.join(SDK_ROOT, os.pardir, "frappe", "src", "tenant", "rlms", "partner_signup_rules.py"))
        self.assertIn('HELP_TYPES = ("fund_learner", "sponsor_school", "partner")', rules)

    def test_action_is_a_server_action_without_a_role_gate(self):
        code = read(ACTIONS)
        self.assertIn('"use server";', code)
        self.assertNotIn("verifyLmsRole", code)


class VersionTest(unittest.TestCase):
    def test_changelog_records_the_card(self):
        # The card shipped in 1.37.0; later entries sit above it (1.37.1).
        head = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("\n## 1.37.0\n", 1)[1].split("\n## ", 1)[0]
        self.assertGreaterEqual(
            tuple(int(n) for n in load_manifest()["version"].split(".")), (1, 37, 0)
        )
        self.assertIn(HEADING, head)
        self.assertIn("/partner/signup", head)


if __name__ == "__main__":
    unittest.main()
