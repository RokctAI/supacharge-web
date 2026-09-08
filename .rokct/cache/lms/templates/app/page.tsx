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

// The page that serves `/` in a shell whose home SDK is lms_sdk (Supacharge).
// Same role as agent_sdk's app/(chat)/page.tsx for rokctapp: an anonymous
// visitor goes to base_sdk's composed landing at /landing; a signed-in user
// goes to the lms home (LMS_LANDING_CONFIG.home.url, the Next.js counterpart
// of the Flutter home SDK's ScheduleRoute). Installed on the shell's own
// app/page.tsx so the composer overwrites the shell's holding page, the way
// base_sdk's host files overwrite the shell copies - and so a shell that is
// NOT composed keeps its own `/` rather than losing the route.
//
// The session is read through base_sdk's kernel seam
// (app/services/base/session.ts -> the host's app/lib/session.ts), never
// through app/(auth) directly, so this page works in a shell with or
// without auth_sdk composed: without it the seam answers "no session" and
// every visitor is anonymous.

import { redirect } from "next/navigation";

import { getPlatformSession } from "@/app/services/base/session";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getPlatformSession();

  if (!session || !session.user) {
    redirect("/landing");
  }

  redirect(LMS_LANDING_CONFIG.home.url);
}
