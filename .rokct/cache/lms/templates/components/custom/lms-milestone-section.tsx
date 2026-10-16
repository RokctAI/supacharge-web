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
// 1.37.2 (Ray, 2026-10-16: "the milestone rectable need to come close to
// the brandname and it needs to collapse to a pilll or a circle with a
// lightning icon. this collapse and expand need to keep animating but
// taking longer"): a lightning bolt leads the text, and the banner loops
// on its own - the full rectangle held for 6s, folding over 1.2s into a
// circle that shows only the bolt, held for 3s, opening again over 1.2s
// (`sc-milestone-cycle` in landing/lms-theme.css, pure CSS, so this stays
// a server component). The words never leave the DOM: they are clipped,
// never display:none, so the link's accessible name is the whole text in
// either state. Reduced motion, a pointer over it or keyboard focus on it
// hold it open. The hero's top padding and the brand row's top margin
// are cut in the same file so the banner sits just above the wordmark.
//
// No "use client" here (1.24.0): base reads `meta` in the SERVER render.

import React from "react";
import { RiFlashlightFill } from "@remixicon/react";

import { LMS_MILESTONE } from "@/components/custom/landing/lms-milestone";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

/**
 * Before the hero (negative order) and after the theme (-2) and the
 * floating nav (-1); no floating-nav tick of its own: it sits in the
 * hero's tick, and the band at the bottom carries the "Milestone" tick
 * (lms-milestone-band-section.tsx, 1.37.2). No anchor of its own: the
 * band's anchor (LMS_MILESTONE.anchor) belongs to the band at the bottom.
 */
export const meta: PageSectionMeta = {
  order: -0.5,
  nav: [],
};

export function LmsMilestonePill() {
  const m = LMS_MILESTONE;
  return (
    <div className="sc-milestone-slot container mx-auto flex max-w-6xl justify-center px-4 xl:px-0" data-lms-milestone="">
      <a
        href={`#${m.anchor}`}
        className="sc-milestone-banner max-w-full"
        data-milestone-pill=""
      >
        <RiFlashlightFill className="sc-milestone-icon" aria-hidden="true" />
        <span className="sc-milestone-text" data-milestone-text="">
          <span className="sc-milestone-words">
            <span className="sc-milestone-label font-extrabold uppercase tracking-wider">
              {m.pill.label}
              <span aria-hidden="true"> · </span>
            </span>
            <span className="font-semibold">{m.pill.text}</span>
          </span>
        </span>
      </a>
    </div>
  );
}

/** The registered form. */
export default function LmsMilestonePageSection() {
  return <LmsMilestonePill />;
}
