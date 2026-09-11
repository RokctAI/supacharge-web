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

// The living marketing calendar (lms_sdk 1.28.0; Ray, 2026-09-11: "i want
// it alive like schedule move as time pass"): where the school year is
// today, the next campaign window with its countdown, the upcoming windows
// with dates, countdown, theme and status badge, and the iCalendar feed to
// subscribe to. Everything is computed server-side by rlms.marketing_calendar
// on the day the page is read; this component only draws the answer.
//
// No "use client": the page renders on the server from data the page
// loaded. The copy-link button, the one browser-only control, is the
// sibling ./lms-marketing-calendar.client.tsx. Every word is read through
// the shell's `t` (app/lib/i18n) under app.lms.calendar.* with the English
// beside each key as the fallback (the agent-header-menu.ts pattern), and
// nothing here names the brand or a host: the calendar's name and the feed
// URL come from the backend's answer.

import { CalendarDays, ExternalLink } from "lucide-react";
import React from "react";

import t from "@/app/lib/i18n";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  KIND_LABELS,
  LABEL_PREFIX,
  STATUS_LABELS,
  countdown,
  formatDate,
  formatRange,
  statusVariant,
  upcomingWindows,
  webcalUrl,
  type CalendarEvent,
  type LabelSpec,
  type MarketingCalendar,
} from "@/components/custom/landing/lms-calendar-rules";
import { LmsCopyLinkButton } from "@/components/custom/lms-marketing-calendar.client";

/** `t(key)`, or `fallback` (with its {{params}} filled) when the dictionary has no such key. */
function word(key: string, fallback: string, params?: Record<string, string>): string {
  const value = t(key, params);
  if (value && value !== key) return value;
  return Object.entries(params ?? {}).reduce(
    (text, [name, param]) => text.split(`{{${name}}}`).join(param),
    fallback,
  );
}

function say(label: LabelSpec): string {
  return word(label.key, label.fallback, label.params);
}

const L = (name: string, fallback: string, params?: Record<string, string>) =>
  word(`${LABEL_PREFIX}.${name}`, fallback, params);

function StatusBadge({ status }: { status: CalendarEvent["status"] }) {
  return <Badge variant={statusVariant(status)}>{say(STATUS_LABELS[status])}</Badge>;
}

function NowCard({ calendar }: { calendar: MarketingCalendar }) {
  const now = calendar.now;
  const holiday = now.holiday;
  return (
    <Card>
      <CardHeader>
        <CardDescription>{L("now_eyebrow", "Now")}</CardDescription>
        <CardTitle className="text-2xl">
          {now.in_term && now.term
            ? now.term.label
            : holiday?.after
              ? L("holiday_after", "School holiday after {{term}}", { term: holiday.after.label })
              : L("holiday", "School holiday")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {now.in_term && now.term ? (
          <>
            <p className="text-3xl font-semibold">
              {L("week_of_term", "Week {{week}}", { week: String(now.week_of_term ?? 1) })}
            </p>
            <p className="text-muted-foreground">
              {now.days_left_in_term === 0
                ? L("closes_today", "Learners close today")
                : L("days_left_in_term", "{{days}} days to the learner close on {{date}}", {
                    days: String(now.days_left_in_term ?? 0),
                    date: formatDate(now.term.end),
                  })}
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold">
              {holiday?.next_opening && holiday.days_until_opening !== null
                ? L("days_until_opening", "{{days}} days to {{term}}", {
                    days: String(holiday.days_until_opening),
                    term: holiday.next_opening.label,
                  })
                : L("next_opening_unknown", "Next opening not packaged yet")}
            </p>
            {holiday?.next_opening ? (
              <p className="text-muted-foreground">
                {L("opens_on", "Learners return on {{date}}", {
                  date: formatDate(holiday.next_opening.start),
                })}
              </p>
            ) : null}
          </>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <StatusBadge status={now.status} />
          <span className="text-xs text-muted-foreground">
            {L("computed_on", "Computed on {{date}} ({{timezone}})", {
              date: formatDate(calendar.today),
              timezone: calendar.timezone,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function NextCard({ calendar }: { calendar: MarketingCalendar }) {
  const next = calendar.next_campaign;
  return (
    <Card>
      <CardHeader>
        <CardDescription>{L("next_eyebrow", "Next campaign window")}</CardDescription>
        <CardTitle className="text-2xl">
          {next ? next.label : L("no_next", "No campaign window ahead in the packaged years")}
        </CardTitle>
      </CardHeader>
      {next ? (
        <CardContent className="space-y-2 text-sm">
          <p className="text-3xl font-semibold">{say(countdown(next))}</p>
          <p className="text-muted-foreground">{formatRange(next.start, next.end)}</p>
          {next.theme ? <p>{next.theme}</p> : null}
          <div className="pt-2">
            <StatusBadge status={next.status} />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function WindowRow({ event }: { event: CalendarEvent }) {
  return (
    <li className="flex flex-col gap-2 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {say(KIND_LABELS[event.kind])}
        </p>
        <p className="font-medium">{event.label}</p>
        <p className="text-sm text-muted-foreground">{formatRange(event.start, event.end)}</p>
        {event.theme ? <p className="text-sm">{event.theme}</p> : null}
        {event.source?.url ? (
          <a
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:underline"
            href={event.source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {event.source.title ?? L("source", "Source")}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
        <span className="text-sm font-semibold tabular-nums">{say(countdown(event))}</span>
        <StatusBadge status={event.status} />
      </div>
    </li>
  );
}

function SubscribeCard({ calendar }: { calendar: MarketingCalendar }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{L("subscribe_eyebrow", "Subscribe")}</CardDescription>
        <CardTitle className="text-xl">{calendar.calendar_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {L(
            "subscribe_help",
            "Add this feed in Google Calendar (Other calendars, From URL) or Outlook (Add calendar, Subscribe from web). It updates itself as the dates move.",
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            href={webcalUrl(calendar.feed_url)}
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {L("subscribe_link", "Subscribe to calendar")}
          </a>
          <LmsCopyLinkButton
            value={calendar.feed_url}
            label={L("copy_link", "Copy link")}
            copiedLabel={L("copied", "Copied")}
          />
        </div>
        <code className="block break-all rounded-md bg-muted px-3 py-2 text-xs">
          {calendar.feed_url}
        </code>
        {!calendar.feed_token_configured ? (
          <p className="text-xs text-muted-foreground">
            {L(
              "feed_token_hint",
              "No feed token is configured for this site, so the feed answers only a signed-in manager. Set marketing_calendar_feed_token in the site's configuration to let a calendar app subscribe.",
            )}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LmsMarketingCalendar({ calendar }: { calendar: MarketingCalendar }) {
  const windows = upcomingWindows(calendar);
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">{L("title", "Marketing calendar")}</h1>
        <p className="text-muted-foreground">
          {L(
            "subtitle",
            "Where the school year is today, what is next and the campaign windows ahead, derived from the gazetted term dates and the NSC exam windows for {{years}}.",
            { years: calendar.years.join(", ") },
          )}
        </p>
        {calendar.approximate_years.length ? (
          <p className="text-sm text-amber-500">
            {L("approximate_notice", "Term dates for {{years}} are not packaged yet; those windows are calendar-quarter approximations.", {
              years: calendar.approximate_years.join(", "),
            })}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <NowCard calendar={calendar} />
        <NextCard calendar={calendar} />
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">{L("upcoming_heading", "Upcoming windows")}</h2>
        {windows.length ? (
          <ul className="rounded-lg border bg-card px-4 text-card-foreground">
            {windows.map((event) => (
              <WindowRow key={event.id} event={event} />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{L("no_upcoming", "Nothing ahead in the packaged years.")}</p>
        )}
      </section>

      <SubscribeCard calendar={calendar} />
    </div>
  );
}

/** What the page shows when the role gate or the backend refused the calendar. */
export function LmsMarketingCalendarDenied() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">{L("title", "Marketing calendar")}</h1>
      <p className="text-muted-foreground">
        {L("denied", "Sign in as a manager to see the marketing calendar.")}
      </p>
    </div>
  );
}
