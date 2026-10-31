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

"""1.40.0: Supacharge's own Back to top button. base_sdk 1.56.0 supplies the
mechanism; lms_sdk registers Supacharge's style at the registry marker, and
the style names Supacharge's tokens rather than copying their values."""

import json
import os
import re
import unittest

SDK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANDING = os.path.join(SDK_ROOT, "templates", "components", "custom", "landing")
STYLE = os.path.join(LANDING, "lms-back-to-top.ts")
ARROW_CSS = os.path.join(LANDING, "lms-back-to-top.css")
THEME_CSS = os.path.join(LANDING, "lms-theme.css")
FONTS_TS = os.path.join(LANDING, "lms-fonts.ts")

SHAPES = ("circle", "rounded-square", "pill-with-label", "text-arrow")
POSITIONS = ("bottom-right", "bottom-left", "bottom-center")


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def manifest():
    with open(os.path.join(SDK_ROOT, "manifest.json"), encoding="utf-8") as fh:
        return json.load(fh)


def field(code, name):
    m = re.search(r"^\s+" + name + r': (?:"([^"]*)"|(\d+)),$', code, re.M)
    return None if not m else (m.group(1) if m.group(1) is not None else int(m.group(2)))


class BackToTopStyleTest(unittest.TestCase):
    def test_installed_and_registered_at_the_marker(self):
        m = manifest()
        installs = {e["from"]: e["to"] for e in m["installs"]}
        self.assertEqual(
            installs.get("templates/components/custom/landing/lms-back-to-top.ts"),
            "components/custom/landing/lms-back-to-top.ts",
        )
        hits = [i for i in m["integrations"] if i.get("target") == "components/custom/landing/back-to-top-style.ts"]
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0]["placeholder"], "// @rokct-sdk-back-to-top-style-start")
        self.assertEqual(
            hits[0]["replacement"],
            '  { id: "lms-back-to-top", load: () => import("@/components/custom/landing/lms-back-to-top") },',
        )
        self.assertIn("components/custom/landing/back-to-top-style.ts", m["requires"])

    def test_module_is_a_back_to_top_config(self):
        code = read(STYLE)
        self.assertTrue(code.lstrip().startswith("/*"), "licence header first")
        self.assertIn('import type { BackToTopConfig } from "@/components/custom/landing/back-to-top";', code)
        self.assertIn("export const LMS_BACK_TO_TOP: BackToTopConfig = {", code)
        self.assertIn("export default LMS_BACK_TO_TOP;", code)

    def test_supacharge_style_is_the_line_arrow_reading_scroll_to_top(self):
        code = read(STYLE)
        self.assertEqual(field(code, "shape"), "text-arrow")
        self.assertIn(field(code, "shape"), SHAPES)
        self.assertIn(field(code, "position"), POSITIONS)
        # The wording is the config's label field, so data/theme.json can change it.
        self.assertEqual(field(code, "label"), "Scroll to top")
        self.assertEqual(field(code, "textTransform"), "uppercase")
        self.assertEqual(field(code, "fontWeight"), 900)
        self.assertIn('import "./lms-back-to-top.css";', code)

    def test_line_arrow_sheet_draws_the_line_break_and_a_bold_point(self):
        css = read(ARROW_CSS)
        self.assertTrue(css.lstrip().startswith("/*"), "licence header first")
        sel = 'button[data-back-to-top-shape="text-arrow"]'
        for part in ("::before", "::after", " > svg", " > span"):
            self.assertIn(sel + part, css, part)

        def px(name):
            m = re.search(r"--sc-btt-" + name + r": (\d+)px;", css)
            self.assertIsNotNone(m, name)
            return int(m.group(1))

        line, head_w, head_h = px("line"), px("head-w"), px("head-h")
        self.assertGreaterEqual(line, 3, "the line is bold, not a hairline")
        self.assertGreaterEqual(head_w, 6 * line, "the point is weighted to the line")
        self.assertGreater(head_h, 11, "larger than base's 22x11 head")
        self.assertGreater(px("tail"), px("neck"), "the line starts at the bottom; a short run after the label")
        # Top to bottom: head (0), neck (1), label (2), tail (3).
        for part, n in ((" > svg", 0), ("::before", 1), (" > span", 2), ("::after", 3)):
            blocks = re.findall("^" + re.escape(sel + part) + r" \{([^}]*)\}", css, re.M)
            self.assertTrue(any(f"order: {n};" in b for b in blocks), part)
        self.assertIn("background: currentColor;", css)
        self.assertIn("prefers-reduced-motion: no-preference", css)
        self.assertNotRegex(re.sub(r"/\*.*?\*/", "", css, flags=re.S), r"#[0-9a-fA-F]{3,8}\b")

    def test_arrow_sheet_is_installed(self):
        installs = {e["from"]: e["to"] for e in manifest()["installs"]}
        self.assertEqual(
            installs.get("templates/components/custom/landing/lms-back-to-top.css"),
            "components/custom/landing/lms-back-to-top.css",
        )

    def test_every_colour_and_face_names_a_supacharge_token_with_a_fallback(self):
        code = read(STYLE)
        css = read(THEME_CSS)
        for name, token in (("foreground", "--sc-primary"), ("hoverForeground", "--sc-star"),
                            ("fontFamily", "--sc-font-brand")):
            value = field(code, name)
            self.assertIsNotNone(value, name)
            self.assertTrue(value.startswith(f"var({token}, "), value)
            self.assertIn(f"{token}:", css, token)
        self.assertIn("--sc-surface", field(code, "halo"))
        self.assertIn('variable: "--sc-font-montserrat"', read(FONTS_TS))
        code_only = re.sub(r"//.*", "", code)
        self.assertNotRegex(code_only, r"#[0-9a-fA-F]{3,8}\b", "no colour value is copied")

    def test_motion_is_a_spring(self):
        code = read(STYLE)
        self.assertEqual(field(code, "easing"), "cubic-bezier(0.34, 1.56, 0.64, 1)")
        self.assertRegex(field(code, "duration"), r"^\d+ms$")

    def test_version_and_changelog(self):
        m = manifest()
        self.assertGreaterEqual(tuple(int(p) for p in m["version"].split(".")), (1, 40, 0))
        self.assertIn("_comment_version_1_40_0", m)
        head = read(os.path.join(SDK_ROOT, "CHANGELOG.md")).split("## 1.39.1", 1)[0]
        self.assertIn("## 1.40.0", head)
        self.assertIn("text-arrow", head)


if __name__ == "__main__":
    unittest.main()
