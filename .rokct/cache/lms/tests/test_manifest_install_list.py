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

"""1.37.8: every template ships. 1.37.7 added
landing/lms-kids-butterfly.tsx and two files that import it, but no install
entry, so the composed app failed to build (supacharge-web#84)."""

import json
import os
import unittest

SDK_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _froms(node):
    if isinstance(node, dict):
        if "from" in node:
            yield node["from"]
        for value in node.values():
            yield from _froms(value)
    elif isinstance(node, list):
        for value in node:
            yield from _froms(value)


class InstallListTest(unittest.TestCase):
    def test_every_template_file_has_an_install_entry(self):
        with open(os.path.join(SDK_ROOT, "manifest.json"), encoding="utf-8") as fh:
            froms = set(_froms(json.load(fh)))
        dirs = tuple(f.rstrip("/") + "/" for f in froms)
        missing = []
        for root, _, files in os.walk(os.path.join(SDK_ROOT, "templates")):
            for name in files:
                rel = os.path.relpath(os.path.join(root, name), SDK_ROOT)
                if rel not in froms and not rel.startswith(dirs):
                    missing.append(rel)
        self.assertEqual(missing, [], "template files with no install entry in manifest.json")


if __name__ == "__main__":
    unittest.main()
