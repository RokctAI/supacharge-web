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
// Supacharge's site metadata, for base_sdk's site-metadata registry
// (components/custom/landing/site-metadata.ts, base_sdk >= 1.15.0): the
// <title>, description and social-card facts the shell's root layout and
// its generated Open Graph / Twitter image read from ONE registered module,
// so the words a search result or a shared link shows come from the home
// SDK that owns the product's copy rather than from a hand-edited layout.
// It is registered with one line at // @rokct-sdk-site-metadata-start
// through this SDK's manifest integrations; against base_sdk 1.14.0, which
// has no such file, the installer skips that line with a warning
// (sdk_installer_base.py update_integrations: "Integration target not
// found") and this module simply sits unused.
//
// The shape below is written out here rather than imported from base's
// file for that same reason: an `import type` of a module that is not on
// disk is a compile error, so importing base's SiteMetadataCopy would make
// every base_sdk < 1.15.0 shell fail to build for a feature that base is
// merely not offering yet. The registry checks the default export against
// its own SiteMetadataCopy structurally when it loads this module, so a
// field this file gets wrong is still caught at the registry.
//
// `logo` is the asset base draws into the GENERATED preview image;
// `ogImage` would be a ready-made png/jpg that replaces the generated one,
// and Supacharge has none - the wordmark is the brand. `still` (base_sdk
// >= 1.16.0) is the portrait tour frame that same generated image draws in
// a phone bezel on its right half: public/brand/social-still.png, the
// 744px-wide copy of ONE chapter of the app's guided tour that
// .github/workflows/sync_team_assets.yml pulls from RokctAI/supacharge's
// marketing/tour/screenshots (its STILL_CHAPTER value names the chapter;
// lms/team/marketing/tour/renders/README.md says how to flip it).
// `stillAnchor` follows the chapter: "bottom" for a header-first screen
// such as 06-schedule (the phone bleeds off the card's bottom edge, the
// screen's header shows), "top" for a bottom-sheet screen such as
// 02-auth_login. Against base_sdk 1.15.0 the registry has neither field
// and lays the rest over the default unchanged.

/** The subset of base_sdk >= 1.15.0's SiteMetadataCopy this module fills. */
export interface LmsSiteMetadata {
  title: string;
  description: string;
  tagline: string;
  siteName?: string;
  url?: string;
  keywords?: string[];
  /** A ready-made png/jpg preview; none here, base generates one. */
  ogImage?: string;
  /** Asset path drawn into the generated preview image. */
  logo?: string;
  /** Portrait tour frame the generated preview draws in a phone bezel (base_sdk >= 1.16.0). */
  still?: string;
  /** Where that phone hangs from; "bottom" (default) shows the screen's header. */
  stillAnchor?: "top" | "bottom";
  locale?: string;
}

// The brand string is "supacharge.school", lowercase, wherever it is
// written AS the brand (Ray, 2026-09-10, product owner's ruling; never
// "Supacharge School", never "Supacharge.school"). `siteName` is the one
// name this SDK supplies base with: base's root layout reads it as the
// application name, the Open Graph site name, the `%s — <siteName>` title
// template of every page below the home page and the generated preview's
// alt text, and base's header folds the name it shows to its stem after
// the collapse delay - this module only has to supply the full name. The
// prose fields (description, keywords, the hero and FAQ copy) talk ABOUT
// the product and keep "Supacharge".
const LMS_SITE_METADATA: LmsSiteMetadata = {
  siteName: "supacharge.school",
  url: "https://supacharge.school",
  title: "supacharge.school — learn faster, pass with confidence, find your tutor",
  tagline: "Learn faster. Pass with confidence. Find your tutor.",
  description:
    "Supacharge is the tutoring app for South African learners: live CAPS-aligned sessions with real tutors, audio and whiteboard, and a plan that fits your week.",
  keywords: ["tutoring", "CAPS", "South Africa", "online tutor", "matric", "Supacharge"],
  locale: "en_ZA",
  logo: "/brand/supacharge-wordmark.svg",
  still: "/brand/social-still.png",
  stillAnchor: "bottom",
};

export default LMS_SITE_METADATA;
