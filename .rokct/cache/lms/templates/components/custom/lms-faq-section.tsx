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

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. This
// entry module is the server-readable half: `meta` and the registered
// default export. The component - the half that needs the client - is
// ./lms-faq-section.client.tsx, which the default export renders.

import React from "react";

import { LmsFaqSection } from "@/components/custom/lms-faq-section.client";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 80,
  nav: [{ id: "faq", label: "FAQ" }],
};

/** The registered form: the page's DOM id for the section. */
export default function LmsFaqPageSection({ id }: PageSectionProps) {
  return <LmsFaqSection id={id} />;
}
