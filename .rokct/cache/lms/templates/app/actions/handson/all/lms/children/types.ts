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

/** One child profile (rlms api.children._serialize). */
export interface ChildProfile {
  id: string;
  display_name: string;
  /** 0 is Grade R. */
  grade: number;
  avatar_key: string;
  school: string;
  status: "Active" | "Claimed" | "Archived" | string;
  /** The learner account behind the profile (partner reports' student). */
  student: string | null;
  claim_code_expires_at: string | null;
}

export interface ChildInput {
  display_name: string;
  grade: string;
  avatar_key?: string;
  school?: string;
}

export interface ClaimCode {
  child: string;
  code: string;
  expires_at: string;
}

/** The parts of partner_weekly_report the parent screens show. */
export interface ChildWeek {
  week_start: string;
  sessions_scheduled: number;
  sessions_attended: number;
  engagement_rate_percent: number;
  current_streak: number;
  avg_minutes_watched: number;
  live_sessions?: { title?: string; status?: string; minutes?: number }[];
}

export type ActionResult<T = unknown> =
  { success: true; data: T } | { success: false; error: string };
