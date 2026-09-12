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
// destination ("GET IT ON" over "Google Play", "Download for" over
// "Windows"), never a file format. The marks are SVG files under
// public/brand/marks/, handed to the frame through its {src, alt} icon
// slot. Since 1.16.0 they are the store marks every visitor already knows
// (Ray, 2026-09-09: "we use what these platforms use for familiarity"):
// the Google Play triangle in Google's four colours for the Android
// entry, the Windows panes for the desktop one, the Apple mark for the iOS
// entry and the Huawei flower in Huawei red for the AppGallery one, each
// under its store's own badge wording from the entry's `badge` field
// ("GET IT ON" / "Google Play"; "but eventually we getting in those stores
// except windows"). Since 1.17.0 the files are base_sdk 1.26.0's: base
// installs them on every host and this SDK only names their paths, which
// is how a home SDK opts in; the literals below are unchanged. The two
// monochrome marks (Apple, Windows: "keep it black and white") are black
// on the light pill and white on the dark one, and base does that itself,
// keyed on the file name; the coloured ones are never touched. No CSS for
// them here, no CDN.
//
// Since 1.24.0 the wordmark slot is declared `brand: "stem"`: base_sdk
// 1.32.0's hero renders the site name's STEM - brandStemOf(PLATFORM_NAME),
// the part before the first dot, the whole name when it has none - as the
// wordmark's text on the SERVER, with the full name on the element's
// aria-label and title (Ray, 2026-09-10: the landing hero must not show
// ".school"; "we not hard coding but saying if value of x has a dot, do
// this"). The first HTML carries the stem; 1.22.0's client rewrite of the
// frame's span (lms-hero-wordmark.ts) is retired. Metadata, <title>,
// canonical, the Open Graph card and the header keep the full name.

import type { HeroCopy } from "@/components/custom/landing/hero-copy";
import type { HeroBadge } from "@/components/custom/landing/hero-config";
import {
  LMS_SHOWN_APPS,
  type LandingApp,
} from "@/components/custom/landing/lms-landing-config";

/**
 * The store mark the frame draws in each badge, by app id: the SVG files
 * base_sdk 1.26.0 installs under public/brand/marks/. The Android entry wears the
 * Google Play mark, the iOS entry the Apple mark, the Huawei entry the
 * AppGallery flower - the stores the app is, or will be, listed in (Ray,
 * 2026-09-09) - and the desktop entry the Windows panes, the one platform
 * with no store. Which of them is drawn is the entry's own business
 * (LMS_SHOWN_APPS: shown today, or listed).
 */
export const LMS_APP_MARKS: Record<
  LandingApp["id"],
  NonNullable<HeroBadge["icon"]>
> = {
  android: { src: "/brand/marks/google-play.svg", alt: "Google Play" },
  desktop: { src: "/brand/marks/windows.svg", alt: "Windows" },
  ios: { src: "/brand/marks/app-store.svg", alt: "App Store" },
  huawei: { src: "/brand/marks/app-gallery.svg", alt: "AppGallery" },
};

/** One store badge per shown app, in the frame's own shape. */
export const LMS_HERO_BADGES: HeroBadge[] = LMS_SHOWN_APPS.map((app) => ({
  id: app.id,
  href: app.href,
  eyebrow: app.badge.eyebrow,
  label: app.badge.label,
  icon: LMS_APP_MARKS[app.id],
}));

const LMS_HERO_COPY: HeroCopy = {
  // The frame renders "<text> <verb> <suffix>". The headline is the
  // rotating word alone since 1.31.1 (Ray, 2026-09-11, 20:39:47Z: `hero
  // drop "with suparcharge"`): through 1.31.0 the suffix read "with
  // Supacharge" after every word, so each verb was empty for the suffix
  // to carry the connective. Both stay empty now - nothing follows the
  // word, and no headline string ends with "with". The wordmark slot
  // above the headline (`brand`, below) is a different element and is
  // untouched.
  headlineWords: [
    { text: "Learn faster", verb: "" },
    { text: "Pass with confidence", verb: "" },
    { text: "Find your tutor", verb: "" },
  ],
  headlineSuffix: "",
  // No input on this hero (lms-hero-form.tsx), so nothing to type into it.
  placeholders: [],
  backgroundImage: "",
  // The frame draws this line over its badges, as rokct.ai's hero does.
  trustLine: ["Trusted by learners across South Africa"],
  badges: LMS_HERO_BADGES,
  // The wordmark shows the site name's stem, rendered by base on the server.
  brand: "stem",
  // No host logo tile beside that slot (base_sdk 1.46.0's HeroConfig.logo,
  // default "tile": base's hero-view.tsx draws the host's BrandLogo - the
  // "s" tile - beside the wordmark unless the copy says "none"). The slot
  // already carries the traced wordmark, so the tile showed the mark twice
  // (Ray, 2026-09-11, 20:39:12Z: "login register page, no s, full
  // supacharge without .school"). The same choice the header's brand makes
  // (lms-header-menu.ts: logo: "none").
  logo: "none",
};

export default LMS_HERO_COPY;
