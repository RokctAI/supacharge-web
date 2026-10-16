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

/** The ways a sponsor or partner can help, as the signup page offers them. */
export const PARTNER_INTERESTS = [
  { value: "fund_learner", label: "Fund a learner" },
  { value: "sponsor_school", label: "Sponsor a school programme" },
  { value: "partner", label: "Partner with us" },
] as const;

export type PartnerInterest = (typeof PARTNER_INTERESTS)[number]["value"];

export interface PartnerSignupInput {
  name: string;
  organisation: string;
  email: string;
  password: string;
  interest: PartnerInterest;
}

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };
