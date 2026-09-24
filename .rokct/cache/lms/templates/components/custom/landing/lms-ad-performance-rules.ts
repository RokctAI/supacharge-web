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

// The ad-performance report's client-side rules (lms_sdk 1.32.0). The
// backend (rlms.ad_performance, `api.lms.ad_performance`) compares a
// trailing window of per-ad TikTok metrics against the equal-length window
// before it and answers which ads are decaying, with a suggested action per
// flag; this module only decides how the admin page READS that answer:
// which flags to render and in what order, which badge a severity or a
// status gets, and how a percentage move, a count and a spend figure are
// worded.
//
// Reporting only. Nothing here, and nothing the page draws, changes an ad,
// a budget or a bid: an `action` is a suggestion for a manager.
//
// Pure and import-free on purpose, so tests/test_ad_performance_page.py
// runs it under node with types stripped, the shape lms-calendar-rules.ts
// takes. Every visible word is an i18n key with its English beside it
// (`LabelSpec`); the component reads them through the shell's `t` and falls
// back to the English when the dictionary has no such key. A number the
// backend could not compute arrives as null and is NEVER drawn as 0.

/** Where one ad sits: `decaying` carries an `act` flag, `watch` a watch one. */
export type AdStatus = "healthy" | "watch" | "decaying";

/** How loudly a flag asks: `watch` is worth knowing, `act` is worth doing. */
export type AdFlagSeverity = "watch" | "act";

/** The decay shapes the backend recognises. */
export type AdFlagCode =
  | "cpa_rising"
  | "ctr_falling"
  | "frequency_high"
  | "spend_no_conversions"
  | "stale_data";

/** The SUGGESTED action on a flag — never performed, only shown. */
export type AdFlagAction =
  | "refresh_creative"
  | "pause"
  | "shift_budget"
  | "reconnect";

/** One ad's trailing window as `api.lms.ad_performance` answers it. */
export interface AdSignal {
  ad_id: string;
  ad_name: string;
  campaign_id: string;
  campaign_name: string;
  status: AdStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  /** null when there is nothing to divide by — never 0, never inf. */
  cpa: number | null;
  cpa_baseline: number | null;
  cpa_change_pct: number | null;
  /** A percentage, the unit the platform reports CTR in. */
  ctr: number | null;
  ctr_baseline: number | null;
  ctr_change_pct: number | null;
  frequency: number | null;
  /** The flag codes raised on this ad. */
  flags: string[];
}

/** One raised flag: what happened, and what a manager might do about it. */
export interface AdFlag {
  /** Stable per (ad, code), so a list can key by it. */
  id: string;
  ad_id: string;
  ad_name: string;
  code: AdFlagCode;
  severity: AdFlagSeverity;
  action: AdFlagAction;
  headline: string;
  detail: string;
}

/** The whole report. `connected` is false when no ad account is configured. */
export interface AdPerformanceReport {
  connected: boolean;
  platform: "tiktok";
  generated_at: string;
  /** The trailing window analysed, in days. */
  window_days: number;
  /** The equal-length window before it. */
  baseline_days: number;
  /** ISO date of the newest stored row, or null when nothing is stored. */
  last_synced: string | null;
  /** The ad account's own currency code, or null when it named none. */
  currency: string | null;
  ads: AdSignal[];
  flags: AdFlag[];
}

/** An i18n key with its English fallback and, where the copy counts, the parameters. */
export interface LabelSpec {
  key: string;
  fallback: string;
  params?: Record<string, string>;
}

/** The dictionary prefix every label on this report lives under. */
export const LABEL_PREFIX = "app.lms.adperf";

function spec(
  name: string,
  fallback: string,
  params?: Record<string, string>,
): LabelSpec {
  return params
    ? { key: `${LABEL_PREFIX}.${name}`, fallback, params }
    : { key: `${LABEL_PREFIX}.${name}`, fallback };
}

/** The badge word per ad status. */
export const STATUS_LABELS: Record<AdStatus, LabelSpec> = {
  healthy: spec("status_healthy", "Holding"),
  watch: spec("status_watch", "Watch"),
  decaying: spec("status_decaying", "Decaying"),
};

/** The badge word per severity. */
export const SEVERITY_LABELS: Record<AdFlagSeverity, LabelSpec> = {
  watch: spec("severity_watch", "Watch"),
  act: spec("severity_act", "Act"),
};

/** The short name of each decay shape, for a flag's eyebrow. */
export const FLAG_LABELS: Record<AdFlagCode, LabelSpec> = {
  cpa_rising: spec("flag_cpa_rising", "Cost per acquisition rising"),
  ctr_falling: spec("flag_ctr_falling", "Click-through rate falling"),
  frequency_high: spec("flag_frequency_high", "Audience saturated"),
  spend_no_conversions: spec("flag_spend_no_conversions", "Spend without conversions"),
  stale_data: spec("flag_stale_data", "Metrics not arriving"),
};

/** The suggested action, worded as a suggestion. */
export const ACTION_LABELS: Record<AdFlagAction, LabelSpec> = {
  refresh_creative: spec("action_refresh_creative", "Suggested: refresh the creative"),
  pause: spec("action_pause", "Suggested: pause this ad"),
  shift_budget: spec("action_shift_budget", "Suggested: shift budget to a healthier ad"),
  reconnect: spec("action_reconnect", "Suggested: check the ad account connection"),
};

/**
 * The badge variant per severity: an `act` flag reads as the default
 * (filled) badge, a `watch` one as the quieter secondary. The same three
 * variants the calendar's badges use, so the page keeps one badge language.
 */
export function severityVariant(
  severity: AdFlagSeverity,
): "default" | "secondary" | "outline" {
  return severity === "act" ? "default" : "secondary";
}

/** The badge variant per ad status. */
export function statusVariant(
  status: AdStatus,
): "default" | "secondary" | "outline" {
  if (status === "decaying") return "default";
  if (status === "watch") return "secondary";
  return "outline";
}

/** How many flags the page renders before it says how many more there are. */
export const FLAG_RENDER_LIMIT = 8;

const SEVERITY_ORDER: AdFlagSeverity[] = ["act", "watch"];

function severityRank(severity: AdFlagSeverity): number {
  const rank = SEVERITY_ORDER.indexOf(severity);
  return rank === -1 ? SEVERITY_ORDER.length : rank;
}

/**
 * Flags worst first: every `act` before every `watch`, then a stable order
 * inside a severity (by ad, then by code) so the list does not shuffle
 * between reads of the same report.
 */
export function sortFlags(flags: AdFlag[]): AdFlag[] {
  return [...(flags ?? [])].sort((a, b) => {
    const bySeverity = severityRank(a.severity) - severityRank(b.severity);
    if (bySeverity !== 0) return bySeverity;
    if (a.ad_id !== b.ad_id) return a.ad_id < b.ad_id ? -1 : 1;
    if (a.code !== b.code) return a.code < b.code ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/** The flags the page draws: sorted, capped at `limit`. */
export function visibleFlags(
  flags: AdFlag[],
  limit: number = FLAG_RENDER_LIMIT,
): AdFlag[] {
  return sortFlags(flags).slice(0, Math.max(0, limit));
}

/** How many flags the cap left out — 0 when all of them render. */
export function hiddenFlagCount(
  flags: AdFlag[],
  limit: number = FLAG_RENDER_LIMIT,
): number {
  return Math.max(0, (flags?.length ?? 0) - Math.max(0, limit));
}

/** Thousands-grouped, locale-free, so the page reads the same everywhere. */
export function formatCount(value: number | null): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  let grouped = "";
  for (let index = 0; index < digits.length; index += 1) {
    if (index > 0 && (digits.length - index) % 3 === 0) grouped += " ";
    grouped += digits[index];
  }
  return sign + grouped;
}

/** A ratio to two decimals, or "" when the backend could not compute it. */
export function formatMetric(value: number | null, digits: number = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  return value.toFixed(Math.max(0, digits));
}

/** A CTR figure as the percentage the platform reports it in. */
export function formatPercent(value: number | null): string {
  const text = formatMetric(value, 2);
  return text ? `${text}%` : "";
}

/**
 * A signed percentage move, no decimals: "+62%" when a metric rose, "-34%"
 * when it fell, "" when there was nothing to compare against. The sign is
 * the point — a rise in CPA and a fall in CTR are both bad news.
 */
export function formatDelta(pct: number | null): string {
  if (pct === null || pct === undefined || !Number.isFinite(pct)) return "";
  const rounded = Math.round(pct);
  return `${rounded > 0 ? "+" : rounded < 0 ? "-" : ""}${Math.abs(rounded)}%`;
}

/**
 * Money in the ad account's own currency, as the backend named it — never
 * a hard-coded symbol, and "" when there is no figure to show.
 */
export function formatMoney(
  value: number | null,
  currency: string | null,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const amount = `${formatCount(Math.trunc(value))}.${Math.abs(
    Math.round((value - Math.trunc(value)) * 100),
  )
    .toString()
    .padStart(2, "0")}`;
  return currency ? `${currency} ${amount}` : amount;
}

/** How many ads sit in each status, and how many flags ask to be acted on. */
export function summaryCounts(report: Pick<AdPerformanceReport, "ads" | "flags">): {
  ads: number;
  decaying: number;
  watch: number;
  healthy: number;
  act: number;
  flags: number;
} {
  const ads = report.ads ?? [];
  const flags = report.flags ?? [];
  return {
    ads: ads.length,
    decaying: ads.filter((ad) => ad.status === "decaying").length,
    watch: ads.filter((ad) => ad.status === "watch").length,
    healthy: ads.filter((ad) => ad.status === "healthy").length,
    act: flags.filter((flag) => flag.severity === "act").length,
    flags: flags.length,
  };
}

/** "The last 7 days against the 7 before" — the comparison in one phrase. */
export function windowLabel(
  report: Pick<AdPerformanceReport, "window_days" | "baseline_days">,
): LabelSpec {
  return spec("window", "the last {{days}} days against the {{baseline}} before", {
    days: String(report.window_days),
    baseline: String(report.baseline_days),
  });
}

/** What the report says about its own freshness. */
export function lastSyncedLabel(
  report: Pick<AdPerformanceReport, "last_synced">,
): LabelSpec {
  return report.last_synced
    ? spec("last_synced", "metrics through {{date}}", { date: report.last_synced })
    : spec("never_synced", "no metrics stored yet");
}

/**
 * The per-ad table's rows: worst first, as the backend ordered them, and
 * defensively re-sorted here so the page never depends on that order.
 */
export function orderedAds(report: Pick<AdPerformanceReport, "ads">): AdSignal[] {
  const rank = (status: AdStatus) =>
    status === "decaying" ? 0 : status === "watch" ? 1 : 2;
  return [...(report.ads ?? [])].sort((a, b) => {
    const byStatus = rank(a.status) - rank(b.status);
    if (byStatus !== 0) return byStatus;
    if (a.spend !== b.spend) return b.spend - a.spend;
    return a.ad_id < b.ad_id ? -1 : a.ad_id > b.ad_id ? 1 : 0;
  });
}
