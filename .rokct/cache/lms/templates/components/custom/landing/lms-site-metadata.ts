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
// and Supacharge has none - the wordmark is the brand.

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
  locale?: string;
}

const LMS_SITE_METADATA: LmsSiteMetadata = {
  siteName: "Supacharge",
  url: "https://supacharge.app",
  title: "Supacharge — learn faster, pass with confidence, find your tutor",
  tagline: "Learn faster. Pass with confidence. Find your tutor.",
  description:
    "Supacharge is the tutoring app for South African learners: live CAPS-aligned sessions with real tutors, audio and whiteboard, and a plan that fits your week.",
  keywords: ["tutoring", "CAPS", "South Africa", "online tutor", "matric", "Supacharge"],
  locale: "en_ZA",
  logo: "/brand/supacharge-wordmark.svg",
};

export default LMS_SITE_METADATA;
