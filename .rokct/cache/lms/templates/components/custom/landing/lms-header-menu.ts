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
// ONE fixed link, since 1.31.1: About, to the company page corporate_sdk
// serves at /about (Ray, 2026-09-11, 20:44:16Z:
// "https://supacharge.school/about we have no way to get here and its so
// disconnected to the rest of the site"). Through 1.31.0 the menu carried
// no fixed `links` at all - every entry was a section on the page - so the
// about page, which corporate_sdk 1.1.0 installs (app/about/page.tsx,
// beside app/team/page.tsx) and which lms's own founder card fills (1.27.0,
// meta.page "about"), was reachable only by typing its address. The footer
// nav (LMS_LANDING_CONFIG.footer.links) links About and Team; the header
// carries About alone, so the bar stays `[Explore v]  Pricing  FAQ  About`.
// A fixed link because /about is a route, not a section id, so base has no
// live nav entry to resolve it against; the label is this module's own for
// the same reason. Sign-in and sign-up are still not repeated here: they
// are already in the host header beside this row.
//
// Since 1.12.0 the apps are up here too, as ONE group (Ray, 2026-09-09:
// "supacharge need to show these apps, ios is demoted for now. apk and
// desktop app"). A group rather than flat `links` because base_sdk 1.18.0
// draws an item that carries a `description` or an `icon` as a card - icon
// box, label, one-line blurb - only inside the groups panel; a flat link is
// a bare word. The entries are LMS_SHOWN_APPS from ./lms-landing-config.ts,
// the one list the hero, the footer and the in-app download prompt also
// read: iOS sits in LMS_APPS with shown: false and never reaches this menu.
//
// Since 1.23.0 most of the section links live in that panel too (Ray,
// 2026-09-10, on supacharge.app: "some of menus in header i think there
// should have gone to mega menu"). Seven bare words plus a trigger was a
// bar, not a menu. Now the desktop bar reads `[Explore v]  Pricing  FAQ`:
// base draws ONE trigger, the FIRST group's label, and its items as the
// panel's 300px lead column, every later group as a headed column beside
// it. So the groups are ordered for the render - "Explore" first (the
// trigger; sessions, subjects, tutors), then "Platform" (features,
// partners), then the apps - and each section entry is `{ anchor }`, the
// same id-only form the flat list uses: base resolves it against the live
// nav, so the word and any badge still come from the section's own
// `meta.nav` (partners keeps its "new") and an entry whose section is not
// on the page is dropped from the column the same way. Only `pricing` and
// `faq` stay flat: the two a visitor arrives for. The burger panel lists
// the same two links and the same three headed groups. The two group
// labels are this module's own - a group is not a section, so there is no
// `meta.nav` to lift them from - and lms is Supacharge's home SDK, so its
// product words belong here.
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
// the manifest named then.
//
// Since 1.20.0 the brand also COLLAPSES, the way rokct.ai's does (Ray,
// 2026-09-10, on supacharge.app: "the country code is lost in supacharge it
// is only in rokctai" and "rokctai has logo and name that the name fold
// into logo and menus disapear, this is not in supacharge. since supacharge
// has not icon cant it fold and only leave the first letter as its
// icon?"). `brand.collapse` is base_sdk 1.24.0's declaration: the large
// wordmark slides away `delayMs` after load, a country code and a chevron
// take its place and the desktop nav fades until the pointer is over the
// bar or the page is scrolled. What supacharge lacked was something to
// fold INTO - the logo is still "none" - and base_sdk 1.28.0 answers that:
// a collapsing brand with no image folds into a letter tile base draws
// itself (the platform name's first letter in the primary colour on the
// tab icon's dark ground), so this module declares nothing about the tile
// and still no image. Against base_sdk 1.24.0-1.27.0 the declaration
// compiles but the header folds into nothing, which is why the floor is
// 1.28.0.
//
// Since 1.26.0 the apps go FIRST, in one row (Ray, 2026-09-10: "header
// app links first. if possible put mobile apps in one row since supa dont
// have much menu"): base_sdk 1.36.0's `layout: "row"` lays the three cards
// side by side across a wider lead column, and its `megaLabel` keeps the
// bar's trigger reading "Explore" while the apps lead the panel; Explore
// and Platform are the headed columns beside them. Nothing else moves.
//
// The country code: rokct.ai's comes from a host-only branding cache the
// visitor's geo lookup fills (rokctai_frontend's app/config/platform.ts),
// which supacharge-web does not have - its getBrandingSync() answers an
// empty code. What this SDK owns is Supacharge's MARKET: the Open Graph
// locale lms-site-metadata.ts registers with base, `en_ZA`. Its region is
// the code beside the collapsed mark - the product's country, the way the
// wordmark's superscript reads - derived from that one field, so the
// letters are written nowhere else and follow the metadata if it moves.
//
// The wordmark's TEXT is not declared here. base_sdk 1.28.0's HeaderBrand
// carries `logo`, `wordmark` (a boolean: draw it or not), `badge` and
// `collapse`, and no name field: the header draws the host's own
// branding.tsx, which reads the shell's PLATFORM_NAME, and the letter tile
// takes the same name. Since 1.21.0 the brand string is "supacharge.school"
// (Ray, 2026-09-10, lowercase, wherever it is written as the brand), and
// the one place this SDK supplies it is lms-site-metadata.ts's `siteName`,
// the name base reads for the application name, the social card and the
// page-title template; base folds the dotted name to its stem after the
// collapse delay, so this SDK supplies the full name and nothing shorter.

import type { HeaderMenu } from "@/components/custom/landing/header-menu";

import {
  LMS_LANDING_CONFIG,
  LMS_SHOWN_APPS,
} from "@/components/custom/landing/lms-landing-config";
import LMS_SITE_METADATA from "@/components/custom/landing/lms-site-metadata";

/**
 * The region of an Open Graph locale, uppercased: "en_ZA" and "en-ZA" give
 * "ZA", "zh_Hant_TW" gives "TW"; a bare language ("en"), a numeric or
 * three-letter last segment, or nothing gives "" - and base's header then
 * draws no code and the tile folds on its own. Import-free on purpose: the
 * SDK's tests run it bare under node.
 */
export function localeRegion(locale: string | null | undefined): string {
  const segments = (locale ?? "").trim().split(/[_-]/);
  if (segments.length < 2) return "";
  const last = segments[segments.length - 1];
  return /^[A-Za-z]{2}$/.test(last) ? last.toUpperCase() : "";
}

/** The code beside the collapsed brand: the market's region, from the registered site locale. */
function marketCode(): string {
  return localeRegion(LMS_SITE_METADATA.locale);
}

/**
 * The sections Supacharge's header links to, in page order - the order
 * lms-*-section.tsx `meta.order` already puts them in, so reading down the
 * menu (the panel's columns first, then the flat links) is reading down
 * the page.
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
  // Supacharge text is the logo until an icon is designed (Ray, 2026-09-09);
  // since 1.20.0 it folds into base's letter tile, with the market's code
  // beside it, after rokct.ai's 1500ms (Ray, 2026-09-10).
  brand: { logo: "none", collapse: { delayMs: 1500, code: marketCode } },
  // The two links that stay on the bar (since 1.23.0); the other five
  // sections are the panel's first two columns below.
  anchors: ["pricing", "faq"],
  // The one route link on the bar (since 1.31.1): the company's about page,
  // corporate_sdk's /about (Ray, 2026-09-11, 20:44:16Z: "we have no way to
  // get here"). A route, not a section, so it is a fixed link with its own
  // label rather than an anchor base resolves.
  links: [{ id: "about", label: "About", href: "/about" }],
  // The bar's one trigger still reads "Explore" (since 1.26.0 the word is
  // declared here, base_sdk 1.36.0's megaLabel, because the first group is
  // no longer the Explore column).
  megaLabel: "Explore",
  groups: [
    {
      // First group = the panel's lead column: the apps, in ONE row
      // (since 1.26.0; base_sdk 1.36.0's layout).
      id: "apps",
      // "Get the app" - the landing's own label for the download.
      label: LMS_LANDING_CONFIG.app.label,
      layout: "row",
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
    {
      id: "explore",
      label: "Explore",
      items: [{ anchor: "sessions" }, { anchor: "subjects" }, { anchor: "tutors" }],
    },
    {
      id: "platform",
      label: "Platform",
      // partners' "new" badge rides in from lms-partners-section.tsx's meta.nav.
      items: [{ anchor: "features" }, { anchor: "partners" }],
    },
  ],
};

export default LMS_HEADER_MENU;
