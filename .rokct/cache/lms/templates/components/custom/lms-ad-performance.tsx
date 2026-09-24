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

// The ad-performance report on the admin calendar page (lms_sdk 1.32.0):
// which TikTok ads are decaying against the week before, what each flag
// says, and the suggested action a manager might take. The comparison, the
// thresholds and the flag prose are computed server-side by
// rlms.ad_performance on the day the page is read; this component only
// draws the answer, below the campaign windows it belongs to.
//
// Reporting only. There is no control on this surface that pauses an ad,
// moves a budget or writes anything back to the ad account: an action is a
// sentence, not a button.
//
// No "use client": the page renders on the server from data the page
// loaded, and nothing here needs the browser. Every word is read through
// the shell's `t` (app/lib/i18n) under app.lms.adperf.* with the English
// beside each key as the fallback (the lms-marketing-calendar.tsx pattern),
// only theme tokens are painted, and a figure the backend could not compute
// is drawn as "no data" rather than as a confident zero.

import { Activity, AlertTriangle, TrendingDown } from "lucide-react";
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
  ACTION_LABELS,
  FLAG_LABELS,
  LABEL_PREFIX,
  SEVERITY_LABELS,
  STATUS_LABELS,
  formatCount,
  formatDelta,
  formatMetric,
  formatMoney,
  formatPercent,
  hiddenFlagCount,
  lastSyncedLabel,
  orderedAds,
  severityVariant,
  statusVariant,
  summaryCounts,
  visibleFlags,
  windowLabel,
  type AdFlag,
  type AdPerformanceReport,
  type AdSignal,
  type LabelSpec,
} from "@/components/custom/landing/lms-ad-performance-rules";

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

/** A figure, or the words for "the backend could not compute this". */
function Figure({ value }: { value: string }) {
  return (
    <span className={value ? "tabular-nums" : "text-muted-foreground"}>
      {value || L("no_data", "no data")}
    </span>
  );
}

/** A metric cell: the figure, with its week-on-week move under it. */
function MetricCell({ value, delta }: { value: string; delta: string }) {
  return (
    <td className="whitespace-nowrap px-3 py-2 text-right">
      <Figure value={value} />
      {delta ? (
        <span className="block text-xs text-muted-foreground tabular-nums">{delta}</span>
      ) : null}
    </td>
  );
}

function FlagRow({ flag }: { flag: AdFlag }) {
  return (
    <li className="flex flex-col gap-2 border-b py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {say(FLAG_LABELS[flag.code])}
        </p>
        <p className="font-medium">{flag.headline}</p>
        <p className="text-sm text-muted-foreground">{flag.detail}</p>
        {flag.ad_name || flag.ad_id ? (
          <p className="text-sm">
            {L("flag_ad", "Ad: {{ad}}", { ad: flag.ad_name || flag.ad_id })}
          </p>
        ) : null}
        <p className="text-sm font-medium">{say(ACTION_LABELS[flag.action])}</p>
      </div>
      <div className="shrink-0">
        <Badge variant={severityVariant(flag.severity)}>
          {say(SEVERITY_LABELS[flag.severity])}
        </Badge>
      </div>
    </li>
  );
}

function AdRow({ ad, currency }: { ad: AdSignal; currency: string | null }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-3 py-2">
        <span className="block font-medium">{ad.ad_name || ad.ad_id}</span>
        {ad.campaign_name ? (
          <span className="block text-xs text-muted-foreground">{ad.campaign_name}</span>
        ) : null}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <Figure value={formatMoney(ad.spend, currency)} />
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <Figure value={formatCount(ad.impressions)} />
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <Figure value={formatCount(ad.conversions)} />
      </td>
      <MetricCell
        value={formatMoney(ad.cpa, currency)}
        delta={formatDelta(ad.cpa_change_pct)}
      />
      <MetricCell value={formatPercent(ad.ctr)} delta={formatDelta(ad.ctr_change_pct)} />
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <Figure value={formatMetric(ad.frequency, 1)} />
      </td>
      <td className="px-3 py-2 text-right">
        <Badge variant={statusVariant(ad.status)}>{say(STATUS_LABELS[ad.status])}</Badge>
      </td>
    </tr>
  );
}

function AdTable({ report }: { report: AdPerformanceReport }) {
  const ads = orderedAds(report);
  return (
    <Card>
      <CardHeader>
        <CardDescription>{L("table_eyebrow", "Every ad in the window")}</CardDescription>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingDown className="size-4" aria-hidden="true" />
          {L("table_title", "Ad by ad")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ads.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">
                    {L("column_ad", "Ad")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_spend", "Spend")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_impressions", "Impressions")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_conversions", "Conversions")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_cpa", "Cost per acquisition")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_ctr", "Click-through rate")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_frequency", "Frequency")}
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    {L("column_status", "Status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <AdRow key={ad.ad_id} ad={ad} currency={report.currency} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {L("no_ads", "No ad delivery was recorded in this window.")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FlagsCard({ report }: { report: AdPerformanceReport }) {
  const flags = visibleFlags(report.flags);
  const hidden = hiddenFlagCount(report.flags);
  return (
    <Card>
      <CardHeader>
        <CardDescription>{L("flags_eyebrow", "What is decaying")}</CardDescription>
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="size-4" aria-hidden="true" />
          {L("flags_title", "Flags and suggested actions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {flags.length ? (
          <>
            <ul className="text-card-foreground">
              {flags.map((flag) => (
                <FlagRow key={flag.id} flag={flag} />
              ))}
            </ul>
            {hidden ? (
              <p className="text-xs text-muted-foreground">
                {L("flags_more", "{{count}} more flags are not shown.", {
                  count: String(hidden),
                })}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {L("no_flags", "Nothing is decaying against the window before this one.")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function LmsAdPerformance({ report }: { report: AdPerformanceReport }) {
  const counts = summaryCounts(report);
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Activity className="size-5" aria-hidden="true" />
          {L("title", "Ad performance")}
        </h2>
        <p className="text-muted-foreground">
          {L(
            "summary",
            "{{ads}} ads measured over {{window}}: {{decaying}} decaying, {{watch}} to watch, {{healthy}} holding — {{synced}}.",
            {
              ads: String(counts.ads),
              window: say(windowLabel(report)),
              decaying: String(counts.decaying),
              watch: String(counts.watch),
              healthy: String(counts.healthy),
              synced: say(lastSyncedLabel(report)),
            },
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {L(
            "reporting_only",
            "Reporting only: nothing on this page pauses an ad, moves a budget or changes a bid. Every action below is a suggestion for a manager to take by hand.",
          )}
        </p>
      </header>
      <FlagsCard report={report} />
      <AdTable report={report} />
    </section>
  );
}

/** What the page shows when no ad account is configured for this site. */
export function LmsAdPerformanceNotConnected() {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <Activity className="size-5" aria-hidden="true" />
        {L("title", "Ad performance")}
      </h2>
      <Card>
        <CardHeader>
          <CardDescription>{L("not_connected_eyebrow", "Not connected")}</CardDescription>
          <CardTitle className="text-xl">
            {L("not_connected_title", "No TikTok ad account is connected")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            {L(
              "not_connected_body",
              "This site has no TikTok ad credentials configured, so no ad metrics are being collected and there is nothing to measure yet.",
            )}
          </p>
          <p className="text-muted-foreground">
            {L(
              "not_connected_hint",
              "Set tiktok_ads_access_token and tiktok_ads_advertiser_id in the site's configuration; the nightly pull then fills this report in and it reads the ad account without ever writing to it.",
            )}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
