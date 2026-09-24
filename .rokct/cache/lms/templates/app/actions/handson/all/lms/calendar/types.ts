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

// The marketing calendar's wire types live beside the rules that read them
// (components/custom/landing/lms-calendar-rules.ts, import-free so the
// tests can run it); re-exported here so the actions and services follow
// the actions/<feature>/types.ts layout the other lms features use.
//
// 1.32.0: the ad-performance report is read on the same page and follows
// the same arrangement - its wire types live beside ITS rules
// (lms-ad-performance-rules.ts, equally import-free) and are re-exported
// from here for the action and the service.
export type {
  CalendarEvent,
  CalendarHoliday,
  CalendarKind,
  CalendarNow,
  CalendarSource,
  CalendarStatus,
  CalendarTerm,
  MarketingCalendar,
} from "@/components/custom/landing/lms-calendar-rules";

export type {
  AdFlag,
  AdFlagAction,
  AdFlagCode,
  AdFlagSeverity,
  AdPerformanceReport,
  AdSignal,
  AdStatus,
} from "@/components/custom/landing/lms-ad-performance-rules";
