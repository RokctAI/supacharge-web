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
// Ray, 2026-09-10: "i think cambridge and its label should be in a border
// only rectangle to give it distiction."; 2026-09-11: "give the border
// primary color". The non-breaking span a badged name and its pill already
// share is that rectangle: it carries `sc-curriculum-outlined`
// (lms-theme.css: a 1px primary-token border, no fill, 10px corners, tight
// padding) and `data-curriculum-outlined` for the tests. An unbadged name has no span, so CAPS and IEB are exactly as they
// were.
//
// Since 1.35.2 the same rectangle also carries a phase on its way
// (LMS_LANDING_CONFIG.subjects.phases; Ray, 2026-10-02: "R-3 need to be
// added to landing page with soon label"): LmsPhaseGrades draws "Grades R
// to 3" and its pill through CurriculumName itself, so there is still one
// outlined span and one pill rule, and the word "soon" is still never
// written in copy.
//
// Since 1.36.0 the rectangle is also the subjects section's tab (Ray,
// 2026-10-02: "make those rectangle clickable with default to grade 8-9"):
// every phase, live or on its way, is a clickable rectangle there, so
// CurriculumName takes `outlined` to draw the span around a name that has
// no badge. The pill still follows a badge and nothing else; LmsCurricula
// never asks for the outline, so CAPS and IEB are still bare names, and the
// span is still the one place the class and the attribute live.
//
// No "use client": MenuLabel is a plain component, so the server entries
// (lms-subjects-section.tsx, lms-features-section.tsx) render this on the
// server and the pill is in the first HTML; the subjects section's client
// half (lms-subjects-section.client.tsx) renders the same component inside
// its tabs, where it is plain JSX like anything else.

import React from "react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { Curriculum } from "@/components/custom/landing/lms-landing-config";
import type { GradesChip } from "@/components/custom/landing/lms-landing-config";
import { MenuLabel } from "@/components/custom/menu-label";

/**
 * The separator before item `index` of `count`: none first, ", " between,
 * " and " before the last - "CAPS, IEB and Cambridge".
 */
export function curriculumSeparator(index: number, count: number): string {
  if (index === 0) return "";
  return index === count - 1 ? " and " : ", ";
}

/**
 * One name and, when its entry carries a badge, the pill right after it,
 * the two in the border-only rectangle. `outlined` (1.36.0) asks for the
 * rectangle around a name without a badge - a live phase's tab; it never
 * adds a pill.
 */
function CurriculumName({ item, outlined }: { item: Curriculum; outlined?: boolean }) {
  if (!item.badge && !outlined) return <>{item.name}</>;
  return (
    <span
      className="sc-curriculum-outlined inline-flex items-center gap-1.5 whitespace-nowrap align-baseline"
      data-curriculum-outlined=""
    >
      {item.name}
      {item.badge ? <MenuLabel badge={item.badge} /> : null}
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

/**
 * A phase's grades with its pill after them - "Grades R to 3" then the
 * soon pill - in the rectangle a badged curriculum wears (1.35.2). Inline
 * content only, like LmsCurricula. `outlined` (1.36.0) draws the rectangle
 * around a live phase's grades too, for the subjects section's tabs, where
 * every phase is one rectangle; the Subjects feature card leaves it off.
 * `phase` is anything with grades and a badge (GradesChip, 1.36.1): a
 * Phase for its tab, or a phase's `pending` chip ("Grade 7" and the pill).
 */
export function LmsPhaseGrades({ phase, outlined }: { phase: GradesChip; outlined?: boolean }) {
  return (
    <CurriculumName item={{ name: phase.grades, badge: phase.badge }} outlined={outlined} />
  );
}

export default LmsCurricula;
