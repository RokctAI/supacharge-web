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

import { EventService } from "@/app/services/all/lms/events";
import { verifyLmsRole } from "@/app/lib/roles";

export async function fetchMyLiveClasses() {
  if (!(await verifyLmsRole())) return [];
  return await EventService.getMyLiveClasses();
}

export async function fetchUpcomingEvaluations() {
  if (!(await verifyLmsRole())) return [];
  return await EventService.getUpcomingEvaluations();
}
