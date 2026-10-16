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
import { platformCall } from "@/app/services/base/platform-gateway";

/**
 * Partner-first signup on the web (1.37.0): the landing's "Become a
 * partner" button opens /partner/signup, which lands here. One cmd through
 * the platform gateway, `api.lms.partner_signup` (lms/frappe/manifest.json
 * maps it to rlms.api.partner.signup, an allow_guest method), the same cmd
 * and payload the Flutter client sends. The visitor is not signed in yet,
 * so the call carries no session credentials (requireAuth: false), exactly
 * like the landing's public price list.
 *
 * Besides email, password, first_name and last_name, the web sends the
 * two optional fields rlms.api.partner.signup accepts: `organisation` and
 * `help_type` (fund_learner / sponsor_school / partner). The backend
 * validates help_type and stores both on the partner's LMS Partner
 * Profile; the app's signup sends neither and is unchanged.
 */
export interface PartnerSignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organisation: string;
  help_type: "fund_learner" | "sponsor_school" | "partner";
}

export class PartnerService {
  static async signup(
    payload: PartnerSignupPayload,
  ): Promise<{ email: string }> {
    const res = await platformCall<
      { message?: { email?: string } } | { email?: string }
    >(
      "api.lms.partner_signup",
      { ...payload },
      { requireAuth: false, throwOnError: true },
    );
    const body =
      (res as { message?: { email?: string } } | null)?.message ?? res;
    return {
      email: (body as { email?: string } | null)?.email ?? payload.email,
    };
  }
}
