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

// Registers Supacharge's look (landing/lms-theme.tsx) as the first entry of
// base_sdk's landing host: a negative order, before the floating nav, so the
// tokens and fonts are on <html> for every other section and for the hero the
// host renders between them. The light/dark mode is the host shell's, not
// ours - lms-theme.tsx only defaults it to dark when nothing has chosen.
//
// Since 1.24.0 `meta.rootClass` names the same classes for the landing's
// ROOT element: base_sdk 1.32.0 renders the landing on the server and joins
// every section's rootClass onto that root in the first HTML
// (components/custom/landing/page-sections.ts), so the token class and the
// font variables are there before any script runs and the no-JS render is
// themed. LMS_ROOT_CLASS is the one list lms-theme.tsx's effect also puts on
// <html>. Renders nothing visible (one <style> rule) and is not a nav stop.
//
// No "use client" here, on purpose: base reads `meta` in the SERVER render,
// and every export of a client module is a client reference there (Next
// compiles it to registerClientReference; `meta.rootClass`, `meta.order`
// and `meta.nav` all read as undefined, so the class never reached the
// root, the section fell to order 100 and the nav listed it by id). This
// module has nothing that needs the client - its component only renders
// the client LmsTheme - so it is a server module, its meta a plain object,
// and LMS_ROOT_CLASS comes from landing/lms-theme-classes.ts, which is
// server-readable for the same reason.

import React from "react";

import { LmsTheme } from "@/components/custom/landing/lms-theme";
import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: -2,
  nav: [],
  rootClass: LMS_ROOT_CLASS,
};

export default function LmsThemeSection(_props: PageSectionProps) {
  return <LmsTheme />;
}
