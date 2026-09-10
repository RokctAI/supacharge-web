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

"""Contract tests for corporate/nextjs's manifest and its legal pages.

Run from the repository root:

    python3 -m unittest discover -s corporate/nextjs/tests -v

Ray, 2026-09-10: "supa has no terms pages or about page"; "legal pages are
not in corporate sdk?"; "you should look at the dart side if they are not
there yet". The Dart corporate_sdk owns the policy / terms pages and every
auth composition includes it; this half mirrors that. The things that must
never silently drift: every install source exists, the floors on base_sdk
are declared, every entry module a page imports is server-safe (no "use
client" - base's server loader contract), the document page 404s a missing
or disabled document and reads through the ONE seam 1.1.0 extends, and
nothing rendered carries placeholder words. Stdlib only, the shape
base_sdk's own tests/test_manifest.py takes.
"""

import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
MANIFEST = os.path.join(SDK_ROOT, "manifest.json")
CHANGELOG = os.path.join(SDK_ROOT, "CHANGELOG.md")
INSTALL_PY = os.path.join(SDK_ROOT, "install.py")
TEMPLATES = os.path.join(SDK_ROOT, "templates")
LEGAL_DIR = os.path.join(TEMPLATES, "app", "legal")
INDEX_PAGE = os.path.join(LEGAL_DIR, "page.tsx")
DOC_PAGE = os.path.join(LEGAL_DIR, "[id]", "page.tsx")
ACTION = os.path.join(TEMPLATES, "app", "actions", "corporate", "legal.ts")
LEGAL_COMPONENTS = os.path.join(TEMPLATES, "components", "custom", "legal")
DOC_VIEW = os.path.join(LEGAL_COMPONENTS, "legal-doc.tsx")
FRAME = os.path.join(LEGAL_COMPONENTS, "legal-frame.tsx")
LOADER = os.path.join(LEGAL_COMPONENTS, "load-legal-doc.ts")

BASE_FLOOR = "1.37.0"
# The base_sdk 1.37.0 files this SDK reads: each must be a declared
# prerequisite with its floor in the manifest comment.
BASE_134_REQUIRES = (
    "app/actions/base/legal.ts",
    "components/custom/landing/legal-links.ts",
    "components/custom/landing/footer-chrome-config.ts",
    "components/custom/footer-chrome.tsx",
)

BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)
LINE_COMMENT_RE = re.compile(r"^\s*//.*$", re.M)
LICENSE_HEAD = "Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD"


def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def code_of(path):
    """The source with its comments removed - what the compiler sees."""
    return LINE_COMMENT_RE.sub("", BLOCK_COMMENT_RE.sub("", read(path)))


def template_files():
    for root, _, names in os.walk(TEMPLATES):
        for name in names:
            yield os.path.join(root, name)


class TestCorporateNextjs(unittest.TestCase):
    def setUp(self):
        self.manifest = load_manifest()

    # -- identity and installs ------------------------------------------------

    def test_identity_and_version(self):
        self.assertEqual(self.manifest["name"], "corporate_sdk")
        self.assertRegex(self.manifest["version"], r"^\d+\.\d+\.\d+$")
        self.assertEqual(self.manifest["version"], "1.0.0")
        self.assertIn("sdk_name = 'corporate_sdk'", read(INSTALL_PY))
        self.assertTrue(read(INSTALL_PY).startswith("# " + LICENSE_HEAD))
        # Same shape as the sibling halves: one flat installs list, no
        # app_type persona blocks, and never the home SDK.
        for key in ("installs", "dependencies", "devDependencies", "integrations", "requires", "_comment"):
            self.assertIn(key, self.manifest)
        self.assertNotIn("app_type", self.manifest)
        self.assertNotIn("home_sdk", self.manifest)
        self.assertEqual(self.manifest["integrations"], [])
        self.assertEqual(self.manifest["dependencies"], {})

    def test_every_install_source_exists(self):
        for entry in self.manifest["installs"]:
            src = os.path.join(SDK_ROOT, entry["from"])
            self.assertTrue(os.path.exists(src), f"missing install source {entry['from']}")

    def test_install_targets_are_unique(self):
        targets = [e["to"] for e in self.manifest["installs"]]
        self.assertEqual(len(targets), len(set(targets)))

    def test_the_legal_pages_and_their_parts_are_installed(self):
        pairs = {(e["from"], e["to"]) for e in self.manifest["installs"]}
        for pair in (
            ("templates/app/legal", "app/legal"),
            ("templates/app/actions/corporate/legal.ts", "app/actions/corporate/legal.ts"),
            ("templates/components/custom/legal/legal-doc.tsx", "components/custom/legal/legal-doc.tsx"),
            ("templates/components/custom/legal/legal-frame.tsx", "components/custom/legal/legal-frame.tsx"),
            ("templates/components/custom/legal/load-legal-doc.ts", "components/custom/legal/load-legal-doc.ts"),
        ):
            self.assertIn(pair, pairs)
        self.assertTrue(os.path.isfile(INDEX_PAGE))
        self.assertTrue(os.path.isfile(DOC_PAGE))

    def test_requires_are_not_installed(self):
        targets = {e["to"] for e in self.manifest["installs"]}
        for req in self.manifest["requires"]:
            self.assertNotIn(req, targets, f"{req} is both required and installed")

    # -- floors ---------------------------------------------------------------

    def test_base_floor_is_declared_on_every_base_134_file(self):
        comment = self.manifest["_comment"]
        requires = set(self.manifest["requires"])
        for path in BASE_134_REQUIRES:
            self.assertIn(path, requires, f"{path} is read but not a declared prerequisite")
            self.assertIn(path, comment, f"{path} has no floor comment")
            self.assertIn(f"base_sdk >= {BASE_FLOOR}", comment[path], path)
        self.assertIn(f"base_sdk >= {BASE_FLOOR}", comment["about"])
        self.assertIn("home_sdk false", comment["about"])
        # Every other prerequisite names who installs it too.
        for req in requires:
            self.assertIn(req, comment, f"{req} has no owner comment")
            self.assertRegex(comment[req], r"^(installed by \w+ >= \d+\.\d+\.\d+|host shell)")

    def test_every_import_of_a_base_or_host_file_is_a_declared_prerequisite(self):
        installed = {e["to"] for e in self.manifest["installs"]}
        installed_dirs = {t for t in installed if not t.endswith((".ts", ".tsx"))}
        declared = set(self.manifest["requires"])
        for path in template_files():
            for target in re.findall(r'from "@/([^"]+)"', read(path)):
                candidates = {target, target + ".ts", target + ".tsx"}
                if candidates & installed or any(target.startswith(d + "/") for d in installed_dirs):
                    continue
                self.assertTrue(
                    candidates & declared,
                    f"{os.path.relpath(path, SDK_ROOT)} imports @/{target}, which is neither installed nor required",
                )

    # -- the server-safe contract ---------------------------------------------

    def test_entry_modules_are_directive_free(self):
        """Base's server loader contract: a page and everything it renders
        on the server carries no "use client"; the only directive here is
        the action's "use server"."""
        directive = re.compile(r"""^\s*["']use (client|server)["'];?\s*$""", re.M)
        for path in (INDEX_PAGE, DOC_PAGE, DOC_VIEW, FRAME, LOADER):
            self.assertIsNone(directive.search(code_of(path)), os.path.relpath(path, SDK_ROOT))
        self.assertRegex(read(ACTION), re.compile(r'^"use server";$', re.M))
        self.assertNotRegex(code_of(ACTION), re.compile(r"""^\s*["']use client["']""", re.M))
        for path in (INDEX_PAGE, DOC_PAGE, DOC_VIEW, FRAME):
            body = code_of(path)
            for hook in ("useState", "useEffect", "useRef", "usePathname", "window.", "localStorage"):
                self.assertNotIn(hook, body, f"{os.path.relpath(path, SDK_ROOT)} uses {hook}")

    def test_document_page_reads_through_the_seam_and_404s(self):
        src = read(DOC_PAGE)
        self.assertIn('import { notFound } from "next/navigation";', src)
        self.assertIn("export async function generateMetadata(", src)
        self.assertIn("export default async function LegalDocPage(", src)
        self.assertIn("params: Promise<{ id: string }>;", src)
        self.assertIn("loadLegalDoc(decodeURIComponent(id))", src)
        self.assertIn("if (!doc) notFound();", src)
        self.assertIn("buildPageMetadata({ title: doc.title })", src)
        self.assertIn("<LegalDocView doc={doc} />", src)
        # The page never reaches the gateway or the action itself: the ONE
        # seam 1.1.0 extends with the data/ fallback is the loader.
        body = code_of(src and DOC_PAGE)
        self.assertNotIn("platformCall", body)
        self.assertNotIn("getPublicTerm", body)
        self.assertNotIn("listPublicTerms", body)
        loader = read(LOADER)
        self.assertIn("export async function loadLegalDoc(slug: string): Promise<LegalDoc | null> {", loader)
        self.assertIn("export async function loadLegalIndex(): Promise<PublicTerm[]> {", loader)
        self.assertIn("if (!doc || doc.disabled) return null;", loader)
        self.assertIn("1.1.0", loader)

    def test_index_page_lists_through_the_seam(self):
        src = read(INDEX_PAGE)
        self.assertIn("const terms = await loadLegalIndex();", src)
        self.assertIn("href={legalDocHref(term.name)}", src)
        self.assertIn("{term.title}", src)
        self.assertIn("terms.length === 0", src)
        self.assertIn("buildPageMetadata({ title: DEFAULT_LEGAL_GROUP_LABEL })", src)
        body = code_of(INDEX_PAGE)
        self.assertNotIn("platformCall", body)
        self.assertNotIn("listPublicTerms", body)

    def test_action_is_a_guest_read_that_soft_fails(self):
        src = read(ACTION)
        self.assertIn('"frappe.client.get",', src)
        self.assertIn("{ doctype: LEGAL_DOCTYPE, name: id },", src)
        self.assertIn("{ requireAuth: false },", src)
        self.assertIn("return normaliseLegalDoc(row);", src)
        self.assertIn("return null;", src)
        self.assertIn('import { LEGAL_DOCTYPE } from "@/components/custom/landing/legal-links";', src)
        body = code_of(ACTION)
        self.assertNotIn("export const", body)
        self.assertNotIn("Terms and Conditions", body, "the doctype name is base's LEGAL_DOCTYPE, said once")

    def test_renderer_keeps_whitespace_and_is_generic(self):
        src = read(DOC_VIEW)
        self.assertIn("whitespace-pre-wrap", src)
        self.assertIn("max-w-3xl", src)
        self.assertIn("export function normaliseLegalDoc(row: unknown): LegalDoc | null {", src)
        self.assertIn("export function LegalDocView(", src)
        self.assertIn("<h1", src)
        self.assertNotIn("dangerouslySetInnerHTML", src)
        frame = read(FRAME)
        self.assertIn('import { PLATFORM_NAME } from "@/app/config/platform";', frame)
        self.assertIn("legalFooterLinks(terms)", frame)
        self.assertIn("<FooterChromeRow config={config} />", frame)
        self.assertIn("href={LEGAL_ROUTE}", frame)

    def test_nothing_rendered_carries_placeholder_words_or_a_host(self):
        for path in template_files():
            body = code_of(path).lower()
            rel = os.path.relpath(path, SDK_ROOT)
            for word in ("demo", "sample", "example", "lorem", "https://", "http://", "rokct.ai", "supacharge"):
                self.assertNotIn(word, body, f"{rel} carries {word}")
            self.assertIn(LICENSE_HEAD, read(path), f"{rel} has no licence header")

    # -- changelog ------------------------------------------------------------

    def test_changelog_leads_with_the_manifest_version(self):
        changelog = read(CHANGELOG)
        heads = re.findall(r"^## (\d+\.\d+\.\d+)$", changelog, re.M)
        self.assertTrue(heads, "CHANGELOG.md has no version heading")
        self.assertEqual(heads[0], self.manifest["version"])
        for line in changelog.splitlines():
            if line.startswith("#") and line != "# Changelog":
                self.assertRegex(line, r"^## \d+\.\d+\.\d+$", line)


if __name__ == "__main__":
    unittest.main()
