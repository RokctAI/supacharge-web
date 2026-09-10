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

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. This
// entry module is the server-readable half: `meta` and the registered
// default export. The component - the half that needs the client - is
// ./lms-pricing.client.tsx, which the default export renders.

import React from "react";

import type { LandingPlan } from "@/app/actions/base/landing";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import { LmsPricing } from "@/components/custom/lms-pricing.client";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/**
 * Whether this section draws anything: its copy slot filled and at least one
 * plan row back from the platform. `meta.renders` at the foot of the file
 * asks exactly this, so the host adds the Pricing stop to the floating nav
 * on the same terms as it renders the section, and a tick is never left
 * pointing at a section that drew nothing.
 */
const showsPricing = (plans: LandingPlan[]) =>
  !!LMS_LANDING_CONFIG.pricing && plans.length > 0;

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
