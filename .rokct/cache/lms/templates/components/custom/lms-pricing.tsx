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

// The landing page's plan cards. The plans come from the page
// (app/landing/page.tsx prefetches them through app/actions/base/landing.ts
// with LANDING_CONFIG.plansQuery - the platform's Subscription Plan rows,
// read as a guest through the single platform gateway); with none the
// section renders nothing, so no price is ever hard-coded here. Labels and
// the partner note come from LMS_LANDING_CONFIG.pricing. Prices show in the
// row's own currency (the platform prices Supacharge in ZAR). Each plan is
// the app's plan card as a flip card (landing/lms-plan-card.tsx): price
// front, the row's feature list and the Choose action on the back; the
// middle plan carries the "Most popular" badge, as the app's plan deck
// does.

import React, { useMemo, useState } from "react";

import type { LandingPlan } from "@/app/actions/base/landing";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import { LmsPlanCard } from "@/components/custom/landing/lms-plan-card";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

const isYearly = (interval?: string) =>
  ["year", "yearly"].includes((interval ?? "").toLowerCase());

/** "Standard (Legacy) Monthly" -> "Standard": the name shared by a plan's monthly and yearly rows. */
function cleanPlanName(name: unknown): string {
  if (typeof name !== "string" || !name) return "Plan";
  return (
    name
      .replace(/\s*\(.*\)\s*/, "")
      .replace(/[._\-\s]+/g, " ")
      .replace(/\s*(Monthly|Yearly)\s*/i, "")
      .trim() || "Plan"
  );
}

function formatPrice(cost: number, currency?: string): string {
  const code = (currency || "ZAR").toUpperCase();
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: code,
      maximumFractionDigits: Number.isInteger(cost) ? 0 : 2,
    }).format(cost);
  } catch {
    return `${code} ${cost}`;
  }
}

export function LmsPricing({
  id,
  plans,
}: {
  id?: string;
  plans: LandingPlan[];
}) {
  const config = LMS_LANDING_CONFIG.pricing;
  const [isAnnual, setIsAnnual] = useState(false);

  const hasYearly = useMemo(
    () => plans.some((plan) => isYearly(plan.billing_interval)),
    [plans],
  );

  const displayedPlans = useMemo(
    () =>
      plans
        .filter((plan) =>
          hasYearly ? isYearly(plan.billing_interval) === isAnnual : true,
        )
        .sort((a, b) => (a.cost || 0) - (b.cost || 0)),
    [plans, hasYearly, isAnnual],
  );

  if (!config || plans.length === 0) return null;
  const { labels } = config;

  const buttonLabel = (plan: LandingPlan, baseName: string) =>
    plan.is_free_plan || plan.cost === 0
      ? labels.joinFree
      : plan.trial_period_days && plan.trial_period_days > 0
        ? labels.daysFree(plan.trial_period_days)
        : labels.select(baseName);

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
          {hasYearly && (
            <label className="inline-flex items-center gap-3 text-sm font-medium text-[var(--sc-ink-2)] cursor-pointer">
              <span>Monthly</span>
              <input
                type="checkbox"
                checked={isAnnual}
                onChange={() => setIsAnnual((v) => !v)}
                className="sr-only peer"
              />
              <span className="relative w-10 h-5 rounded-full bg-[var(--sc-stroke)] peer-checked:bg-[var(--sc-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:size-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
              <span>Yearly</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {displayedPlans.map((plan, index) => {
            const baseName = cleanPlanName(plan.plan_name);
            const isFree = !!plan.is_free_plan || plan.cost === 0;
            const perSeat = !!plan.is_per_seat_plan;
            const yearly = isYearly(plan.billing_interval);
            const period = yearly
              ? perSeat
                ? labels.perUserYear
                : labels.perYear
              : perSeat
                ? labels.perUserMonth
                : labels.perMonth;
            // The app badges the middle family (the second of two); never a lone plan.
            const highlighted =
              displayedPlans.length > 1 && index === Math.floor(displayedPlans.length / 2);

            return (
              <LmsPlanCard
                key={plan.name ?? plan.plan_name}
                plan={plan}
                baseName={baseName}
                price={isFree ? "Free" : formatPrice(plan.cost, plan.currency)}
                period={isFree ? "" : period}
                ctaLabel={buttonLabel(plan, baseName)}
                href={LANDING_CONFIG.planSignupUrl(plan.plan_name)}
                highlighted={highlighted}
              />
            );
          })}
        </div>

        <p className="text-center text-sm text-[var(--sc-ink-2)]">{config.partnerNote}</p>
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * and its DOM id. Not a floating-nav stop, because it hides itself when the
 * platform returns no plan rows and a nav tick must always have somewhere
 * to go.
 */
export const meta: PageSectionMeta = {
  order: 60,
  nav: [],
  anchor: "pricing",
};

/** The registered form: the plans the page prefetched. */
export default function LmsPricingSection({ id, plans }: PageSectionProps) {
  return <LmsPricing id={id} plans={plans} />;
}
