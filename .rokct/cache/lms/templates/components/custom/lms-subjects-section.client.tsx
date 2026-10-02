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
// selection is React state here, Grades 8 to 9 on first paint (the config's
// `defaultPhase`), so the server renders that tab selected and its grid in
// the first HTML; no URL state, nothing remembered between visits.
//
// The tabs follow the WAI-ARIA tabs pattern: a `tablist` of real <button
// role="tab"> elements, `aria-selected` on the chosen one, each tab naming
// its panel (`aria-controls`) and each panel its tab (`aria-labelledby`),
// the roving tabindex so Tab lands on the selected tab once and the arrow
// keys (Left/Right, Home/End) move the selection along the list. A click
// or a key selects; nothing depends on hover. Only the selected panel is
// in the DOM, so a screen reader hears one grid.
//
// A phase on its way names its subjects without a duo (Subject.tutors is
// absent): the card shows the name and, where the subject is not taken by
// the whole phase, its grades ("Grade 7"). A live phase's card shows the
// Expert and Simplifier rows the 1.35.2 grid showed.
//
// Below 640px the grid is one swipeable row (`sc-row`, landing/lms-theme.css;
// Ray, 2026-09-09: "most cards should be one row in mobile. even subjects
// cards"); from 640px up it is the two- then three-column grid.

import React, { useRef, useState, type KeyboardEvent } from "react";

import { LmsPhaseGrades } from "@/components/custom/landing/lms-curricula";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { Phase, Subject } from "@/components/custom/landing/lms-landing-config";

/** A DOM id from a phase name: "Senior Phase" -> "senior-phase". */
function slugOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

/**
 * Where an arrow or Home/End key moves the selection from `index` of
 * `count`: Right and Down one along (wrapping), Left and Up one back
 * (wrapping), Home to the first, End to the last; any other key leaves it.
 */
export function nextTabIndex(key: string, index: number, count: number): number {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (index + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (index - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return index;
  }
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (!config || phases.length === 0) return null;
  const selected = phases.find((phase) => phase.name === selectedName) ?? phases[0];
  const prefix = id ?? "subjects";
  const tabId = (phase: Phase) => `${prefix}-tab-${slugOf(phase.name)}`;
  const panelId = (phase: Phase) => `${prefix}-panel-${slugOf(phase.name)}`;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextTabIndex(event.key, index, phases.length);
    if (next === index) return;
    event.preventDefault();
    setSelectedName(phases[next].name);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div
        role="tablist"
        aria-label={config.heading}
        className="flex flex-wrap items-center justify-center gap-2 text-sm"
      >
        {phases.map((phase, index) => {
          const isSelected = phase.name === selected.name;
          return (
            <button
              key={phase.name}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId(phase)}
              aria-selected={isSelected}
              aria-controls={panelId(phase)}
              tabIndex={isSelected ? 0 : -1}
              className="sc-phase-tab"
              onClick={() => setSelectedName(phase.name)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <LmsPhaseGrades phase={phase} outlined />
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId(selected)}
        aria-labelledby={tabId(selected)}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <h3 className="text-2xl font-black tracking-tight text-[var(--sc-ink)]">
            {selected.name}
          </h3>
          <p className="text-sm md:text-base text-[var(--sc-ink-2)] leading-relaxed max-w-2xl">
            {selected.text}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sc-row">
          {selected.subjects.map((subject) => (
            <SubjectCard
              key={subject.grades ? `${subject.name} ${subject.grades}` : subject.name}
              subject={subject}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default LmsSubjectsPhases;
