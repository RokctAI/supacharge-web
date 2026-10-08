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


// The 2026 GSE Digital Startup Accelerator selection (Ray, 2026-10-08),
// one place for every word of it: the landing's milestone band
// (lms-milestone-section.tsx, right under the nav, with its pill and its
// ticker) and the About page's Programmes strip
// (lms-founder-section.client.tsx) both read it from here.
//
// Every fact is the announcement's own (Global Startup Ecosystem, 7 Oct
// 2026, linked below): 200 entrepreneurs selected for the 9th Annual GSE
// Digital Startup Accelerator, founders from more than 30 countries and
// markets, live programming 8, 15, 22 and 29 October 2026. It is a
// selection into a programme - never an award, a partnership or an
// endorsement - so no GSE logo is drawn and nothing here sits in a
// "trusted by" row. No funding, no quote, no cohort number.

export const LMS_MILESTONE_ANNOUNCEMENT_URL =
  "https://www.linkedin.com/pulse/global-startup-ecosystem-announces-200-entrepreneurs-selected-ntim-iikme/";

export const LMS_MILESTONE = {
  /** The band's DOM id: the pill's in-page target. */
  anchor: "gse-milestone",
  /** The pill at the top of the landing, linking to the band. */
  pill: {
    label: "Supacharge milestone",
    text: "Selected for the 2026 GSE Digital Startup Accelerator",
  },
  eyebrow: "A Supacharge milestone",
  heading: "Supacharge has been selected for the 2026 GSE Digital Startup Accelerator",
  line: "One of 200 founders selected for the 9th annual programme (8–29 Oct 2026).",
  announcement: {
    label: "Official GSE announcement",
    href: LMS_MILESTONE_ANNOUNCEMENT_URL,
  },
  // A slot, not a link: "Read our story" (the filled white pill) waits for
  // a public blog to point at. Give it an href here and the band draws it.
  story: null as { label: string; href: string } | null,
  card: {
    top: "GSE Digital Startup Accelerator · 2026",
    big: "9th Annual Cohort",
    bottom: "200 founders selected from 30+ countries and markets",
  },
  /** The About page's Programmes strip. */
  about: {
    eyebrow: "Programmes",
    badge: "Selected: 2026 GSE Digital Startup Accelerator",
  },
} as const;
