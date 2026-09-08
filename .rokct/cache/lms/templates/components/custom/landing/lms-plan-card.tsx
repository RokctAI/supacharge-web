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

// The plan card, ported from lms/dart's _PlanFamilyCard (pages/discovery/
// widgets/plans_sheet.dart) for the landing page - with the flip the
// tutor card has (Ray, 2026-09-08: "bring tutor and subscription cards to
// nextjs so can see their images and flip them"; the Flutter plan card does
// not flip today because it fits everything on one face, the web card has
// room to spare and puts the feature list on the back).
//
// FRONT: the "Most popular" badge on the plan most students land on, the
// plan name, the price with its period, the plan's own description when
// the row carries one, and "See what's included", which only flips.
// BACK: the price again (the reader never loses it), the feature list the
// platform's Subscription Plan row carries - never an invented one - and
// the commitment: "Choose <plan>" (or "Join for free" / "N days free"),
// which goes to sign-up for that plan. Prices show in the row's own
// currency, as lms-pricing.tsx formats them.

import React from "react";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

import type { LandingPlan } from "@/app/actions/base/landing";
import { LmsFlipCard, stopFlip } from "@/components/custom/landing/lms-flip-card";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";

export interface LmsPlanCardProps {
  plan: LandingPlan;
  /** The plan's family name, stripped of "(Legacy)" / "Monthly" / "Yearly". */
  baseName: string;
  /** "Free" or the formatted price. */
  price: string;
  /** "/month", "/student/year", ...; empty for a free plan. */
  period: string;
  /** The CTA text lms-pricing.tsx picks for the row (join free / days free / choose). */
  ctaLabel: string;
  /** Where the CTA goes. */
  href: string;
  /** The plan most students land on: the app's plan deck badges the middle family. */
  highlighted?: boolean;
  className?: string;
}

export function LmsPlanCard({
  plan,
  baseName,
  price,
  period,
  ctaLabel,
  href,
  highlighted = false,
  className = "",
}: LmsPlanCardProps) {
  const config = LMS_LANDING_CONFIG.pricing;
  if (!config) return null;
  const { labels } = config;
  const features = Array.isArray(plan.features) ? plan.features : [];
  // The row's own description, when the platform sends one (LandingPlan's
  // extra keys are `unknown`).
  const description = typeof plan.description === "string" ? plan.description : "";

  const ring = highlighted
    ? "border-[var(--sc-primary)] ring-1 ring-[var(--sc-primary)]"
    : "border-[var(--sc-stroke-subtle)]";

  const priceBlock = (
    <p className="text-4xl font-black tracking-tight text-[var(--sc-ink)]">
      {price}
      {period && <span className="ml-1 text-base font-normal text-[var(--sc-ink-2)]">{period}</span>}
    </p>
  );

  const front = (
    <div
      className={`flex size-full flex-col gap-5 overflow-hidden rounded-3xl border bg-[var(--sc-card-alt)] p-6 text-left md:p-8 ${ring}`}
    >
      {highlighted && (
        <span className="self-start rounded-md bg-[var(--sc-primary)] px-2.5 py-1 text-[11px] font-medium text-white">
          {labels.mostPopular}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--sc-ink-2)]">{baseName}</h3>
        {priceBlock}
      </div>
      {description && (
        <p className="line-clamp-5 text-sm leading-relaxed text-[var(--sc-ink-2)]">{description}</p>
      )}
      <span className="mt-auto block w-full rounded-full border border-[var(--sc-stroke)] px-4 py-3 text-center text-sm font-semibold text-[var(--sc-ink)]">
        {labels.seeIncluded}
      </span>
    </div>
  );

  const back = (
    <div
      className={`flex size-full flex-col gap-5 overflow-hidden rounded-3xl border bg-[var(--sc-card)] p-6 text-left md:p-8 ${ring}`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--sc-ink-2)]">{baseName}</h3>
          {priceBlock}
        </div>
        <span aria-hidden="true" className="p-1 text-[var(--sc-ink-3)]" title={labels.flipBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 3v6h6" />
          </svg>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--sc-ink-2)]">{labels.included}</p>
        {features.length > 0 ? (
          <ul className="flex flex-col gap-2 text-sm text-[var(--sc-ink-2)]">
            {features.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-yellow-500" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          description && (
            <p className="text-sm leading-relaxed text-[var(--sc-ink-2)]">{description}</p>
          )
        )}
      </div>
      <Link
        href={href}
        onClick={stopFlip}
        className="block w-full rounded-full bg-[var(--sc-primary)] px-4 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90"
      >
        {ctaLabel}
      </Link>
    </div>
  );

  return (
    <LmsFlipCard
      front={front}
      back={back}
      flipLabel={`${labels.flip}: ${baseName}`}
      flipBackLabel={`${labels.flipBack}: ${baseName}`}
      className={`min-h-[22rem] w-full rounded-3xl ${className}`}
      data-card={`plan:${plan.name ?? plan.plan_name}`}
    />
  );
}

export default LmsPlanCard;
