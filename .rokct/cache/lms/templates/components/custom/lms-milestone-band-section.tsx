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


// The landing's milestone band (1.36.16; Ray, 2026-10-08, modelled on a
// full-width announcement band): the 2026 GSE Digital Startup Accelerator
// selection. Copy: landing/lms-milestone.ts.
//
// 1.36.17 (Ray, 2026-10-09: "Banner stay there but the big blocl moves to
// the bottom"): the band is the last section before the footer (order 92,
// after the testimonials at 90, before the footer at 95). The pill at the
// top (lms-milestone-section.tsx) links down to its anchor.
//
// Supacharge orange (--sc-primary) edge to edge: the eyebrow, heading, one
// line and the outline pill to the official announcement on the left, a
// dark card with the cohort facts on the right; the columns stack below
// 768px. The band is the same in both colour schemes on purpose: orange
// with near-black ink (about 7:1; white on this orange would fail
// contrast) and a near-black card with white ink.
//
// No "use client" here (1.24.0): base reads `meta` in the SERVER render.

import React from "react";
import { RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react";

import { LMS_MILESTONE } from "@/components/custom/landing/lms-milestone";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/**
 * After the testimonials (90) and before the footer (95); no floating-nav
 * tick. The DOM id is the anchor the pill at the top points at.
 */
export const meta: PageSectionMeta = {
  order: 92,
  nav: [],
  anchor: LMS_MILESTONE.anchor,
};

export function LmsMilestoneBand({ id = LMS_MILESTONE.anchor }: { id?: string }) {
  const m = LMS_MILESTONE;
  const story = m.story;
  return (
    <section
      id={id}
      className="w-full scroll-mt-20 bg-[var(--sc-primary)] text-[#111111]"
      aria-labelledby={`${id}-heading`}
    >
      <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-12 md:py-16 xl:px-0">
        <div className="flex flex-col items-start gap-5 text-left">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em]">{m.eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="text-[28px] md:text-[44px] font-extrabold leading-[1.1] tracking-tight text-balance"
          >
            {m.heading}
          </h2>
          <p className="text-lg font-medium max-w-xl">{m.line}</p>
          <div className="flex flex-wrap gap-3">
            {/* "Read our story" (filled white) goes first here once
                LMS_MILESTONE.story has a public page to point at. */}
            {story && (
              <a
                href={story.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-bold text-[#111111] transition-opacity hover:opacity-90"
              >
                {story.label}
                <RiArrowRightLine className="size-4" aria-hidden="true" />
              </a>
            )}
            <a
              href={m.announcement.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#111111] px-5 py-2.5 font-bold transition-colors hover:bg-[#111111] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
            >
              {m.announcement.label}
              <RiArrowRightUpLine className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        {/* The cohort card: dark in both schemes, faint circle lines behind. */}
        <div className="relative overflow-hidden rounded-3xl bg-[#111111] p-6 text-white shadow-xl md:p-8">
          <svg
            className="pointer-events-none absolute -right-16 -top-16 size-72 text-white/10"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="100" cy="100" r="40" stroke="currentColor" />
            <circle cx="100" cy="100" r="65" stroke="currentColor" />
            <circle cx="100" cy="100" r="90" stroke="currentColor" />
          </svg>
          <div className="relative flex min-h-[14rem] flex-col justify-between gap-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{m.card.top}</p>
            <p className="text-[40px] md:text-[52px] font-extrabold leading-none tracking-tight">
              {m.card.big}
            </p>
            <p className="border-t border-white/15 pt-4 font-semibold text-white/85">{m.card.bottom}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The registered form: base hands the DOM id (meta.anchor) as `id`. */
export default function LmsMilestoneBandPageSection({ id }: PageSectionProps) {
  return <LmsMilestoneBand id={id} />;
}
