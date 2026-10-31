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

// Supacharge's Back to top button (lms_sdk 1.40.0), registered with
// base_sdk >= 1.56.0's style registry
// (components/custom/landing/back-to-top-style.ts) through this SDK's
// manifest integration, so it is the button on every route of the shell
// where lms_sdk is home - the landing's framed copy and the root copy on
// every other page read it alike. Ray, 2026-10-31: the button must not look
// the same on every site; each site takes its own design language.
//
// Supacharge's language is loud and kinetic: the Montserrat brand face set
// heavy and in capitals, one hot orange, a dark-first surface. So the
// button is a LINE ARROW (Ray, 2026-10-31: "I want a line arrow. It start
// at bottom get cut, text in, text end line continue a bit then the
// point."; "If it's line it can be bold is fine"): a bold orange line
// starts at the bottom, breaks for the label - SCROLL TO TOP in Montserrat
// Black capitals, reading upward - resumes for a short run and ends in a
// solid point, with nothing behind any of it. The config below is base's
// text-arrow (head over label) and sets the words and their type;
// ./lms-back-to-top.css, imported here, adds the two line segments and the
// larger head. The wording is the `label` field, so a site changes it in
// data/theme.json without touching this file:
//
//   { "backToTop": { "label": "Back to top" } }
//
// A springy overshoot on hover and fade (motion only for visitors who have
// not asked for less).
//
// Every value names a Supacharge token, falling back to base's shadcn
// token where the page has no `.sc-landing` scope (an admin page):
// --sc-primary (#ff6600), --sc-star for the hover warmth, --sc-font-brand
// (Montserrat via next/font/local, lms-fonts.ts). The halo behind the
// words and the line is the page's own --sc-surface, so the arrow reads on
// the dark and the light sets alike.

import type { BackToTopConfig } from "@/components/custom/landing/back-to-top";
import "./lms-back-to-top.css";

export const LMS_BACK_TO_TOP: BackToTopConfig = {
  shape: "text-arrow",
  position: "bottom-right",
  label: "Scroll to top",
  foreground: "var(--sc-primary, hsl(var(--primary)))",
  hoverForeground: "var(--sc-star, hsl(var(--primary)))",
  halo: "color-mix(in srgb, var(--sc-surface, hsl(var(--background))) 80%, transparent)",
  fontFamily: "var(--sc-font-brand, inherit)",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.8125rem",
  duration: "280ms",
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

export default LMS_BACK_TO_TOP;
