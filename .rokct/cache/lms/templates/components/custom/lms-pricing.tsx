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
// with the query this SDK registers in the host's plans-query seam -
// landing/lms-plans-query.ts, the tenant's own LMS Plan catalog read as a
// guest through the single platform gateway); with none the section renders
// nothing and gives up its floating-nav stop with it (see `meta` below), so
// no price is ever hard-coded here. Labels and the partner note come from
// LMS_LANDING_CONFIG.pricing. Prices show in the row's own currency (the
// learner catalog is priced in ZAR). Each plan is the app's
// plan card as a flip card (landing/lms-plan-card.tsx): price front, the
// row's feature list and the Choose action on the back; the middle plan
// carries the "Most popular" badge, as the app's plan deck does.
//
// Below 640px the plan cards are one swipeable row (`sc-row`,
// landing/lms-theme.css). Stacked, they are the tallest thing on the
// page - a plan card is a price, a feature list and an action - and a row
// of plan cards on a phone is how the app's own plan deck reads. Side by
// side comparison is what the grid is for from 640px up, which is where
// there is width to compare in. The flip survives the row because nothing
// here drags: the scroll is the browser's own, so a tap is still a tap
// (the deck in lms-tutors-section.tsx has to suppress its cards mid-drag
// precisely because its JS owns the gesture).
//
// Three periods, exactly as the Flutter plan sheet reads them
// (plans_sheet.dart / lesson_plans.dart): monthly, yearly, and a ONE-OFF
// that is neither. The monthly/yearly switch only ever moves between the
// two recurring terms; a one-off plan (the R449 Holiday Programme) is not a
// term of anything, so it stands in both positions and is quoted "once off"
// rather than being mislabelled "/month" by the term it happens to sit next
// to.

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

const isMonthly = (interval?: string) =>
  ["month", "monthly"].includes((interval ?? "").toLowerCase());

/** Neither a monthly nor a yearly term: a once-off purchase, priced whole. */
const isOneOff = (interval?: string) =>
  !isYearly(interval) && !isMonthly(interval);

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

/**
 * Whether this section draws anything: its copy slot filled and at least one
 * plan row back from the platform. `meta.renders` at the foot of the file
 * asks exactly this, so the host adds the Pricing stop to the floating nav
 * on the same terms as it renders the section, and a tick is never left
 * pointing at a section that drew nothing.
 */
const showsPricing = (plans: LandingPlan[]) =>
  !!LMS_LANDING_CONFIG.pricing && plans.length > 0;

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
          // A one-off is not a term, so the switch never hides it; only the
          // recurring rows answer to it.
          !hasYearly ||
          isOneOff(plan.billing_interval) ||
          isYearly(plan.billing_interval) === isAnnual,
        )
        .sort((a, b) => (a.cost || 0) - (b.cost || 0)),
    [plans, hasYearly, isAnnual],
  );

  // `!config` repeats what showsPricing() already asked: the compiler
  // narrows `config` on this test, but not through a call.
  if (!config || !showsPricing(plans)) return null;
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

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch sc-row">
          {displayedPlans.map((plan, index) => {
            const baseName = cleanPlanName(plan.plan_name);
            const isFree = !!plan.is_free_plan || plan.cost === 0;
            const perSeat = !!plan.is_per_seat_plan;
            const yearly = isYearly(plan.billing_interval);
            const period = isOneOff(plan.billing_interval)
              ? labels.onceOff
              : yearly
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
 * components/custom/landing/page-sections.ts: its place in the page order,
 * its DOM id, and a Pricing stop on the floating nav. The stop is
 * conditional because the section is - with no plan rows from the platform
 * it draws nothing - so it is declared through `renders` (base_sdk >=
 * 1.11.0), which the host asks once and then drops the section and its nav
 * entry together. A nav tick must always have somewhere to go, and this is
 * what makes that true without giving up the stop entirely. `anchor` still
 * names the DOM id so it survives the entry ever being taken away again.
 */
export const meta: PageSectionMeta = {
  order: 60,
  nav: [{ id: "pricing", label: "Pricing" }],
  anchor: "pricing",
  renders: ({ plans }) => showsPricing(plans),
};

/** The registered form: the plans the page prefetched. */
export default function LmsPricingSection({ id, plans }: PageSectionProps) {
  return <LmsPricing id={id} plans={plans} />;
}
