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


// The founder card on the company's ABOUT page (lms_sdk 1.27.0; Ray,
// 2026-09-10: corporate_sdk owns /about and /team as renderers, and
// Supacharge's about page reuses this SDK's founder card). Registered in
// base_sdk's one section registry (components/custom/landing/page-sections.ts)
// with `meta.page: "about"` - base_sdk 1.38.0's page slot - so the landing
// never draws it or lists it in the floating nav, and corporate_sdk's
// app/about/page.tsx receives it through base's `pageSectionsFor("about")`
// with the same PageSectionProps a landing section gets.
//
// No "use client" here (the 1.24.0 contract): base reads `meta` in the
// SERVER render. This entry module is the server-readable half: `meta`
// and the registered default export. The component - the half that
// needs the client (the "Hear more" playback state) - is
// ./lms-founder-section.client.tsx, which the default export renders.

import React from "react";

import { LmsFounderSection } from "@/components/custom/lms-founder-section.client";
import { LMS_FOUNDERS } from "@/components/custom/landing/lms-founders";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/**
 * What this section adds when registered: the about page, first in its
 * flow, no floating-nav entry (a company page has no floating nav), and
 * only when there is a founder to draw.
 */
export const meta: PageSectionMeta = {
  page: "about",
  order: 10,
  nav: [],
  renders: () => LMS_FOUNDERS.length > 0,
};

/** The registered form: the page's sign-up URL is what the card contract takes, though a founder card never links to it. */
export default function LmsFounderPageSection({ id, signupUrl }: PageSectionProps) {
  return <LmsFounderSection id={id} signupUrl={signupUrl} />;
}
