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

// Where the legal pages get their documents (corporate_sdk 1.0.0): ONE
// small function per page, so the lookup can grow without touching the
// pages. Ray, 2026-09-10: corporate_sdk owns the company pages as
// renderers, with content from the shell's data/ folder on local / hybrid
// shells - base 1.35.0 is adding that server-only reader, and
// corporate_sdk 1.1.0 extends `loadLegalDoc` / `loadLegalIndex` with the
// data/ fallback here. In 1.0.0 both read the shell's backend as a guest
// through base_sdk's gateway and nothing else.
//
// Server-only by use (the actions it calls are), directive-free itself.

import { listPublicTerms } from "@/app/actions/base/legal";
import { getPublicTerm } from "@/app/actions/corporate/legal";
import type { PublicTerm } from "@/components/custom/landing/legal-links";
import type { LegalDoc } from "@/components/custom/legal/legal-doc";

/**
 * The document at `/legal/<slug>`, or `null` when the page should answer
 * 404: no such document, a disabled one, or no backend to ask. The page
 * never needs to know which.
 */
export async function loadLegalDoc(slug: string): Promise<LegalDoc | null> {
  const doc = await getPublicTerm(slug);
  if (!doc || doc.disabled) return null;
  return doc;
}

/**
 * The documents `/legal` lists - every enabled one, `{name, title}` each -
 * and the same list a footer's Legal row is built from. Empty with no
 * backend or nothing published.
 */
export async function loadLegalIndex(): Promise<PublicTerm[]> {
  return listPublicTerms();
}
