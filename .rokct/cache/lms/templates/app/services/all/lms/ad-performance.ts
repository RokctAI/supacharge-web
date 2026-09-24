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
import type { AdPerformanceReport } from "@/app/actions/handson/all/lms/calendar/types";

// The ad-performance report (lms_sdk 1.32.0). One whitelisted alias,
// `api.lms.ad_performance` (lms/frappe/manifest.json), addressed the way
// the marketing calendar addresses its own - the gateway resolves it under
// the tenant's own app name. System Manager only on the server; a refusal
// answers null here, never a thrown error, so the calendar page keeps
// rendering its windows whatever the ad account does. An unconfigured ad
// account is NOT a refusal: the backend answers a report with
// `connected: false`, which the page draws as "not connected".
export class AdPerformanceService extends BaseService {
  /**
   * The report as of today in the school's timezone, or as of `today` (ISO
   * date) when an operator reads it as of another day.
   */
  static async getReport(today?: string): Promise<AdPerformanceReport | null> {
    try {
      const data = await this.call<AdPerformanceReport>(
        "api.lms.ad_performance",
        today ? { today } : {},
      );
      return data && Array.isArray(data.ads) && Array.isArray(data.flags)
        ? data
        : null;
    } catch (error) {
      console.error("AdPerformanceService.getReport error:", error);
      return null;
    }
  }
}
