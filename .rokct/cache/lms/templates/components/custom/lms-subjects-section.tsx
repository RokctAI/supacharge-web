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

"use client";

// The landing page's subject grid: the CAPS subjects Supacharge teaches and
// the tutor duo on each. Copy: LMS_LANDING_CONFIG.subjects.
//
// Ray, 2026-09-09, naming this section: "most cards should be one row in
// mobile. even subjects cards". Six subjects stacked is six screens of
// thumb, so below 640px the grid is one swipeable row (`sc-row`,
// landing/lms-theme.css); from 640px up it is unchanged.

import React from "react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function LmsSubjectsSection({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.subjects;
  if (!config || config.subjects.length === 0) return null;

  return (
    <section id={id} className="w-full bg-[var(--sc-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-5">
          <p className="sc-eyebrow">
            {config.eyebrow}
          </p>
          <h2 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
            {config.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
            {config.blurb}
          </p>
          <span className="sc-badge-primary text-sm">
            {config.grades}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sc-row">
          {config.subjects.map((subject) => (
            <div
              key={subject.name}
              className="flex flex-col gap-4 sc-card p-6 transition-colors hover:border-[var(--sc-primary)]"
            >
              <h3 className="text-2xl font-black tracking-tight text-[var(--sc-ink)]">
                {subject.name}
              </h3>
              <dl className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--sc-ink-2)]">Expert</dt>
                  <dd className="font-semibold text-[var(--sc-ink)]">
                    {subject.tutors[0]}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--sc-ink-2)]">Simplifier</dt>
                  <dd className="font-semibold text-[var(--sc-ink)]">
                    {subject.tutors[1]}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
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
