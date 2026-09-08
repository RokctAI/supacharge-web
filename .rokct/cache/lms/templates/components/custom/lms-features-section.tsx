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

// The landing page's feature grid: the app's screens in the order the
// guided tour walks them. Copy and icons: LMS_LANDING_CONFIG.features.

import React from "react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.items.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="group flex flex-col gap-4 sc-card p-6 transition-colors hover:border-[var(--sc-primary)]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--sc-primary)] text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[var(--sc-ink)]">
                  {feature.name}
                </h3>
                <p className="text-sm text-[var(--sc-ink-2)] leading-relaxed">
                  {feature.text}
                </p>
              </div>
            );
          })}
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
