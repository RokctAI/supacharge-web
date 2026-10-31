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

"""1.39.1: the landing's fonts are bundled and load through next/font/local.
next/font/google downloads from Google Fonts at build time, and that failed
the supacharge-web Vercel build on main 6449cbd."""

import json
import os
import re
import unittest

SDK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANDING = os.path.join(SDK_ROOT, "templates", "components", "custom", "landing")
FONTS_TS = os.path.join(LANDING, "lms-fonts.ts")
FONTS_DIR = os.path.join(LANDING, "fonts", "lms")


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


class LocalFontsTest(unittest.TestCase):
    def test_no_template_imports_next_font_google(self):
        hits = []
        for root, _, files in os.walk(os.path.join(SDK_ROOT, "templates")):
            for name in files:
                if name.endswith((".ts", ".tsx", ".js", ".jsx", ".mjs", ".css")):
                    path = os.path.join(root, name)
                    if re.search(r"""from\s+["']next/font/google["']""", read(path)):
                        hits.append(os.path.relpath(path, SDK_ROOT))
        self.assertEqual(hits, [])

    def test_fonts_load_from_bundled_files(self):
        code = read(FONTS_TS)
        self.assertIn('import localFont from "next/font/local";', code)
        paths = re.findall(r'path: "\./(fonts/lms/[^"]+\.woff2)"', code)
        self.assertEqual(len(paths), 3)
        for rel in paths:
            with self.subTest(path=rel):
                full = os.path.join(LANDING, rel)
                self.assertTrue(os.path.isfile(full), rel)
                with open(full, "rb") as fh:
                    self.assertEqual(fh.read(4), b"wOF2")

    def test_variables_weights_and_styles_unchanged(self):
        code = read(FONTS_TS)
        self.assertIn('variable: "--sc-font-inter"', code)
        self.assertIn('variable: "--sc-font-montserrat"', code)
        self.assertEqual(code.count('display: "swap"'), 2)
        self.assertRegex(code, r'inter-wght-400-800\.woff2",\s*weight: "400 800",\s*style: "normal"')
        self.assertRegex(code, r'montserrat-wght-700-900\.woff2",\s*weight: "700 900",\s*style: "normal"')
        self.assertRegex(
            code, r'montserrat-wght-700-900-italic\.woff2",\s*weight: "700 900",\s*style: "italic"'
        )
        self.assertNotIn("adjustFontFallback:", code)

    def test_licence_ships_beside_the_fonts(self):
        licence = read(os.path.join(FONTS_DIR, "OFL.txt"))
        self.assertIn("SIL OPEN FONT LICENSE Version 1.1", licence)
        self.assertIn("The Inter Project Authors", licence)
        self.assertIn("Montserrat", licence)

    def test_manifest_installs_the_font_directory(self):
        manifest = json.loads(read(os.path.join(SDK_ROOT, "manifest.json")))
        pairs = {i["from"]: i["to"] for i in manifest["installs"]}
        self.assertEqual(
            pairs.get("templates/components/custom/landing/fonts/lms"),
            "components/custom/landing/fonts/lms",
        )


if __name__ == "__main__":
    unittest.main()
