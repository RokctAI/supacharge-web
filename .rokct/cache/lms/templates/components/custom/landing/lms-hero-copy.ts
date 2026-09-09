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

// Draft copy pending Ray's approval.
//
// Supacharge's hero copy, registered into base_sdk's
// components/custom/landing/hero-copy.ts registry: the hero lays these
// fields over its HERO_CONFIG defaults (rokctapp's words). An omitted field
// keeps the default; an empty list hides the trust line or the store
// badges; an empty background string hides the background. No statistic
// appears here because no source carries one - see LMS_LANDING_PLACEHOLDERS
// in ./lms-landing-config.ts for the facts still owed.
//
// Since 1.15.0 the download buttons ARE the frame's store badges (Ray,
// 2026-09-09, on a custom button drawn in the badge's shape: "cant say
// this, look at the rokctai hero how it say it"): one HeroBadge per shown
// app, drawn by base_sdk's hero exactly as rokct.ai's "Available in the /
// Chrome Web Store" and "Download on the / App Store" badges are - the same
// pill, the same mark at the left, the same small line over the same big
// line - with rokct.ai's wording pattern applied to a platform that has no
// store: the small line says what the visitor does, the big line names the
// platform ("Download for" over "Android", "Download for" over "Windows"),
// never a file format. The marks are the SVG files this SDK installs under
// public/brand/marks/ (the Simple Icons tracings, CC0; no CDN), handed to
// the frame through its {src, alt} icon slot; lms-theme.css turns them
// white in dark mode, as the frame's own marks follow its text colour.

import type { HeroCopy } from "@/components/custom/landing/hero-copy";
import type { HeroBadge } from "@/components/custom/landing/hero-config";
import {
  LMS_SHOWN_APPS,
  type LandingApp,
} from "@/components/custom/landing/lms-landing-config";

/**
 * The platform mark the frame draws in each badge, by app id: the SVG files
 * this SDK installs for Android and Windows, and the frame's own Apple
 * glyph for the day the iOS entry is shown again.
 */
export const LMS_APP_MARKS: Record<
  LandingApp["id"],
  NonNullable<HeroBadge["icon"]>
> = {
  android: { src: "/brand/marks/android.svg", alt: "Android" },
  desktop: { src: "/brand/marks/windows.svg", alt: "Windows" },
  ios: "app-store",
};

/** One store badge per shown app, in the frame's own shape. */
export const LMS_HERO_BADGES: HeroBadge[] = LMS_SHOWN_APPS.map((app) => ({
  id: app.id,
  href: app.href,
  eyebrow: app.eyebrow,
  label: app.platform,
  icon: LMS_APP_MARKS[app.id],
}));

const LMS_HERO_COPY: HeroCopy = {
  // The frame renders "<text> <verb> <suffix>"; the suffix carries the
  // connective, so each word's verb is empty.
  headlineWords: [
    { text: "Learn faster", verb: "" },
    { text: "Pass with confidence", verb: "" },
    { text: "Find your tutor", verb: "" },
  ],
  headlineSuffix: "with Supacharge",
  // No input on this hero (lms-hero-form.tsx), so nothing to type into it.
  placeholders: [],
  backgroundImage: "",
  // The frame draws this line over its badges, as rokct.ai's hero does.
  trustLine: ["Trusted by learners across South Africa"],
  badges: LMS_HERO_BADGES,
};

export default LMS_HERO_COPY;
