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

// Supacharge's header menu, for base_sdk's header-menu registry
// (components/custom/landing/header-menu.ts, base_sdk >= 1.13.0). Since
// base_sdk 1.14.0 the header itself is base's and the menu renders INSIDE
// it - inline beside the wordmark from the `lg` breakpoint up, behind a
// burger below it - rather than as a row under the shell's own header.
//
// Ray, looking at the live site: "menus in header and footer are not
// injected". The footer menu was already here - lms-footer-section.tsx
// renders LMS_LANDING_CONFIG.footer.links - but supacharge.app's header
// carried nothing but the wordmark, the theme toggle and the two auth
// links, because components/custom/header.tsx is the host shell's own file
// and no SDK may ship it. This module is the header half of that answer.
//
// It lists SECTION IDS, not hrefs, and deliberately carries no labels:
// base_sdk resolves each id against the page's live nav, so the word on
// screen and any badge come from the `meta.nav` entry of the section itself
// (lms-partners-section.tsx owns "Partners" and its `badge: "new"`). One
// place to edit, and no second list to fall out of step.
//
// It also means every entry below is a link to a section that is actually
// on the page. `pricing` is the one that matters: lms-pricing.tsx declares
// `renders: ({ plans }) => showsPricing(plans)` and draws nothing when the
// platform returns no plan rows, and on such a render base_sdk drops this
// entry instead of linking to an anchor that is not there.
//
// No fixed `links`, deliberately. Sign-in and sign-up are already in the
// host header beside this row, so repeating them would be noise.
//
// Since 1.12.0 the apps are up here too, as ONE group (Ray, 2026-09-09:
// "supacharge need to show these apps, ios is demoted for now. apk and
// desktop app"). A group rather than flat `links` because base_sdk 1.18.0
// draws an item that carries a `description` or an `icon` as a card - icon
// box, label, one-line blurb - only inside the groups panel; a flat link is
// a bare word. So the desktop bar leads with a single "Get the app" trigger
// that opens the two cards, and the burger panel lists them under the same
// heading. The entries are LMS_SHOWN_APPS from ./lms-landing-config.ts, the
// one list the hero, the footer and the in-app download prompt also read:
// iOS sits in LMS_APPS with shown: false and never reaches this menu.
//
// Since 1.13.0 the menu also says what the header's brand slot draws
// (base_sdk >= 1.21.0, HeaderMenu.brand). Ray, 2026-09-09: "i saw
// supacharge got a s logo in header, let home sdk declare if it needs logo
// there or not. supacharge text is the logo right now until i design an
// icon". The "S" was supacharge-web's own brand-logo.tsx, an asset-free
// placeholder drawing the platform's first letter, which base's header
// rendered beside the wordmark because nothing told it not to. `brand:
// { logo: "none" }` tells it: no image, the wordmark alone. Against a
// base_sdk older than 1.21.0 the field is unknown to the registry's
// HeaderMenu type and the compose fails to type-check, which is the floor
// the manifest names.

import type { HeaderMenu } from "@/components/custom/landing/header-menu";

import {
  LMS_LANDING_CONFIG,
  LMS_SHOWN_APPS,
} from "@/components/custom/landing/lms-landing-config";

/**
 * The sections Supacharge's header links to, in page order - the order
 * lms-*-section.tsx `meta.order` already puts them in, so reading down the
 * menu is reading down the page.
 *
 * `testimonials` is deliberately absent. The section no longer shows
 * [[TOKEN]] copy - since 1.8.0 its five quotes read as finished, and since
 * 1.10.0 they run in the shared auto-scrolling marquee - but all five are
 * still PLACEHOLDER stand-ins, not real customers (LMS_LANDING_PLACEHOLDERS
 * says so and asks for all five to be replaced). The header is the most
 * prominent thing on the page and points at sections whose words are
 * real; the row stays a floating-nav stop in the meantime. Add the id here
 * when the quotes are.
 */
const LMS_HEADER_MENU: HeaderMenu = {
  // Supacharge text is the logo until an icon is designed (Ray, 2026-09-09).
  brand: { logo: "none" },
  anchors: [
    "sessions",
    "subjects",
    "tutors",
    "features",
    "partners",
    "pricing",
    "faq",
  ],
  groups: [
    {
      id: "apps",
      // "Get the app" - the landing's own label for the download.
      label: LMS_LANDING_CONFIG.app.label,
      items: LMS_SHOWN_APPS.map(
        ({ id, label, href, external, description, icon }) => ({
          id,
          label,
          href,
          external,
          description,
          icon,
        }),
      ),
    },
  ],
};

export default LMS_HEADER_MENU;
