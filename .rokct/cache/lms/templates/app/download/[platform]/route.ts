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

// GET /download/<platform>: the direct download of the latest Supacharge
// build for that platform (1.15.0; Ray, 2026-09-09: "there is no way we can
// resolve to get the direct download link?").
//
// The landing's download badges, the header's app cards, the footer links
// and the lesson prompt all point here (LMS_APPS in
// components/custom/landing/lms-landing-config.ts). The handler asks the
// public GitHub releases API for the latest release - no token, the
// repository is public - through Next's data cache with a ten-minute
// revalidation, so a burst of visitors costs one API call and a new
// release is picked up within ten minutes; ./resolve.ts finds the
// platform's asset by its name pattern and this answers a 302 to it. When
// the API is unreachable, rate-limited or carries no asset for the
// platform the 302 goes to the releases page instead, so the button never
// dead-ends. A platform the route does not serve (iOS, which nothing
// publishes) is a 404, not an invented destination.
//
// A prefetch is answered with 204 and no redirect: a router or browser
// warming the link must not start a 127 MB download on the visitor's
// behalf. The surfaces render these links as plain anchors (external:
// true), so this is a guard, not the normal path.

import { NextResponse } from "next/server";

import {
  LMS_RELEASES_API,
  isDownloadPlatform,
  resolveDownload,
} from "./resolve";

/** How long one API answer serves every visitor, in seconds. */
export const LMS_RELEASE_REVALIDATE_SECONDS = 600;

function isPrefetch(request: Request): boolean {
  const headers = request.headers;
  return (
    headers.get("next-router-prefetch") === "1" ||
    headers.get("rsc") === "1" ||
    headers.get("purpose") === "prefetch" ||
    (headers.get("sec-purpose") ?? "").includes("prefetch")
  );
}

async function fetchLatestRelease(): Promise<unknown> {
  try {
    const response = await fetch(LMS_RELEASES_API, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "supacharge-web download route",
      },
      next: { revalidate: LMS_RELEASE_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const { platform } = await context.params;
  if (!isDownloadPlatform(platform)) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }
  if (isPrefetch(request)) {
    return new NextResponse(null, { status: 204 });
  }
  const release = await fetchLatestRelease();
  const target = resolveDownload(release, platform);
  return NextResponse.redirect(target.url, {
    status: 302,
    headers: { "cache-control": "no-store" },
  });
}
