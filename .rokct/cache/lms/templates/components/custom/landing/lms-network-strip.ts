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
// Supacharge's say over base_sdk's NETWORK STRIP
// (components/custom/landing/network-strip.ts, base_sdk >= 1.23.0): the
// other sites of the Rokct network under "Trusted by", which base draws in
// the footer row of every shell by default (FooterChromeRow,
// components/custom/footer-chrome.tsx - the row lms-footer-section.tsx
// ends the landing page with), minus the shell itself.
//
// Ray, 2026-09-09: "supacharge dont need the strip yet". So this shell
// draws it NOWHERE: the footer surface off, the landing surfaces off. Base
// keeps the list, the rule and the markup; when Ray wants the strip on
// supacharge.app, `footer: true` (base's default) is the only change.
//
// Registered with one line at // @rokct-sdk-network-strip-start through
// this SDK's manifest integrations. The shape is written out here rather
// than imported from base's file, the way lms-site-metadata.ts does it:
// against a base_sdk older than 1.23.0 the registry file is absent, the
// installer skips the line with a warning ("Integration target not
// found") and this module sits unused - and an `import type` of a module
// that is not on disk is a compile error. Nothing here names a URL: the
// list is base's.

/** The subset of base_sdk >= 1.23.0's NetworkStripConfig this module fills. */
export interface LmsNetworkStrip {
  /** Base's default, "Trusted by", when absent. */
  heading?: string;
  /** Site keys drawn first; the list's order when absent. */
  order?: string[];
  /** Site keys left out on this shell; supacharge.app itself is always left out. */
  hidden?: string[];
  placement?: {
    landing?: "afterHero" | "beforeFooter" | "none";
    footer?: boolean;
  };
}

const LMS_NETWORK_STRIP: LmsNetworkStrip = {
  placement: {
    landing: "none",
    footer: false,
  },
};

export default LMS_NETWORK_STRIP;
