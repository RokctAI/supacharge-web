"use client";

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

// The client half of lms-subjects-section.tsx (1.36.0): the grade-phase
// tabs and the subject grid of the selected phase. Copy and phases:
// LMS_LANDING_CONFIG.subjects.
//
// Ray, 2026-10-02, on the 1.35.2 section (a fixed "Grades 8 to 12" badge, a
// "Grades R to 3" chip with the soon pill beside it, one grid of every
// Grades 8 to 12 subject): "i think there has to be another for grade R-3
// with its subjects and make those rectangle clickable with default to
// grade 8-9. i also think this section also need another soon with grade
// 4-7". So the rectangles are tabs - one per phase, in grade order, each
// the same outlined rectangle lms-curricula.tsx draws for a badged
// curriculum (LmsPhaseGrades, `outlined`), the pill still after a phase on
// its way - and the grid below is the selected phase's own subjects. The
// selection is React state here, the config's `defaultPhase` on first
// paint (the Senior Phase tab, since 1.36.1 "Grades 7 to 9"), so the
// server renders that tab selected and its grid in the first HTML; no URL
// state, nothing remembered between visits.
//
// The tabs follow the WAI-ARIA tabs pattern: a `tablist` of real <button
// role="tab"> elements, `aria-selected` on the chosen one, each tab naming
// its panel (`aria-controls`) and each panel its tab (`aria-labelledby`),
// the roving tabindex so Tab lands on the selected tab once and the arrow
// keys (Left/Right, Home/End) move the selection along the list. A click
// or a key selects; nothing depends on hover. Only the selected panel is
// in the DOM, so a screen reader hears one grid. Since 1.36.1 the row of
// tabs is landing/lms-grade-tabs.tsx (LmsGradeTabs), the one the tutors
// section's grade filters wear too; this half keeps the selection and the
// panel.
//
// Since 1.36.1 (Ray, 2026-10-02, approving the regrouping) the tabs are
// the CAPS phases by subject set - Grades R to 3, 4 to 6, 7 to 9, 10 to
// 12 - so the Senior Phase tab is live while its Grade 7 is still on the
// way: the panel's text says so and the phase's `pending` chip ("Grade 7"
// with the pill, the same rectangle through LmsPhaseGrades) follows the
// text. The pill is never on a live tab.
//
// A subject the roster casts nobody for yet has no duo (Subject.tutors is
// absent): the card shows the name and, where the subject is not taken by
// the whole phase, its grades ("Grade 8" on an EMS row). A live phase's card shows the
// Expert and Simplifier rows the 1.35.2 grid showed. Since 1.36.22 a phase
// on its way shows the duos the roster already casts, and a solo subject
// (kids mode, Grades R to 3) one "Tutor" row (Subject.tutor).
//
// Kids mode (1.37.1; Ray, 2026-10-16: "make the card for grade r-3 in
// nextjs landing page be kids mode"): a phase with `kidsMode` (Foundation
// Phase, Grades R to 3) draws KidsSubjectCard instead - the app's kids mode
// look, the cream background, dark ink and bright tile colours of the
// Grades R-3 library (lms/dart r3_session_page.dart kR3Background,
// r3_picture.dart kR3TileColors and kR3Ink; `.sc-kids-*` in
// landing/lms-theme.css). The palette is fixed: the card stays light in the
// site's dark theme, as the library is light in the app's. The row of six
// tile colours is decoration (aria-hidden); the pill reads the config's
// `kidsMode.badge` and the tutor row its `kidsMode.tutorLabel`.
//
// Coming soon (1.37.3; Ray, 2026-10-16: "i think show all but if we add
// soon will it change on its own when lessons for the third is
// available?"): the tab names all four CAPS Foundation Phase subjects, and
// a card whose subject the app ships no lessons for wears a second pill,
// `kidsMode.soonLabel`. Whether it does is kidsSubjectSoon over the
// subject's `key` and R3_SUBJECTS_WITH_PACKS, the generated
// landing/lms-r3-availability.ts (scripts/gen_r3_availability.py, from the
// app's lms/dart/templates/assets/r3_packs/index.json) - never a flag in
// the config - so when the packs for a subject ship and the file is
// regenerated (a test fails until it is), its pill comes off by itself.
// A kids card now also shows the subject's grades when it is not taught
// through the whole phase ("Grades 1 to 3" on English First Additional
// Language).
//
// Below 640px the grid is one swipeable row (`sc-row`, landing/lms-theme.css;
// Ray, 2026-09-09: "most cards should be one row in mobile. even subjects
// cards"); from 640px up it is the two- then three-column grid.

import React, { useState } from "react";

import { LmsPhaseGrades } from "@/components/custom/landing/lms-curricula";
import { LmsGradeTabs, gradeTabIds } from "@/components/custom/landing/lms-grade-tabs";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import { R3_SUBJECTS_WITH_PACKS } from "@/components/custom/landing/lms-r3-availability";
import type {
  KidsModeLabels,
  Phase,
  Subject,
} from "@/components/custom/landing/lms-landing-config";

/**
 * The Grades R-3 library's tile colours, in the app's order (lms/dart
 * r3_picture.dart kR3TileColors). Mirrored as `--sc-kids-tile-1..6` in
 * landing/lms-theme.css; exported for the tests.
 */
export const KIDS_TILE_COLORS = [
  "#FFE08A",
  "#B8E6FF",
  "#C8F2C2",
  "#FFC9DE",
  "#E2D4FF",
  "#FFD2B0",
] as const;

/**
 * Whether a kids mode card wears the "Coming soon" pill (1.37.3): its
 * subject has a pack subject id (`key`) and the app ships no packs for it
 * (`withPacks`, R3_SUBJECTS_WITH_PACKS of the generated
 * lms-r3-availability.ts). A subject without a key claims nothing either
 * way. Exported for the tests.
 */
export function kidsSubjectSoon(key: string | undefined, withPacks: readonly string[]): boolean {
  return key !== undefined && !withPacks.includes(key);
}

/**
 * The phase selected on first paint: the config's `defaultPhase` by name,
 * else the first live (unbadged) phase, else the first phase. Exported for
 * the tests; the component calls it once, for the initial state.
 */
export function defaultPhaseOf(phases: Phase[], defaultPhase: string): Phase | undefined {
  return (
    phases.find((phase) => phase.name === defaultPhase) ??
    phases.find((phase) => !phase.badge) ??
    phases[0]
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <div className="flex flex-col gap-4 sc-card p-6 transition-colors hover:border-[var(--sc-primary)]">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-black tracking-tight text-[var(--sc-ink)]">
          {subject.name}
        </h3>
        {subject.grades ? (
          <span className="text-sm font-medium text-[var(--sc-ink-2)]">{subject.grades}</span>
        ) : null}
        {subject.skills ? (
          <span className="text-sm text-[var(--sc-ink-2)]">{subject.skills}</span>
        ) : null}
      </div>
      {subject.tutors ? (
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--sc-ink-2)]">Expert</dt>
            <dd className="font-semibold text-[var(--sc-ink)]">{subject.tutors[0]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--sc-ink-2)]">Simplifier</dt>
            <dd className="font-semibold text-[var(--sc-ink)]">{subject.tutors[1]}</dd>
          </div>
        </dl>
      ) : subject.tutor ? (
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--sc-ink-2)]">Tutor</dt>
            <dd className="font-semibold text-[var(--sc-ink)]">{subject.tutor}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

/**
 * A kids mode subject card (1.37.1): the same name, skills line and tutor
 * row as SubjectCard, on the R-3 library's cream with its tile colours.
 * `index` picks the card's accent tile, so neighbours differ.
 */
function KidsSubjectCard({
  subject,
  labels,
  index,
}: {
  subject: Subject;
  labels: KidsModeLabels;
  index: number;
}) {
  const tile = (index % KIDS_TILE_COLORS.length) + 1;
  const soon = kidsSubjectSoon(subject.key, R3_SUBJECTS_WITH_PACKS);
  return (
    <div
      className={`sc-kids-card sc-kids-accent-${tile} flex flex-col gap-4 p-6`}
      data-kids-card=""
    >
      <div className="flex items-center justify-between gap-3">
        <span aria-hidden="true" className="flex gap-1.5">
          {KIDS_TILE_COLORS.map((_, i) => (
            <span key={i} className={`sc-kids-tile sc-kids-tile-${i + 1}`} />
          ))}
        </span>
        <span className="flex flex-wrap justify-end gap-1.5">
          <span className="sc-kids-badge">{labels.badge}</span>
          {soon ? (
            <span className="sc-kids-badge sc-kids-badge-upcoming" data-kids-soon="">
              {labels.soonLabel}
            </span>
          ) : null}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="sc-kids-ink text-2xl font-black tracking-tight">{subject.name}</h3>
        {subject.grades ? (
          <span className="sc-kids-ink text-sm font-semibold">{subject.grades}</span>
        ) : null}
        {subject.skills ? (
          <span className="sc-kids-ink-2 text-sm leading-relaxed">{subject.skills}</span>
        ) : null}
      </div>
      {subject.tutor ? (
        <dl className="mt-auto flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="sc-kids-ink-2">{labels.tutorLabel}</dt>
            <dd className="sc-kids-ink font-bold">{subject.tutor}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}

/**
 * The tabs and the selected phase's grid. `id` is the section's DOM id,
 * the prefix of every tab and panel id so two sections could never share
 * one.
 */
export function LmsSubjectsPhases({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.subjects;
  const phases = config?.phases ?? [];
  const [selectedName, setSelectedName] = useState<string | undefined>(
    () => (config ? defaultPhaseOf(phases, config.defaultPhase)?.name : undefined),
  );

  if (!config || phases.length === 0) return null;
  const selected = phases.find((phase) => phase.name === selectedName) ?? phases[0];
  const prefix = id ?? "subjects";
  const ids = gradeTabIds(prefix, selected.name);

  return (
    <>
      <LmsGradeTabs
        tabs={phases}
        selected={selected.name}
        onSelect={setSelectedName}
        label={config.heading}
        prefix={prefix}
      />

      <div
        role="tabpanel"
        id={ids.panel}
        aria-labelledby={ids.tab}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <h3 className="text-2xl font-black tracking-tight text-[var(--sc-ink)]">
            {selected.name}
          </h3>
          <p className="text-sm md:text-base text-[var(--sc-ink-2)] leading-relaxed max-w-2xl">
            {selected.text}
          </p>
          {selected.pending ? (
            <span className="text-sm font-medium text-[var(--sc-ink)]">
              <LmsPhaseGrades phase={selected.pending} />
            </span>
          ) : null}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sc-row">
          {selected.subjects.map((subject, index) => {
            const key = subject.grades ? `${subject.name} ${subject.grades}` : subject.name;
            return selected.kidsMode ? (
              <KidsSubjectCard
                key={key}
                subject={subject}
                labels={selected.kidsMode}
                index={index}
              />
            ) : (
              <SubjectCard key={key} subject={subject} />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default LmsSubjectsPhases;
