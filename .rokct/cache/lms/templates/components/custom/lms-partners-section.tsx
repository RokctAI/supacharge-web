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

// The landing page's accountability-partner section: what a linked parent,
// guardian, sibling, teacher or mentor receives, and the boundary the
// platform keeps. Copy: LMS_LANDING_CONFIG.partners.

import React from "react";
import Link from "next/link";
import { BellRing, CalendarCheck2, ShieldCheck } from "lucide-react";

import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export function LmsPartnersSection({
  id,
  signupUrl,
}: {
  id?: string;
  signupUrl: string;
}) {
  const config = LMS_LANDING_CONFIG.partners;
  if (!config) return null;

  return (
    <section
      id={id}
      className="w-full bg-[var(--sc-card-alt)] py-16 md:py-24 border-y border-[var(--sc-stroke-subtle)]"
    >
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
          <ul className="flex flex-wrap justify-center gap-2">
            {config.who.map((who) => (
              <li
                key={who}
                className="sc-chip text-sm"
              >
                {who}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4 sc-card p-6 md:p-8">
            <CalendarCheck2 className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[var(--sc-ink)]">
              {config.weeklyHeading}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[var(--sc-ink-2)] leading-relaxed list-disc pl-4">
              {config.weekly.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 sc-card p-6 md:p-8">
            <BellRing className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[var(--sc-ink)]">
              {config.alertsHeading}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[var(--sc-ink-2)] leading-relaxed list-disc pl-4">
              {config.alerts.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 sc-card sc-card-primary p-6 md:p-8">
            <ShieldCheck className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
            <p className="text-lg leading-relaxed">{config.boundary}</p>
            <div className="mt-auto border-t border-[var(--sc-primary)] pt-4">
              <h4 className="font-bold">{config.sponsors.heading}</h4>
              <p className="text-sm text-[var(--sc-ink-2)] leading-relaxed">
                {config.sponsors.text}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href={signupUrl}
            className="sc-btn sc-btn-primary"
          >
            {config.cta.label}
          </Link>
          <p className="text-sm text-[var(--sc-ink-2)]">{config.cta.sub}</p>
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
  order: 50,
  nav: [{ id: "partners", label: "Partners" }],
};

export default function LmsPartnersPageSection({
  id,
  signupUrl,
}: PageSectionProps) {
  return <LmsPartnersSection id={id} signupUrl={signupUrl} />;
}
