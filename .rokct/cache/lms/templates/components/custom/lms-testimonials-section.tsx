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

// The landing page's testimonials. Quotes: LMS_LANDING_CONFIG.testimonials,
// whose three items are PLACEHOLDER stand-ins rather than real customers
// until genuine quotes exist (see LMS_LANDING_PLACEHOLDERS) - they render as
// ordinary testimonials, which is the point. The isPlaceholder branch below
// is for the `[[TOKEN]]` state this section used to be in, and still applies
// if an entry is ever emptied back to a token: a token is shown as such,
// never dressed up as somebody's words. A null config renders nothing.

import React from "react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

const isPlaceholder = (text: string) => /^\[\[.*\]\]$/.test(text.trim());

export function LmsTestimonialsSection({ id }: { id?: string }) {
  const config = LMS_LANDING_CONFIG.testimonials;
  if (!config || config.items.length === 0) return null;

  return (
    <section
      id={id}
      className="w-full bg-[var(--sc-card-alt)] py-16 md:py-24 border-y border-[var(--sc-stroke-subtle)]"
    >
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <h2 className="text-center text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
          {config.heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {config.items.map((item, index) => (
            <figure
              key={`${item.author}-${index}`}
              className="flex flex-col justify-between gap-6 sc-card p-6"
            >
              <blockquote
                className={`text-lg leading-relaxed ${
                  isPlaceholder(item.quote)
                    ? "font-mono text-sm text-[var(--sc-star)]"
                    : "text-[var(--sc-ink)]"
                }`}
              >
                {isPlaceholder(item.quote) ? item.quote : `“${item.quote}”`}
              </blockquote>
              <figcaption className="flex flex-col border-t border-[var(--sc-stroke-subtle)] pt-4">
                <span
                  className={`font-bold ${
                    isPlaceholder(item.author)
                      ? "font-mono text-xs text-[var(--sc-star)]"
                      : "text-[var(--sc-ink)]"
                  }`}
                >
                  {item.author}
                </span>
                <span
                  className={`text-sm ${
                    isPlaceholder(item.role)
                      ? "font-mono text-xs text-[var(--sc-star)]"
                      : "text-[var(--sc-ink-2)]"
                  }`}
                >
                  {item.role}
                </span>
              </figcaption>
            </figure>
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
  order: 90,
  nav: [{ id: "testimonials", label: "Testimonials" }],
};

export default LmsTestimonialsSection;
