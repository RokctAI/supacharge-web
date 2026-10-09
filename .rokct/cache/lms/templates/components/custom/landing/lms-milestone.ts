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
// one place for every word of it: the landing's milestone pill
// (lms-milestone-section.tsx, right under the nav), its band
// (lms-milestone-band-section.tsx, at the bottom of the landing since
// 1.36.17) and the About page's Programmes strip
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

/** One milestone: a slide in the landing's milestone band. */
export interface Milestone {
  /** A stable key, unique across LMS_MILESTONES. */
  key: string;
  /** The pill at the top of the landing (drawn for the newest only). */
  pill: { label: string; text: string };
  eyebrow: string;
  heading: string;
  line: string;
  announcement: { label: string; href: string };
  /** The filled white "Read our story" pill; null until there is a public page. */
  story: { label: string; href: string } | null;
  /** The dark card on the right of the slide. */
  card: { top: string; big: string; bottom: string };
  /** The About page's Programmes strip (read from the newest only). */
  about: { eyebrow: string; badge: string };
}

/** The band's DOM id: the pill's in-page target, whichever slide shows. */
export const LMS_MILESTONE_ANCHOR = "gse-milestone";

const GSE_2026: Milestone = {
  key: "gse-2026",
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
  story: null,
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
};

// Ray, 2026-10-09: "that milestone section will auto scroll to left when
// more milestones are added". Newest first: the band shows them as slides
// that advance to the left on their own once there are two or more; with
// one it stands still. Add a milestone by putting it at the front.
export const LMS_MILESTONES: readonly Milestone[] = [GSE_2026];

/**
 * The newest milestone: what the pill at the top and the About page's
 * Programmes strip read. The anchor is the band's, shared by every slide.
 */
export const LMS_MILESTONE = { ...LMS_MILESTONES[0], anchor: LMS_MILESTONE_ANCHOR } as const;
