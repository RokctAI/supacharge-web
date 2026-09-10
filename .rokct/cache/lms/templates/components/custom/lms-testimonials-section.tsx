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

// The landing page's testimonials: since 1.10.0 the same auto-scrolling row
// rokct.ai runs (Ray, 2026-09-09: Supacharge is to inherit rokct.ai's
// auto-scrolling testimonials), rendered through base_sdk >= 1.14.0's
// components/custom/landing/testimonials-marquee.tsx - the row that pauses
// under the pointer and stands still under prefers-reduced-motion. This
// file keeps the section frame and the heading and hands the marquee the
// quotes; the card and the edge fades are re-themed through the two class
// props the marquee exposes, so the cards stay Supacharge's (`sc-card`,
// --sc-ink) on the same ground as the rest of the page and the fades match
// that ground.
//
// Quotes: LMS_LANDING_CONFIG.testimonials, whose five items are ALL
// PLACEHOLDER stand-ins rather than real customers until genuine quotes
// exist (see LMS_LANDING_PLACEHOLDERS) - they render as ordinary
// testimonials, which is the point. The isPlaceholder check below is for
// the `[[TOKEN]]` state this section used to be in, and still applies if an
// entry is ever emptied back to a token: a token is shown as such, bare,
// never wrapped in quotation marks and dressed up as somebody's words. A
// null config renders nothing.
//
// The marquee is one horizontal row at every width, so the `sc-row` swipe
// row this section used below 640px (1.8.0) is no longer needed here: the
// cards move by themselves and, with motion turned off, scroll by hand.

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. Nothing in
// this module needs the client - no state, no effect, no browser API - so
// it is a server module and its meta a plain object.

import React from "react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";
import { TestimonialsMarquee } from "@/components/custom/landing/testimonials-marquee";

const isPlaceholder = (text: string) => /^\[\[.*\]\]$/.test(text.trim());

/**
 * The marquee's card, in Supacharge's chrome. `w-[350px] shrink-0 h-full`
 * are what the marquee needs of a card (a fixed width, so the track's
 * length is known and one third of it is exactly one copy of the items);
 * the rest is the card this section drew before - `sc-card` for the
 * surface, border and radius out of landing/lms-theme.css, the same p-6.
 */
const CARD_CLASS =
  "sc-card sc-marquee-card flex w-[350px] shrink-0 flex-col justify-between gap-5 p-6 h-full";

export function LmsTestimonialsSection({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.testimonials;
  if (!config || config.items.length === 0) return null;

  return (
    <section
      id={id}
      className="w-full bg-[var(--sc-card-alt)] py-16 md:py-24 border-y border-[var(--sc-stroke-subtle)]"
    >
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <h2 className="text-center text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
          {config.heading}
        </h2>
      </div>
      <div className="mt-12">
        <TestimonialsMarquee
          className="sc-marquee"
          items={config.items.map((item) => ({
            text: isPlaceholder(item.quote) ? item.quote : `“${item.quote}”`,
            author: item.author,
            role: item.role,
          }))}
          cardClassName={CARD_CLASS}
          fadeClassName="from-[var(--sc-card-alt)]"
        />
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 90,
  nav: [{ id: "testimonials", label: "Testimonials" }],
};

export default LmsTestimonialsSection;
