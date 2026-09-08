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

// Which plans Supacharge's landing page prefetches, registered into
// base_sdk's plans-query seam (components/custom/landing/plans-query.ts,
// base_sdk 1.9.0) through this SDK's manifest integrations.
//
// The host's generic default is the platform's `Subscription Plan` list:
// the plans on which someone RUNS an LMS - USD 20 a month, USD 200 a year
// (lms/frappe/src/tenant/fixtures/Subscription_Plan/LMS-*.json). That is
// rokctai_frontend's price list, and it is the wrong one to show a learner.
// Supacharge's visitors buy lessons, and their catalog is this tenant's own
// LMS Plan records - R299 a month, R2,990 a year, R449 for the holiday
// programme (rlms.plan_rules.default_plans, the documented launch rates).
//
// So the query below names the tenant's public price list. It goes through
// the one platform gateway as a `cmd`, like every other call this SDK makes
// - never a dotted method URL - and the cmd is the rlms module's own
// whitelisted-method alias, `api.lms.public_plans` (lms/frappe/manifest.json
// maps it to rlms.api.billing.public_plans), the same alias shape the
// Flutter client calls `api.lms.plans` by.
//
// That endpoint is a read-only, `allow_guest` projection built for exactly
// this: the six fields a price card shows (key, title, description, amount,
// currency, period) for every ACTIVE, PRICED plan, and nothing else. The
// app's own catalog (`api.lms.plans`) stays signed-in-only: it carries the
// partner rate, the programme window and the entitlement flags, and it
// seeds records on the way through.
//
// Naming the cmd here is also what makes the pricing section SAFE against a
// misaimed base URL. `ROKCT_BASE_URL` (or a tenant-host mapping) decides
// which site answers; pointed at the CONTROL site it would previously have
// answered the generic query with the control plane's own tenant plans, and
// a learner would have been quoted USD 20 to "run an LMS". A control site
// accepts only `control:`-prefixed cmds (see the platform gateway's
// contract in app/services/base/platform-gateway.ts), so this cmd cannot be
// served there: the call fails, `getLandingPlans()` returns an empty list,
// and lms-pricing.tsx renders nothing at all. Wrong-site pricing is now
// unreachable by construction - the worst case is no prices, never someone
// else's.

import type { LandingPlansQuery } from "@/components/custom/landing/landing-config";

/**
 * The tenant's public learner price list. No payload: the endpoint takes no
 * arguments and answers the whole active catalog in the owner's own sort
 * order.
 */
const LMS_PLANS_QUERY: LandingPlansQuery = {
  cmd: "api.lms.public_plans",
  payload: {},
};

export default LMS_PLANS_QUERY;
