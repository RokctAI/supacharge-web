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

// 1.37.7 (Ray, 2026-10-16: "on those tabs its possible to have a bird or a
// butterfly to come and rest on it then fly away?"): a small butterfly
// that flies in, rests on the top edge of the kids mode rectangle for
// about five seconds, flies off, and comes back every 14 seconds. Inline
// SVG and CSS only (`.sc-kids-butterfly`, landing/lms-theme.css), no
// image.
//
// Drawn from the side, like a cartoon bird (Ray, 2026-10-17: "i should
// be seeing it from the sides like a twitter bird"), facing left, the way
// it flies: a slim segmented body with legs on the edge, clubbed antennae,
// and wings about twice the body's length ("dont butterfly have giant
// wings compared to body?"), coloured like a monarch - an orange forewing
// and yellow hindwing with scalloped ink edges, veins and white spots.
// Two wing pairs share the body: the `fly` pair beats while it travels,
// the `rest` pair stands closed upright and slowly opens now and then;
// the CSS shows one or the other. It is an `<i>`, not a `<span>`, so the kids rectangle rules
// (`.sc-phase-tab-kids > span`, `.sc-feature-phase-kids > span`) never
// style it. Decorative: aria-hidden, no pointer events, and hidden under
// prefers-reduced-motion. `later` starts it half a cycle on, so the tab
// and the "Your day, sorted." rectangle take turns.

import React from "react";

export function LmsKidsButterfly({ later }: { later?: boolean }) {
  return (
    <i
      className={later ? "sc-kids-butterfly sc-kids-butterfly-later" : "sc-kids-butterfly"}
      aria-hidden="true"
      data-kids-butterfly
    >
      <svg viewBox="0 -4 60 56" focusable="false">
        <g className="sc-kids-butterfly-bodyset">
          <g className="sc-kids-butterfly-fly">
            <g className="sc-kids-butterfly-far" transform="translate(3 -3)">
              <path d="M30.0 40.0 Q30.2 34.0 29.5 28.0 Q30.7 22.6 31.0 17.0 Q33.9 12.7 36.0 8.0 Q40.3 5.7 44.0 2.5 Q48.1 2.2 52.0 1.0 Q54.8 2.9 58.0 4.0 Q57.5 7.5 58.0 11.0 Q56.5 14.4 56.0 18.0 Q53.6 21.3 52.0 25.0 Q48.6 27.6 46.0 31.0 Q41.7 33.6 38.0 37.0 Q33.8 38.0 30.0 40.0Z" fill="var(--sc-kids-ink)" />
              <path d="M30.0 40.0 Q30.1 34.0 29.5 28.0 Q30.6 22.5 31.0 17.0 Q33.8 12.7 36.0 8.0 Q40.2 5.5 44.0 2.5 Q48.1 2.1 52.0 1.0 Q54.8 2.8 58.0 4.0 Q57.6 7.5 58.0 11.0 Q56.7 14.4 56.0 18.0 Q53.7 21.3 52.0 25.0 Q48.8 27.8 46.0 31.0 Q41.8 33.7 38.0 37.0 Q33.9 38.2 30.0 40.0Z" fill="var(--sc-kids-wing-far)" transform="scale(0.87)" />
              <path d="M30 40 L40 5 M30 40 L52 7 M30 40 L54 20" fill="none" stroke="var(--sc-kids-ink)" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="52.5" cy="3.5" r="1.2" fill="#ffffff" />
              <circle cx="56.5" cy="8" r="1" fill="#ffffff" />
              <circle cx="55" cy="14.5" r="0.9" fill="#ffffff" />
              <circle cx="52.5" cy="21" r="0.85" fill="#ffffff" />
            </g>
            <g className="sc-kids-butterfly-near">
              <path d="M30.0 40.0 Q30.2 34.0 29.5 28.0 Q30.7 22.6 31.0 17.0 Q33.9 12.7 36.0 8.0 Q40.3 5.7 44.0 2.5 Q48.1 2.2 52.0 1.0 Q54.8 2.9 58.0 4.0 Q57.5 7.5 58.0 11.0 Q56.5 14.4 56.0 18.0 Q53.6 21.3 52.0 25.0 Q48.6 27.6 46.0 31.0 Q41.7 33.6 38.0 37.0 Q33.8 38.0 30.0 40.0Z" fill="var(--sc-kids-ink)" />
              <path d="M30.0 40.0 Q30.1 34.0 29.5 28.0 Q30.6 22.5 31.0 17.0 Q33.8 12.7 36.0 8.0 Q40.2 5.5 44.0 2.5 Q48.1 2.1 52.0 1.0 Q54.8 2.8 58.0 4.0 Q57.6 7.5 58.0 11.0 Q56.7 14.4 56.0 18.0 Q53.7 21.3 52.0 25.0 Q48.8 27.8 46.0 31.0 Q41.8 33.7 38.0 37.0 Q33.9 38.2 30.0 40.0Z" fill="var(--sc-kids-wing-1)" transform="scale(0.87)" />
              <path d="M30 40 L40 5 M30 40 L52 7 M30 40 L54 20 M30 40 L47 30 M34 22 L44 14 M38 30 L50 25" fill="none" stroke="var(--sc-kids-ink)" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="52.5" cy="3.5" r="1.3" fill="#ffffff" />
              <circle cx="56.5" cy="8" r="1.1" fill="#ffffff" />
              <circle cx="55" cy="14.5" r="1" fill="#ffffff" />
              <circle cx="52.5" cy="21" r="0.95" fill="#ffffff" />
              <circle cx="48" cy="27.5" r="0.85" fill="#ffffff" />
              <circle cx="42" cy="33.5" r="0.75" fill="#ffffff" />
              <path d="M30.0 40.0 Q33.3 38.1 36.0 35.5 Q40.1 35.0 44.0 33.5 Q47.9 34.7 52.0 35.0 Q54.1 37.9 57.0 40.0 Q56.0 43.2 56.0 46.5 Q52.7 48.4 50.0 51.0 Q46.0 50.8 42.0 51.5 Q38.7 49.5 35.0 48.5 Q33.4 46.1 31.0 44.5 Q31.0 42.1 30.0 40.0Z" fill="var(--sc-kids-ink)" />
              <path d="M30.0 40.0 Q33.2 38.0 36.0 35.5 Q40.1 34.8 44.0 33.5 Q47.9 34.6 52.0 35.0 Q54.3 37.7 57.0 40.0 Q56.2 43.2 56.0 46.5 Q52.8 48.5 50.0 51.0 Q46.0 50.9 42.0 51.5 Q38.6 49.7 35.0 48.5 Q33.2 46.3 31.0 44.5 Q30.8 42.2 30.0 40.0Z" fill="var(--sc-kids-wing-2)" transform="scale(0.87)" />
              <path d="M30 40 L50 35.5 M30 40 L55 42 M30 40 L50 49 M30 40 L40 50.5 M40 37 L47 45" fill="none" stroke="var(--sc-kids-ink)" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="55" cy="38.5" r="1.05" fill="#ffffff" />
              <circle cx="55" cy="45.5" r="1" fill="#ffffff" />
              <circle cx="50" cy="50" r="0.9" fill="#ffffff" />
              <circle cx="42" cy="51" r="0.8" fill="#ffffff" />
              <circle cx="35" cy="48" r="0.7" fill="#ffffff" />
            </g>
          </g>
          <g className="sc-kids-butterfly-rest">
            <g className="sc-kids-butterfly-far" transform="translate(3 -3)">
              <path d="M30.0 40.0 Q30.2 34.0 29.5 28.0 Q30.7 22.6 31.0 17.0 Q33.9 12.7 36.0 8.0 Q40.3 5.7 44.0 2.5 Q48.1 2.2 52.0 1.0 Q54.8 2.9 58.0 4.0 Q57.5 7.5 58.0 11.0 Q56.5 14.4 56.0 18.0 Q53.6 21.3 52.0 25.0 Q48.6 27.6 46.0 31.0 Q41.7 33.6 38.0 37.0 Q33.8 38.0 30.0 40.0Z" fill="var(--sc-kids-ink)" />
              <path d="M30.0 40.0 Q30.1 34.0 29.5 28.0 Q30.6 22.5 31.0 17.0 Q33.8 12.7 36.0 8.0 Q40.2 5.5 44.0 2.5 Q48.1 2.1 52.0 1.0 Q54.8 2.8 58.0 4.0 Q57.6 7.5 58.0 11.0 Q56.7 14.4 56.0 18.0 Q53.7 21.3 52.0 25.0 Q48.8 27.8 46.0 31.0 Q41.8 33.7 38.0 37.0 Q33.9 38.2 30.0 40.0Z" fill="var(--sc-kids-wing-far)" transform="scale(0.87)" />
              <path d="M30 40 L40 5 M30 40 L52 7 M30 40 L54 20" fill="none" stroke="var(--sc-kids-ink)" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="52.5" cy="3.5" r="1.2" fill="#ffffff" />
              <circle cx="56.5" cy="8" r="1" fill="#ffffff" />
              <circle cx="55" cy="14.5" r="0.9" fill="#ffffff" />
              <circle cx="52.5" cy="21" r="0.85" fill="#ffffff" />
            </g>
            <g className="sc-kids-butterfly-near">
              <path d="M30.0 40.0 Q30.2 34.0 29.5 28.0 Q30.7 22.6 31.0 17.0 Q33.9 12.7 36.0 8.0 Q40.3 5.7 44.0 2.5 Q48.1 2.2 52.0 1.0 Q54.8 2.9 58.0 4.0 Q57.5 7.5 58.0 11.0 Q56.5 14.4 56.0 18.0 Q53.6 21.3 52.0 25.0 Q48.6 27.6 46.0 31.0 Q41.7 33.6 38.0 37.0 Q33.8 38.0 30.0 40.0Z" fill="var(--sc-kids-ink)" />
              <path d="M30.0 40.0 Q30.1 34.0 29.5 28.0 Q30.6 22.5 31.0 17.0 Q33.8 12.7 36.0 8.0 Q40.2 5.5 44.0 2.5 Q48.1 2.1 52.0 1.0 Q54.8 2.8 58.0 4.0 Q57.6 7.5 58.0 11.0 Q56.7 14.4 56.0 18.0 Q53.7 21.3 52.0 25.0 Q48.8 27.8 46.0 31.0 Q41.8 33.7 38.0 37.0 Q33.9 38.2 30.0 40.0Z" fill="var(--sc-kids-wing-1)" transform="scale(0.87)" />
              <path d="M30 40 L40 5 M30 40 L52 7 M30 40 L54 20 M30 40 L47 30 M34 22 L44 14 M38 30 L50 25" fill="none" stroke="var(--sc-kids-ink)" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="52.5" cy="3.5" r="1.3" fill="#ffffff" />
              <circle cx="56.5" cy="8" r="1.1" fill="#ffffff" />
              <circle cx="55" cy="14.5" r="1" fill="#ffffff" />
              <circle cx="52.5" cy="21" r="0.95" fill="#ffffff" />
              <circle cx="48" cy="27.5" r="0.85" fill="#ffffff" />
              <circle cx="42" cy="33.5" r="0.75" fill="#ffffff" />
              <path d="M30.0 40.0 Q33.3 38.1 36.0 35.5 Q40.1 35.0 44.0 33.5 Q47.9 34.7 52.0 35.0 Q54.1 37.9 57.0 40.0 Q56.0 43.2 56.0 46.5 Q52.7 48.4 50.0 51.0 Q46.0 50.8 42.0 51.5 Q38.7 49.5 35.0 48.5 Q33.4 46.1 31.0 44.5 Q31.0 42.1 30.0 40.0Z" fill="var(--sc-kids-ink)" />
              <path d="M30.0 40.0 Q33.2 38.0 36.0 35.5 Q40.1 34.8 44.0 33.5 Q47.9 34.6 52.0 35.0 Q54.3 37.7 57.0 40.0 Q56.2 43.2 56.0 46.5 Q52.8 48.5 50.0 51.0 Q46.0 50.9 42.0 51.5 Q38.6 49.7 35.0 48.5 Q33.2 46.3 31.0 44.5 Q30.8 42.2 30.0 40.0Z" fill="var(--sc-kids-wing-2)" transform="scale(0.87)" />
              <path d="M30 40 L50 35.5 M30 40 L55 42 M30 40 L50 49 M30 40 L40 50.5 M40 37 L47 45" fill="none" stroke="var(--sc-kids-ink)" strokeWidth="0.9" strokeLinecap="round" />
              <circle cx="55" cy="38.5" r="1.05" fill="#ffffff" />
              <circle cx="55" cy="45.5" r="1" fill="#ffffff" />
              <circle cx="50" cy="50" r="0.9" fill="#ffffff" />
              <circle cx="42" cy="51" r="0.8" fill="#ffffff" />
              <circle cx="35" cy="48" r="0.7" fill="#ffffff" />
            </g>
          </g>
          <g className="sc-kids-butterfly-legs" stroke="var(--sc-kids-ink)" strokeWidth="0.8" strokeLinecap="round" fill="none">
            <path d="M26 42.5 L23.5 49.5 M28.5 43 L28 49.8 M31 43 L33 49.6" />
          </g>
          <ellipse cx="35" cy="41.5" rx="8" ry="1.9" fill="var(--sc-kids-ink)" />
          <ellipse cx="27" cy="40.8" rx="3.6" ry="2.5" fill="var(--sc-kids-ink)" />
          <circle cx="23" cy="39.8" r="2" fill="var(--sc-kids-ink)" />
          <circle cx="22.3" cy="39.3" r="0.55" fill="#ffffff" />
          <path d="M22.5 38 Q18 31 13 28" stroke="var(--sc-kids-ink)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <ellipse cx="12.6" cy="27.8" rx="1.3" ry="0.8" transform="rotate(30 12.6 27.8)" fill="var(--sc-kids-ink)" />
          <path d="M23.3 37.8 Q20.5 32 17 30.5" stroke="var(--sc-kids-ink)" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.8" />
          <ellipse cx="16.7" cy="30.3" rx="1" ry="0.65" transform="rotate(30 16.7 30.3)" fill="var(--sc-kids-ink)" opacity="0.8" />
        </g>
      </svg>
    </i>
  );
}

export default LmsKidsButterfly;
