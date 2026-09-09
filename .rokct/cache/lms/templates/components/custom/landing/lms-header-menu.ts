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
// host header beside this row, so repeating them would be noise. The app
// download (LMS_LANDING_CONFIG.app) is a real URL now rather than the old
// [[PLAY_STORE_URL]] token, but it points off-site to a GitHub releases
// page: the footer is the right place for that and already carries it, and
// the header is where a visitor looks to move around THIS page. If Ray wants
// it up here too it is one `links` entry away.

import type { HeaderMenu } from "@/components/custom/landing/header-menu";

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
  anchors: [
    "sessions",
    "subjects",
    "tutors",
    "features",
    "partners",
    "pricing",
    "faq",
  ],
};

export default LMS_HEADER_MENU;
