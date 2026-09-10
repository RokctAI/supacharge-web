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


// The ONE curriculum line the landing carries, rendered from
// LMS_LANDING_CONFIG.subjects.curricula: "Built for CAPS, IEB and
// Cambridge", with base_sdk's MenuLabel pill after a name whose entry
// carries a badge. The subjects section's eyebrow and the Subjects feature
// card's first list line both render this, so the two cannot drift.
//
// Ray, 2026-09-10: "add soon label in curriculum for cambridge". Cambridge
// was not on the page before (the line read "Built for CAPS and IEB"), so
// it joins the list as the third curriculum, spelled as the backend's
// CURRICULA tuple spells it, and the pill is the only thing after the name:
// the word "soon" is never written in copy. The pill is the same MenuLabel
// the floating nav and the header wear, at its default size; it and the
// name share one non-breaking span so they stay on one line. The line is
// plain text - no link, no choice to disable - so nothing carries
// aria-disabled.
//
// No "use client": MenuLabel is a plain component, so both server entries
// (lms-subjects-section.tsx, lms-features-section.tsx) render this on the
// server and the pill is in the first HTML.

import React from "react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { Curriculum } from "@/components/custom/landing/lms-landing-config";
import { MenuLabel } from "@/components/custom/menu-label";

/**
 * The separator before item `index` of `count`: none first, ", " between,
 * " and " before the last - "CAPS, IEB and Cambridge".
 */
export function curriculumSeparator(index: number, count: number): string {
  if (index === 0) return "";
  return index === count - 1 ? " and " : ", ";
}

/** One name and, when its entry carries a badge, the pill right after it. */
function CurriculumName({ item }: { item: Curriculum }) {
  if (!item.badge) return <>{item.name}</>;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap align-baseline">
      {item.name}
      <MenuLabel badge={item.badge} />
    </span>
  );
}

/**
 * "Built for CAPS, IEB and Cambridge" with the pill after a badged name.
 * Inline content only: the caller supplies the block (`<p>`, `<li>`).
 */
export function LmsCurricula() {
  const config = LMS_LANDING_CONFIG.subjects;
  if (!config || config.curricula.length === 0) return null;
  const count = config.curricula.length;
  return (
    <>
      {config.eyebrow}{" "}
      {config.curricula.map((item, index) => (
        <React.Fragment key={item.name}>
          {curriculumSeparator(index, count)}
          <CurriculumName item={item} />
        </React.Fragment>
      ))}
    </>
  );
}

export default LmsCurricula;
