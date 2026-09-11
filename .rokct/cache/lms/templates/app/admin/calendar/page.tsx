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

// /admin/calendar - the living marketing calendar (lms_sdk 1.28.0). A
// server page: the data is loaded here, in the render, never in an
// effect, so the first HTML already carries today's countdowns. The
// shell's theme provider is dark by default and the page paints only
// theme tokens, so it is dark unless the viewer has chosen light.

import { fetchMarketingCalendar } from "@/app/actions/handson/all/lms/calendar/actions";
import {
  LmsMarketingCalendar,
  LmsMarketingCalendarDenied,
} from "@/components/custom/lms-marketing-calendar";

// The countdowns are a function of today: never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminMarketingCalendarPage() {
  const calendar = await fetchMarketingCalendar();
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {calendar ? (
        <LmsMarketingCalendar calendar={calendar} />
      ) : (
        <LmsMarketingCalendarDenied />
      )}
    </div>
  );
}
