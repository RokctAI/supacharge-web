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

// The living marketing calendar's client-side rules (lms_sdk 1.28.0; Ray,
// 2026-09-11: "i want it alive like schedule move as time pass"). The
// backend (rlms.marketing_calendar, `api.lms.marketing_calendar`) computes
// the calendar on the day it is read - where the school year is, the next
// campaign window, every window's countdown - and this module only decides
// how the admin page READS that answer: which windows to list, how a
// countdown and a date range are worded, and which badge a status gets.
//
// Pure and import-free on purpose, so tests/test_marketing_calendar_page.py
// runs it under node with types stripped, the shape the download route's
// resolve.ts takes. Every visible word is an i18n key with its English
// beside it (`LabelSpec`); the component reads them through the shell's
// `t` and falls back to the English when the dictionary has no such key.

/** The backend's status vocabulary — the admin page's badge. */
export type CalendarStatus =
  | "gazetted"
  | "published"
  | "customary"
  | "school_set"
  | "approximate";

export type CalendarKind =
  | "term_open"
  | "term_close"
  | "holiday"
  | "exam_window"
  | "results"
  | "campaign";

export interface CalendarSource {
  title?: string;
  url?: string;
  retrieved?: string;
}

/** One event as `api.lms.marketing_calendar` answers it (ISO dates). */
export interface CalendarEvent {
  id: string;
  kind: CalendarKind;
  status: CalendarStatus;
  label: string;
  start: string;
  /** null for an open-ended window (a summer holiday into an unpackaged year). */
  end: string | null;
  theme: string | null;
  /** Days from today to the start; negative once the window has started. */
  days_until: number;
  /** Days from today to the end; negative once the window is over. */
  days_until_end: number | null;
  active: boolean;
  lead_days?: number;
  anchor?: string;
  note?: string | null;
  source?: CalendarSource | null;
}

export interface CalendarTerm {
  number: number;
  year: number;
  label: string;
  start: string;
  end: string;
}

export interface CalendarHoliday {
  after: CalendarTerm | null;
  start: string | null;
  end: string | null;
  next_opening: CalendarTerm | null;
  days_until_opening: number | null;
  open_ended: boolean;
}

export interface CalendarNow {
  today: string;
  in_term: boolean;
  term: CalendarTerm | null;
  status: CalendarStatus;
  week_of_term: number | null;
  days_left_in_term: number | null;
  holiday: CalendarHoliday | null;
}

export interface MarketingCalendar {
  today: string;
  timezone: string;
  years: number[];
  approximate_years: number[];
  now: CalendarNow;
  events: CalendarEvent[];
  active: CalendarEvent[];
  upcoming: CalendarEvent[];
  next_campaign: CalendarEvent | null;
  calendar_name: string;
  feed_url: string;
  feed_token_configured: boolean;
}

/** An i18n key with its English fallback and, where the copy counts, the parameters. */
export interface LabelSpec {
  key: string;
  fallback: string;
  params?: Record<string, string>;
}

/** The dictionary prefix every label on the page lives under. */
export const LABEL_PREFIX = "app.lms.calendar";

function spec(name: string, fallback: string, params?: Record<string, string>): LabelSpec {
  return params
    ? { key: `${LABEL_PREFIX}.${name}`, fallback, params }
    : { key: `${LABEL_PREFIX}.${name}`, fallback };
}

/** The badge word for each status. */
export const STATUS_LABELS: Record<CalendarStatus, LabelSpec> = {
  gazetted: spec("status_gazetted", "Gazetted"),
  published: spec("status_published", "Published"),
  customary: spec("status_customary", "Customary"),
  school_set: spec("status_school_set", "School-set"),
  approximate: spec("status_approximate", "Approximate"),
};

/** The badge variant per status: firm dates read as the default badge, the rest as outlines. */
export function statusVariant(
  status: CalendarStatus,
): "default" | "secondary" | "outline" {
  if (status === "gazetted" || status === "published") return "default";
  if (status === "approximate") return "outline";
  return "secondary";
}

/** How many windows the upcoming list shows. */
export const UPCOMING_LIMIT = 14;

/**
 * The windows the page lists: everything underway today first (oldest
 * start first), then what is still to come, in start order, capped at
 * UPCOMING_LIMIT. Past windows are never listed - that is what makes the
 * calendar move.
 */
export function upcomingWindows(
  calendar: Pick<MarketingCalendar, "events">,
  limit: number = UPCOMING_LIMIT,
): CalendarEvent[] {
  const live = calendar.events.filter(
    (event) => event.active || event.days_until > 0,
  );
  live.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    if (a.start !== b.start) return a.start < b.start ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return live.slice(0, Math.max(0, limit));
}

/** The countdown wording for one window, relative to today. */
export function countdown(event: Pick<CalendarEvent, "days_until" | "days_until_end" | "active">): LabelSpec {
  const until = event.days_until;
  const untilEnd = event.days_until_end;
  if (until > 1) return spec("in_days", "in {{days}} days", { days: String(until) });
  if (until === 1) return spec("tomorrow", "tomorrow");
  if (until === 0 && untilEnd !== null && untilEnd > 0) {
    return spec("starts_today_left", "starts today, {{days}} days left", { days: String(untilEnd) });
  }
  if (until === 0) return spec("today", "today");
  if (event.active) {
    if (untilEnd === null) return spec("underway", "underway");
    if (untilEnd === 0) return spec("last_day", "last day today");
    return spec("underway_left", "underway, {{days}} days left", { days: String(untilEnd) });
  }
  if (untilEnd !== null && untilEnd < 0) {
    const ago = -untilEnd;
    return ago === 1
      ? spec("ended_yesterday", "ended yesterday")
      : spec("ended_days_ago", "ended {{days}} days ago", { days: String(ago) });
  }
  const ago = -until;
  return ago === 1
    ? spec("started_yesterday", "started yesterday")
    : spec("started_days_ago", "started {{days}} days ago", { days: String(ago) });
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parts(iso: string): { day: number; month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** "13 Oct 2026" — day-first, the way the gazette and the DBE print dates. */
export function formatDate(iso: string): string {
  const p = parts(iso);
  if (!p || p.month < 1 || p.month > 12) return iso ?? "";
  return `${p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

/**
 * A window as one phrase: "6 Oct 2026" for a single day, "13 Oct – 26 Nov
 * 2026" inside one year, "10 Dec 2026 – 12 Jan 2027" across the turn of the
 * year, and "from 9 Dec 2027" when the end is not known yet.
 */
export function formatRange(start: string, end: string | null): string {
  if (!end) return `from ${formatDate(start)}`;
  if (end === start) return formatDate(start);
  const a = parts(start);
  const b = parts(end);
  if (!a || !b) return `${formatDate(start)} – ${formatDate(end)}`;
  if (a.year === b.year) {
    if (a.month === b.month) return `${a.day} – ${b.day} ${MONTHS[a.month - 1]} ${a.year}`;
    return `${a.day} ${MONTHS[a.month - 1]} – ${b.day} ${MONTHS[b.month - 1]} ${a.year}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

/** Wraps a raw range for the page: the range text as the calendar prints it. */
export function rangeLabel(event: Pick<CalendarEvent, "start" | "end">): LabelSpec {
  const range = formatRange(event.start, event.end);
  return event.end
    ? { key: `${LABEL_PREFIX}.range`, fallback: range }
    : spec("from_date", "from {{date}}", { date: formatDate(event.start) });
}

/**
 * The subscribe link: the same feed over the webcal scheme, which desktop
 * calendar apps register for, so a click subscribes rather than downloads.
 * Google Calendar and Outlook on the web take the https URL pasted in.
 */
export function webcalUrl(feedUrl: string): string {
  return feedUrl.replace(/^https?:\/\//i, "webcal://");
}

/** The kind words, for the row's eyebrow. */
export const KIND_LABELS: Record<CalendarKind, LabelSpec> = {
  term_open: spec("kind_term_open", "Term opens"),
  term_close: spec("kind_term_close", "Learner close"),
  holiday: spec("kind_holiday", "School holiday"),
  exam_window: spec("kind_exam_window", "Exam window"),
  results: spec("kind_results", "Results"),
  campaign: spec("kind_campaign", "Campaign window"),
};
