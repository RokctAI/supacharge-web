/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import Link from "next/link";
import type { LmsNavLink } from "@/app/actions/handson/all/lms/user/actions";

export function QuickLinks({ links }: { links: LmsNavLink[] }) {
  if (links.length === 0) return null;
  return (
    <nav aria-label="Learning links" className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg border px-4 py-3 hover:bg-gray-50"
        >
          <span className="block font-medium text-gray-900">{link.label}</span>
          <span className="block text-sm text-gray-500">
            {link.description}
          </span>
        </Link>
      ))}
    </nav>
  );
}
