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

// The landing page's subjects section: the CAPS phases Supacharge teaches
// or is adding, one clickable grade-phase tab each, and the selected
// phase's subjects - with the tutor duo on each live one - in the grid
// below. Copy: LMS_LANDING_CONFIG.subjects. The eyebrow is the curriculum
// line (landing/lms-curricula.tsx, 1.25.0): "Built for CAPS, IEB and
// Cambridge", the soon pill after Cambridge.
//
// 1.35.2 drew a fixed "Grades 8 to 12" badge, a "Grades R to 3" chip with
// the soon pill beside it and one grid of every Grades 8 to 12 subject.
// Ray, 2026-10-02, on seeing it: "i think there has to be another for
// grade R-3 with its subjects and make those rectangle clickable with
// default to grade 8-9. i also think this section also need another soon
// with grade 4-7". Since 1.36.0 the rectangles are tabs
// (lms-subjects-section.client.tsx): Grades R to 3 and Grades 4 to 7 with
// the pill, Grades 8 to 9 and Grades 10 to 12 live, Grades 8 to 9 selected
// on first paint, and the grid is the selected phase's own subjects.
// Since 1.36.1 (Ray, 2026-10-02, approving the regrouping) the tabs are
// the CAPS phases by subject set: Grades R to 3 and Grades 4 to 6 with the
// pill, Grades 7 to 9 (selected on first paint; Grades 8 and 9 live, Grade
// 7 on the way) and Grades 10 to 12.
//
// Ray, 2026-09-09, naming this section: "most cards should be one row in
// mobile. even subjects cards". Six subjects stacked is six screens of
// thumb, so below 640px the grid is one swipeable row (`sc-row`,
// landing/lms-theme.css); from 640px up it is unchanged.
//
// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. This
// entry module is the server-readable half: `meta`, the registered default
// export and the section's heading, which need no client. The tabs, which
// hold the selected phase in state, are ./lms-subjects-section.client.tsx,
// which this entry renders under the heading.

import React from "react";

import { LmsCurricula } from "@/components/custom/landing/lms-curricula";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";
import { LmsSubjectsPhases } from "@/components/custom/lms-subjects-section.client";

export function LmsSubjectsSection({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.subjects;
  if (!config || config.phases.length === 0) return null;

  return (
    <section id={id} className="w-full bg-[var(--sc-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-5">
          <p className="sc-eyebrow">
            <LmsCurricula />
          </p>
          <h2 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
            {config.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
            {config.blurb}
          </p>
        </div>

        <LmsSubjectsPhases id={id} />
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
  order: 20,
  nav: [{ id: "subjects", label: "Subjects" }],
};

export default LmsSubjectsSection;
