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

import { BaseService } from "@/app/services/common/base";
import type { MarketingCalendar } from "@/app/actions/handson/all/lms/calendar/types";

// The living marketing calendar (lms_sdk 1.28.0). One whitelisted alias,
// `api.lms.marketing_calendar` (lms/frappe/manifest.json), addressed the
// way the plans query and the Dart client address rlms aliases - the
// gateway resolves it under the tenant's own app name. System Manager
// only on the server; a refusal answers null here, never a thrown error,
// so the page can say "sign in as a manager" instead of failing.
export class MarketingCalendarService extends BaseService {
  /**
   * The calendar as of today in the school's timezone, or as of `today`
   * (ISO date) when an operator previews another day.
   */
  static async getCalendar(today?: string): Promise<MarketingCalendar | null> {
    try {
      const data = await this.call<MarketingCalendar>(
        "api.lms.marketing_calendar",
        today ? { today } : {},
      );
      return data && Array.isArray(data.events) ? data : null;
    } catch (error) {
      console.error("MarketingCalendarService.getCalendar error:", error);
      return null;
    }
  }
}
