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


// The landing's milestone pill (1.36.16; Ray, 2026-10-08): a one-line
// link to the 2026 GSE Digital Startup Accelerator band, right under the
// nav. Copy: landing/lms-milestone.ts.
//
// 1.36.17 (Ray, 2026-10-09: "Banner stay there but the big blocl moves to
// the bottom"): this entry keeps only the pill at the top; the orange band
// moved to lms-milestone-band-section.tsx, the last section before the
// footer, and the pill now scrolls down to it. The ticker of session facts
// that ran under the band is gone (Ray: it "should be out"; he never asked
// for it, and the landing does not spell out how lessons are made).
//
// A negative order puts it before the hero, which base_sdk's
// landing-content.tsx renders straight under the sticky header - the only
// slot above the hero a home SDK has.
//
// 1.36.21 (Ray, 2026-10-09): a solid rectangle with no border - white
// with black text in dark mode, the primary with white text in light mode
// (.sc-milestone-banner in landing/lms-theme.css).
//
// No "use client" here (1.24.0): base reads `meta` in the SERVER render.

import React from "react";

import { LMS_MILESTONE } from "@/components/custom/landing/lms-milestone";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

/**
 * Before the hero (negative order) and after the theme (-2) and the
 * floating nav (-1); no floating-nav tick. No anchor of its own: the
 * band's anchor (LMS_MILESTONE.anchor) belongs to the band at the bottom.
 */
export const meta: PageSectionMeta = {
  order: -0.5,
  nav: [],
};

export function LmsMilestonePill() {
  const m = LMS_MILESTONE;
  return (
    <div className="container mx-auto flex max-w-6xl justify-center px-4 pt-4 xl:px-0" data-lms-milestone="">
      <a
        href={`#${m.anchor}`}
        className="sc-milestone-banner max-w-full text-center text-xs sm:text-sm"
        data-milestone-pill=""
      >
        <span className="font-extrabold uppercase tracking-wider">{m.pill.label}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold">{m.pill.text}</span>
      </a>
    </div>
  );
}

/** The registered form. */
export default function LmsMilestonePageSection() {
  return <LmsMilestonePill />;
}
