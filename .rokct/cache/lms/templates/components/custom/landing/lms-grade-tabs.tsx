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

// The landing's grade tabs (1.36.1): one row of clickable grade rectangles
// - each the outlined rectangle lms-curricula.tsx draws (LmsPhaseGrades,
// `outlined`), the pill after one on its way - that selects one entry.
// 1.36.0 drew them inline in the subjects section's client half; since
// 1.36.1 (Ray, 2026-10-02, approving the tutor and host grade filters) the
// tutors section's two rows wear the same tabs as filters, so the row is
// this one component and the three tab lists cannot drift apart.
//
// The tabs follow the WAI-ARIA tabs pattern: a `tablist` of real <button
// role="tab"> elements, `aria-selected` on the chosen one, each tab naming
// its panel (`aria-controls`) - the caller's panel names its tab back
// (`aria-labelledby`, gradeTabIds) - the roving tabindex so Tab lands on
// the selected tab once and the arrow keys (Left/Right, Home/End) move the
// selection along the list. A click or a key selects; nothing depends on
// hover. The selection itself is the caller's React state: this row holds
// none, so the caller's default is selected in the server's first HTML.
// The look is `.sc-phase-tab` (landing/lms-theme.css): the selected
// rectangle filled with the primary, a focus ring, no hover rule.

import React, { useRef, type KeyboardEvent } from "react";

import { LmsPhaseGrades } from "@/components/custom/landing/lms-curricula";
import type { GradeTab } from "@/components/custom/landing/lms-landing-config";

/** A DOM id from a tab name: "Senior Phase" -> "senior-phase". */
export function slugOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The tab and panel ids of the entry named `name` under `prefix` (the
 * section's DOM id and, where a section has more than one row, the row),
 * so two tab lists on one page never share an id.
 */
export function gradeTabIds(prefix: string, name: string): { tab: string; panel: string } {
  return { tab: `${prefix}-tab-${slugOf(name)}`, panel: `${prefix}-panel-${slugOf(name)}` };
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

/**
 * The row of tabs. `tabs` in order, `selected` the chosen one's `name`,
 * `onSelect` called with a name on a click or a key, `label` the
 * tablist's accessible name, `prefix` as gradeTabIds takes it.
 */
export function LmsGradeTabs({
  tabs,
  selected,
  onSelect,
  label,
  prefix,
}: {
  tabs: GradeTab[];
  selected: string;
  onSelect: (name: string) => void;
  label: string;
  prefix: string;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextTabIndex(event.key, index, tabs.length);
    if (next === index) return;
    event.preventDefault();
    onSelect(tabs[next].name);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex flex-wrap items-center justify-center gap-2 text-sm"
    >
      {tabs.map((tab, index) => {
        const isSelected = tab.name === selected;
        const ids = gradeTabIds(prefix, tab.name);
        return (
          <button
            key={tab.name}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={ids.tab}
            aria-selected={isSelected}
            aria-controls={ids.panel}
            tabIndex={isSelected ? 0 : -1}
            className="sc-phase-tab"
            onClick={() => onSelect(tab.name)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <LmsPhaseGrades phase={tab} outlined />
          </button>
        );
      })}
    </div>
  );
}

export default LmsGradeTabs;
