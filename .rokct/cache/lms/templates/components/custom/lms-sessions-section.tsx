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

// The landing page's "how a session works" section: the two-part lesson
// and the rules a session keeps. Copy: LMS_LANDING_CONFIG.sessions.
//
// The three lesson steps are one swipeable row below 640px (`sc-row`,
// landing/lms-theme.css) - a swipe through the lesson reads the way the
// lesson runs. The facts block underneath keeps stacking: those are three
// bare paragraphs, not cards, and prose in a snap row reads as broken.

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. Nothing in
// this module needs the client - no state, no effect, no browser API - so
// it is a server module and its meta a plain object.

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  LMS_LANDING_CONFIG,
  LMS_SIGNUP_LABEL,
} from "@/components/custom/landing/lms-landing-config";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export function LmsSessionsSection({
  id,
  signupUrl,
}: {
  id?: string;
  signupUrl: string;
}) {
  const config = LMS_LANDING_CONFIG.sessions;
  if (!config) return null;

  return (
    <section
      id={id}
      className="w-full bg-[var(--sc-surface)] text-[var(--sc-ink)] py-16 md:py-24 overflow-hidden"
    >
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-5">
          <p className="sc-eyebrow">
            {config.eyebrow}
          </p>
          <h2 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-balance">
            {config.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
            {config.blurb}
          </p>
        </div>

        {/* The lesson, as a timeline: expert, break, simplifier. */}
        <ol className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 sc-row">
          {config.steps.map((step, index) => (
            <li
              key={step.who}
              className="relative flex flex-col gap-3 sc-card p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="sc-brand text-4xl text-[var(--sc-primary)] leading-none">
                  {index + 1}
                </span>
                <span className="sc-chip text-xs uppercase tracking-wider">
                  {step.length}
                </span>
              </div>
              <h3 className="text-xl font-bold">{step.who}</h3>
              <p className="text-[var(--sc-ink-2)] leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[var(--sc-stroke-subtle)] pt-10">
          {config.facts.map((fact) => (
            <div key={fact.title} className="flex flex-col gap-2">
              <h4 className="font-bold text-lg">{fact.title}</h4>
              <p className="text-[var(--sc-ink-2)] leading-relaxed text-[15px]">
                {fact.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href={signupUrl}
            className="group sc-btn sc-btn-primary"
          >
            {LMS_SIGNUP_LABEL}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * (first after the hero) and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 10,
  nav: [{ id: "sessions", label: "Sessions" }],
};

export default function LmsSessionsPageSection({
  id,
  signupUrl,
}: PageSectionProps) {
  return <LmsSessionsSection id={id} signupUrl={signupUrl} />;
}
