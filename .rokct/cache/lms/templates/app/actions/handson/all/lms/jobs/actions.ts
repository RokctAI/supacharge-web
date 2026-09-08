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

import { JobService } from "@/app/services/all/lms/jobs";
import { verifyLmsRole } from "@/app/lib/roles";

export async function fetchJobs() {
  if (!(await verifyLmsRole())) return [];
  return await JobService.getJobs();
}

export async function fetchJob(jobName: string) {
  if (!(await verifyLmsRole())) return null;
  return await JobService.getJob(jobName);
}
