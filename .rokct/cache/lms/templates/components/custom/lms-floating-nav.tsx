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
// ./lms-floating-nav.client.tsx, which the default export renders.

import React from "react";

import { LmsFloatingNav } from "@/components/custom/lms-floating-nav.client";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: a negative order, so the
 * page renders it before the hero as a fixed overlay that stays visible
 * while the hero shows search results. Not a nav stop.
 */
export const meta: PageSectionMeta = { order: -1, nav: [] };

/** The registered form: the page hands the whole nav in as `nav`. */
export default function LmsFloatingNavSection({ nav }: PageSectionProps) {
  return <LmsFloatingNav items={nav} />;
}
