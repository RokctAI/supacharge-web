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

export interface Batch {
  name: string;
  title: string;
  course: string;
  start_date: string;
  end_date: string;
  /** Upstream Frappe-LMS fields; rlms cohorts do not carry them. */
  students?: any[];
  instructors?: any[];
  /** rlms cohort fields (api.lms.my_batches / created_batches). */
  course_title?: string;
  subject?: string;
  grade?: string;
  status?: string;
  learners?: number;
  average_progress?: number;
  my_progress?: number;
  joined_on?: string;
}
