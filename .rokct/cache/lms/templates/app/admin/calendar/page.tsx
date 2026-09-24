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

// /admin/calendar - the living marketing calendar (lms_sdk 1.28.0) and,
// since 1.32.0, the ad-performance report below it: which TikTok ads bought
// against these windows are decaying, and what a manager might do about
// each flag. A server page: the data is loaded here, in the render, never
// in an effect, so the first HTML already carries today's countdowns. The
// shell's theme provider is dark by default and the page paints only
// theme tokens, so it is dark unless the viewer has chosen light.
//
// The two payloads are fetched concurrently and read independently: the ad
// report answers null when it is refused and `connected: false` when no ad
// account is configured, and neither can take the calendar down.

import {
  fetchAdPerformance,
  fetchMarketingCalendar,
} from "@/app/actions/handson/all/lms/calendar/actions";
import {
  LmsAdPerformance,
  LmsAdPerformanceNotConnected,
} from "@/components/custom/lms-ad-performance";
import {
  LmsMarketingCalendar,
  LmsMarketingCalendarDenied,
} from "@/components/custom/lms-marketing-calendar";

// The countdowns are a function of today: never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminMarketingCalendarPage() {
  const [calendar, adPerformance] = await Promise.all([
    fetchMarketingCalendar(),
    fetchAdPerformance(),
  ]);
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {calendar ? (
        <LmsMarketingCalendar calendar={calendar} />
      ) : (
        <LmsMarketingCalendarDenied />
      )}
      {adPerformance ? (
        adPerformance.connected ? (
          <LmsAdPerformance report={adPerformance} />
        ) : (
          <LmsAdPerformanceNotConnected />
        )
      ) : null}
    </div>
  );
}
