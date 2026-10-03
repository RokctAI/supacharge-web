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


// The company's TEAM page (1.36.9; Ray, 2026-10-03: the About page's
// "Meet the team" button and the footer's Team link both went to an empty
// /team). corporate_sdk owns /team as a renderer: it draws the shell's
// data/team.json and then whatever the home SDK registered for the page
// through base_sdk's `pageSectionsFor("team")`. Supacharge has no
// team.json and lms registered nothing for "team", so the page fell to its
// empty line. This section is that registration: `meta.page: "team"` -
// base_sdk 1.38.0's page slot - so the landing never draws it or lists it
// in the floating nav.
//
// No "use client" here (the 1.24.0 contract): base reads `meta` in the
// SERVER render. The component - the landing's tutors section and the
// founder card, both client components - is ./lms-team-section.client.tsx.

import React from "react";

import { LmsTeamSection } from "@/components/custom/lms-team-section.client";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/**
 * What this section adds when registered: the team page, first in its
 * flow, no floating-nav entry (a company page has no floating nav).
 */
export const meta: PageSectionMeta = {
  page: "team",
  order: 10,
  nav: [],
  renders: () => true,
};

/** The registered form: the sign-up URL feeds the tutor cards' "Start with" action. */
export default function LmsTeamPageSection({ id, signupUrl }: PageSectionProps) {
  return <LmsTeamSection id={id} signupUrl={signupUrl} />;
}
