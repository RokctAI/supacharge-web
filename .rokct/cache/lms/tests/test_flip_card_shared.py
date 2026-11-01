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

"""lms_sdk 1.41.0: the flip card is base_sdk's shared FlipCard (base_sdk >=
1.58.0); landing/lms-flip-card.tsx re-exports it under its old names with
the Supacharge focus ring, so its importers are untouched.

Run:  python3 -m unittest discover -s lms/nextjs/tests
"""

import json
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SDK_ROOT = os.path.abspath(os.path.join(HERE, os.pardir))
TEMPLATES = os.path.join(SDK_ROOT, "templates")
SHIM = os.path.join(TEMPLATES, "components", "custom", "landing", "lms-flip-card.tsx")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


class TestFlipCardShared(unittest.TestCase):
    def test_shim_reexports_base_flip_card(self):
        src = read(SHIM)
        self.assertIn('"use client";', src)
        self.assertIn(
            'import { FlipCard, stopFlip, useMediaQuery, type FlipCardProps } from "@/components/custom/flip-card";',
            src,
        )
        self.assertIn("export { stopFlip, useMediaQuery };", src)
        self.assertIn("export function LmsFlipCard(props: LmsFlipCardProps) {", src)
        self.assertIn("<FlipCard {...props} ringClassName={LMS_FLIP_RING} />", src)
        self.assertIn("export default LmsFlipCard;", src)
        self.assertIn("focus-visible:ring-[var(--sc-primary)]", src)
        # The card itself lives in base now: no second copy of the rotation here.
        self.assertNotIn("rotateY", src)
        self.assertNotIn("useState", src)

    def test_importers_still_use_the_landing_module(self):
        for rel, names in (
            ("components/custom/landing/lms-tutor-card.tsx", "LmsFlipCard, stopFlip"),
            ("components/custom/landing/lms-plan-card.tsx", "LmsFlipCard, stopFlip"),
            ("components/custom/lms-tutors-section.client.tsx", "useMediaQuery"),
        ):
            src = read(os.path.join(TEMPLATES, rel))
            self.assertIn(f'import {{ {names} }} from "@/components/custom/landing/lms-flip-card";', src, rel)

    def test_manifest_requires_base_flip_card(self):
        manifest = json.loads(read(os.path.join(SDK_ROOT, "manifest.json")))
        self.assertGreaterEqual(tuple(int(p) for p in manifest["version"].split(".")), (1, 40, 0))
        self.assertIn("components/custom/flip-card.tsx", manifest["requires"])
        installs = [e["to"] for e in manifest.get("installs", [])]
        for block in manifest.get("app_type", {}).values():
            installs += [e.get("to") for e in block.get("installs", [])]
        self.assertNotIn("components/custom/flip-card.tsx", installs, "base installs it, not lms")
        self.assertIn("components/custom/landing/lms-flip-card.tsx", installs)


if __name__ == "__main__":
    unittest.main()
