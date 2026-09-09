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

// Ray, 2026-09-09: "why supacharge web cant get lessons and library? we make things to apps so it will mean waiting on downloading those assets to users browser before play. so they will be able to do other things like partner loging in to check his students, or student wanting to pay or update details on the go".
//
// The prompt the web shows where the app would play a lesson. Lessons and
// the library are app surfaces: their assets are downloaded once into the
// app, and a browser would have to fetch them before every play. So on the
// web a lesson route still resolves (no 404) and renders THIS instead of a
// player, offering the same two downloads the landing registers - the
// Android APK and the Windows desktop build, LMS_SHOWN_APPS from
// ./landing/lms-landing-config.ts, so the header, the hero, the footer and
// this prompt can never disagree about which apps exist. iOS is in that list
// with shown: false ("demoted for now") and never reaches this component.
// Everything else - the schedule when signed in, a partner checking their
// students, a student paying or updating their details - stays on the web.
//
// Words: the heading is the landing's own "Get the app" label; the line
// under it is Ray's brief for this surface ("for attending lessons it
// should ask you to download app on phone or download desktop app"), and
// each button's blurb is the entry's own description.
//
// Theme: the shell's shadcn tokens (Button, bg-card, text-muted-foreground),
// not the landing's sc-* classes - this renders inside /handson, which is
// the host's chrome, not Supacharge's landing.

import React from "react";
import Link from "next/link";
import { Monitor, Smartphone, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  LMS_LANDING_CONFIG,
  LMS_SHOWN_APPS,
  type LandingApp,
} from "@/components/custom/landing/lms-landing-config";
import { cn } from "@/lib/utils";

/** The words on the prompt, in one place so a test can read them. */
export const LMS_DOWNLOAD_APP_COPY = {
  heading: LMS_LANDING_CONFIG.app.label,
  body: "Lessons are attended in the app. Download the app on your phone or download the desktop app.",
};

/** The glyph beside each button: a phone for the phone builds, a monitor for the desktop one. */
const APP_GLYPHS: Record<LandingApp["id"], LucideIcon> = {
  android: Smartphone,
  desktop: Monitor,
  ios: Smartphone,
};

export interface LmsDownloadAppPromptProps {
  /** Where "Back" goes - the course the lesson belongs to, usually. */
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function LmsDownloadAppPrompt({
  backHref,
  backLabel = "Back to course",
  className,
}: LmsDownloadAppPromptProps) {
  return (
    <section
      aria-labelledby="lms-download-app-heading"
      data-testid="lms-download-app"
      className={cn(
        "mx-auto max-w-xl rounded-lg border bg-card p-8 text-center text-card-foreground shadow-sm",
        className,
      )}
    >
      <h2 id="lms-download-app-heading" className="text-2xl font-bold">
        {LMS_DOWNLOAD_APP_COPY.heading}
      </h2>
      <p className="mt-2 text-muted-foreground">{LMS_DOWNLOAD_APP_COPY.body}</p>

      <ul className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
        {LMS_SHOWN_APPS.map((app, index) => {
          const Glyph = APP_GLYPHS[app.id];
          return (
            <li key={app.id} className="flex flex-col items-center gap-1">
              <Button
                asChild
                variant={index === 0 ? "default" : "outline"}
                className="w-full gap-2 sm:w-auto"
              >
                <a
                  href={app.href}
                  target={app.external ? "_blank" : undefined}
                  rel={app.external ? "noopener noreferrer" : undefined}
                >
                  <Glyph aria-hidden="true" className="h-4 w-4" />
                  {app.label}
                </a>
              </Button>
              <span className="text-xs text-muted-foreground">{app.description}</span>
            </li>
          );
        })}
      </ul>

      {backHref && (
        <Link
          href={backHref}
          className="mt-8 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {backLabel}
        </Link>
      )}
    </section>
  );
}

export default LmsDownloadAppPrompt;
