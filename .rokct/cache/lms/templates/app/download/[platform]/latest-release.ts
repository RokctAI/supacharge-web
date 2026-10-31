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

// The one fetch of the latest Supacharge release (1.39.0, moved out of
// ./route.ts). The download route reads it to redirect, and the landing
// reads it (components/custom/landing/lms-available-apps.ts) to show only
// the badges whose file the release carries - the same request through
// Next's data cache with the same ten-minute revalidation, so the badges
// and the route never disagree for longer than one revalidation and a burst
// of visitors costs one API call. Server-only: it is imported by the route
// handler and by server code, never rendered in a browser.

import { LMS_RELEASES_API } from "./resolve";

/** How long one API answer serves every visitor, in seconds. */
export const LMS_RELEASE_REVALIDATE_SECONDS = 600;

/**
 * The latest release as the public API answers it (no token: the
 * repository is public), or null when the API is unreachable, rate-limited
 * or answers anything but 200.
 */
export async function fetchLatestRelease(): Promise<unknown> {
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
