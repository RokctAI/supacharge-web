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

"use client";

// Registers Supacharge's look (landing/lms-theme.tsx) as the first entry of
// base_sdk's landing host: a negative order, before the floating nav, so the
// tokens and fonts are on <html> for every other section and for the hero the
// host renders between them. The light/dark mode is the host shell's, not
// ours - lms-theme.tsx only defaults it to dark when nothing has chosen.
// Renders nothing visible and is not a nav stop.

import React from "react";

import { LmsTheme } from "@/components/custom/landing/lms-theme";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = { order: -2, nav: [] };

export default function LmsThemeSection(_props: PageSectionProps) {
  return <LmsTheme />;
}
