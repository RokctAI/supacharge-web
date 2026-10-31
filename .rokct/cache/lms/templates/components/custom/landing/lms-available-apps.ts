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

// Which of the landing's apps the latest release can actually be downloaded
// for (1.39.0; Ray, 2026-10-31: the AppGallery badge must show only when
// the release has a separate Huawei APK - there is no real Huawei build yet,
// and the badge served the Android APK). LMS_SHOWN_APPS says which apps the
// landing offers; this narrows it to the ones whose /download/<platform>
// link would hand out a file: the same latest-release fetch the download
// route makes (app/download/[platform]/latest-release.ts, Next's data cache,
// revalidated every ten minutes), read through availablePlatforms(). The
// rule is the same for every platform - an Android or Windows badge whose
// file is missing from the release is hidden too - and a failed fetch hides
// every direct download. A store listing (storeUrl) is not a release file,
// so an entry linked to one stays.
//
// Server-only in effect: in a browser every answer is [] and nothing is
// fetched. Two ways in:
//  - loadAvailableApps(): awaited by server code that renders the apps
//    itself (lms-footer-section.tsx, the lesson route's download prompt).
//  - availableAppsNow(): synchronous, for the copy modules base_sdk reads
//    as plain objects (lms-hero-copy.ts's badges, lms-header-menu.ts's apps
//    group, each a getter read per request). It answers the last result and,
//    once that is older than the revalidation window, starts a refresh for
//    the next request - stale-while-revalidate, the same window the fetch
//    has. Those modules await primeAvailableApps() when they load, so the
//    first request already has a result.

import { fetchLatestRelease, LMS_RELEASE_REVALIDATE_SECONDS } from "@/app/download/[platform]/latest-release";
import { availablePlatforms, isHrefAvailable } from "@/app/download/[platform]/resolve";
import {
  LMS_SHOWN_APPS,
  type LandingApp,
} from "@/components/custom/landing/lms-landing-config";

/** The shown apps whose link works for this release (pure; any release JSON). */
export function appsAvailableIn(release: unknown): LandingApp[] {
  const available = availablePlatforms(release);
  return LMS_SHOWN_APPS.filter((app) => isHrefAvailable(app.href, available));
}

const onServer = typeof window === "undefined";

let snapshot: { apps: LandingApp[]; at: number } | null = null;
let refreshing: Promise<LandingApp[]> | null = null;

/** The available apps, fetched now (through the data cache). [] in a browser. */
export async function loadAvailableApps(): Promise<LandingApp[]> {
  if (!onServer) return [];
  const apps = appsAvailableIn(await fetchLatestRelease());
  snapshot = { apps, at: Date.now() };
  return apps;
}

/** Loads a first result if there is none yet; what a copy module awaits on load. */
export async function primeAvailableApps(): Promise<void> {
  if (onServer && snapshot === null) await loadAvailableApps();
}

/**
 * The last result, synchronously ([] before the first, and in a browser),
 * starting a background refresh once it is older than the revalidation
 * window.
 */
export function availableAppsNow(): LandingApp[] {
  if (!onServer) return [];
  const stale =
    snapshot === null ||
    Date.now() - snapshot.at >= LMS_RELEASE_REVALIDATE_SECONDS * 1000;
  if (stale && refreshing === null) {
    refreshing = loadAvailableApps()
      .catch(() => [])
      .finally(() => {
        refreshing = null;
      });
  }
  return snapshot?.apps ?? [];
}
