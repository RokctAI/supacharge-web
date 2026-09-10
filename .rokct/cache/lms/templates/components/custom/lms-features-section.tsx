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

// The landing page's feature cards: the app's screens in the order the
// guided tour walks them. Copy, icons and each card's treatment:
// LMS_LANDING_CONFIG.features.
//
// A bento, not a grid of eight identical tiles (the supacharge.app audit
// finding "eight identical icon-in-square feature cards", Ray, 2026-09-09:
// "the eight identical feature cards if its your day you need to fix").
// Two cards - the two the config flags `wide`, the screens the page is
// about - span two columns; the rest are single. Every card carries ONE of
// five treatments (`Feature.treatment`, drawn by landing/lms-features.css):
//
//   glow      the icon over a soft radial accent, no tile
//   numeral   a large figure taken from the card's own copy (`figure`)
//   list      the two-line mini list under the text (`curricula`, the
//             curriculum line with its pill, then `lines`)
//   gradient  a diagonal wash from the primary tint into the card
//   outlined  a transparent card with a primary-leaning stroke
//
// The config assigns them so no two neighbours - beside or above each
// other - share one, at every width; tests/test_landing_apps.py lays the
// cards out the way the browser will and checks that. The icons keep
// their meaning and lose the identical square tile: each treatment draws
// its own. Colour is the theme's tokens only (lms-theme.css), so the light
// set follows the toggle with nothing to keep in step. Nothing moves, so
// there is nothing for prefers-reduced-motion to stop, and nothing is
// hover-only: the hover is the border tint the rest of the page's cards
// already have.
//
// Columns: five from 1024px, where 2 + 1 + 2 and 1 + 1 + 1 + 1 + 1 fill
// two rows edge to edge in tour order; two from 640px, where the wide
// cards go first (`order-first`) so the column pairs stay whole - one
// wide, two, two, two - and nothing leaves a hole. A wide card with the
// width to use lays its icon or figure beside the words instead of above
// them (`sm:flex-row`), so the band reads as a band and not as a single
// card stretched. Below 640px the grid
// is the one swipeable row the page's other card sections are (`sc-row`,
// lms-theme.css - Ray, 2026-09-09: "actually most cards should be one row
// in mobile", because "im avoiding a long scroll"), with the wide cards
// first there too.

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. Nothing in
// this module needs the client - no state, no effect, no browser API - so
// it is a server module and its meta a plain object.

import React from "react";

import {
  LMS_LANDING_CONFIG,
  type Feature,
} from "@/components/custom/landing/lms-landing-config";
import { LmsCurricula } from "@/components/custom/landing/lms-curricula";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

import "@/components/custom/landing/lms-features.css";

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const { treatment } = feature;
  const inlineIcon = treatment === "numeral" || treatment === "list";

  return (
    <div
      className={[
        "sc-card sc-feature",
        `sc-feature-${treatment}`,
        "group flex flex-col gap-4 p-6 transition-colors hover:border-[var(--sc-primary)]",
        feature.wide
          ? "sm:col-span-2 order-first lg:order-none sm:flex-row sm:items-center sm:gap-6 sm:p-8"
          : "",
      ].join(" ")}
    >
      {treatment === "numeral" && feature.figure ? (
        <span className="sc-feature-figure" aria-hidden="true">
          {feature.figure}
        </span>
      ) : null}

      {!inlineIcon ? (
        <span
          className={`sc-feature-icon flex size-7 items-center justify-center ${feature.wide ? "sm:mx-3" : ""}`}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
      ) : null}

      <div className={`flex flex-col gap-2 ${treatment === "numeral" ? "mt-auto sm:mt-0" : ""}`}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--sc-ink)]">
          {inlineIcon ? (
            <span className="sc-feature-icon">
              <Icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          {feature.name}
        </h3>
        <p className="text-sm text-[var(--sc-ink-2)] leading-relaxed">
          {feature.text}
        </p>
      </div>

      {treatment === "list" && (feature.curricula || (feature.lines && feature.lines.length > 0)) ? (
        <ul className="sc-feature-lines mt-auto flex flex-col gap-1.5 text-sm font-medium text-[var(--sc-ink)]">
          {feature.curricula ? (
            <li className="sc-feature-line">
              <span>
                <LmsCurricula />
              </span>
            </li>
          ) : null}
          {(feature.lines ?? []).map((line) => (
            <li key={line} className="sc-feature-line">
              {line}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function LmsFeaturesSection({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.features;
  if (!config || config.items.length === 0) return null;

  return (
    <section id={id} className="w-full bg-[var(--sc-surface)] py-16 md:py-24">
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-5">
          <h2 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
            {config.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
            {config.blurb}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sc-row">
          {config.items.map((feature) => (
            <FeatureCard key={feature.name} feature={feature} />
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
  order: 40,
  nav: [{ id: "features", label: "Features" }],
};

export default LmsFeaturesSection;
