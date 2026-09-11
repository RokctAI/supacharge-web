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

"use server";

import { MarketingCalendarService } from "@/app/services/all/lms/marketing-calendar";
import { verifyLmsRole } from "@/app/lib/roles";
import type { MarketingCalendar } from "./types";

/**
 * The marketing calendar for the admin page, loaded in the page's server
 * render (never in an effect). The host's LMS role gate answers first, as
 * every lms server action does; the backend then enforces System Manager,
 * and either refusal reads as null.
 */
export async function fetchMarketingCalendar(
  today?: string,
): Promise<MarketingCalendar | null> {
  if (!(await verifyLmsRole())) return null;
  return await MarketingCalendarService.getCalendar(today);
}
