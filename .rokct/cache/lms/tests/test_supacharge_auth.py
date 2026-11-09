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

"""lms_sdk 1.42.0: the Supacharge auth pages. lms_sdk installs its own
components/custom/site-shell.tsx (auth_sdk >= 1.12.0's SiteShell seam) with
the SiteShell / SiteShellLogo contract, client-safe, wearing the landing's
theme, with scoped CSS and copy that only repeats the landing."""

import json
import re
import unittest
from pathlib import Path

SDK = Path(__file__).resolve().parents[1]
T = SDK / "templates/components/custom"
SHELL = T / "site-shell.tsx"
COPY = T / "supacharge-auth/supacharge-auth-copy.ts"
CSS = T / "supacharge-auth/supacharge-auth.css"


class SupachargeAuthTest(unittest.TestCase):
    def test_manifest_installs_the_shell(self):
        m = json.loads((SDK / "manifest.json").read_text())
        pairs = {(i["from"], i["to"]) for i in m["installs"]}
        self.assertIn(("templates/components/custom/site-shell.tsx", "components/custom/site-shell.tsx"), pairs)
        self.assertIn(("templates/components/custom/supacharge-auth", "components/custom/supacharge-auth"), pairs)

    def test_contract(self):
        src = SHELL.read_text()
        self.assertIn('"use client";', src)
        self.assertIn("export interface SiteShellProps", src)
        self.assertIn("export function SiteShell(", src)
        self.assertIn("export function SiteShellLogo(", src)
        self.assertIn("<LmsTheme />", src)
        self.assertIn("LMS_ROOT_CLASS", src)
        self.assertNotRegex(src, r"server-only|next/headers|lms-footer-section")

    def test_css_scoped(self):
        body = re.sub(r"/\*.*?\*/", "", CSS.read_text(), flags=re.S)
        for sel in re.findall(r"([^{}]+)\{", body):
            if sel.strip().startswith("@media"):
                continue
            for part in sel.split(","):
                self.assertRegex(part.strip(), r"^(html\.light )?\.sa-root \.sa", part)

    def test_copy_is_the_landings(self):
        src = COPY.read_text()
        hero = (T / "landing/lms-hero-copy.ts").read_text()
        cfg = (T / "landing/lms-landing-config.ts").read_text()
        self.assertIn('"Learn faster"', hero)
        self.assertIn('"Pass with confidence"', hero)
        self.assertIn("Two teaching styles", cfg)
        self.assertIn("CAPS", cfg)
        for word in ("guarantee", "%", "distinction"):
            self.assertNotIn(word, src)


if __name__ == "__main__":
    unittest.main()
