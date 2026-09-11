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

// Supacharge's values for base_sdk's shared copyright row
// (components/custom/footer-chrome.tsx, base_sdk >= 1.12.0), which
// lms-footer-section.tsx renders at the foot of the landing page.
//
// The row itself is generic chrome and knows none of this: the legal
// entity, the version and the state colours are all config, and they are
// Supacharge's here. Kept in its own file rather than added to
// lms-landing-config.ts because that file is product COPY - the words of
// each section - and none of this is copy.
//
// Since 1.31.0 the row also carries the app downloads (base_sdk 1.41.0's
// FooterChromeConfig.downloads): one entry per shown app, which base draws
// as platform icon buttons in place of the text links the footer section
// used to print (Ray, 2026-09-11: "footer has  download links let them be
// platform icons buttons"), and which base's InstallOffer reads to offer
// the visitor the build for the device they are on, the PWA install when
// no build matches (Ray, 2026-09-11: "this nextjs has install, it does
// show on mobile though i havent seen it in desktop i think it installs
// as pwa but i think it should check the platform and offer app of that
// platform"). The entries are LMS_SHOWN_APPS - the same list the header
// cards and the hero badges read, never the raw LMS_APPS - so a demoted
// platform has no button and no offer, and a store listing, once set,
// is where the button and the offer go.

import type { FooterChromeConfig } from "@/components/custom/landing/footer-chrome-config";

import { LMS_SHOWN_APPS } from "@/components/custom/landing/lms-landing-config";

/**
 * The version the footer advertises.
 *
 * This SDK ships the landing page the row sits in, so its own version is
 * what that page is. Keep it in step with lms/nextjs/manifest.json on every
 * release - the same hand-maintained arrangement rokctai_frontend has with
 * its version.json. A shell that tracks its own releases sets
 * `NEXT_PUBLIC_APP_VERSION` and that wins.
 */
export const LMS_LANDING_VERSION = "1.31.0";

/**
 * The legal entity the copyright line names - the same company
 * `LMS_LANDING_CONFIG.footer.legal` names, in the platform's own shape
 * (`© Copyright <year> - <holder>`), which is what the shared row renders.
 */
export const LMS_COPYRIGHT_HOLDER = "ROKCT INTELLIGENCE (PTY) LTD";

/**
 * The footer's downloads (1.31.0), one per shown app in the order the
 * header and the hero show them. `href` is what LMS_SHOWN_APPS already
 * resolved: the store listing when `storeUrl` is set, else the site's own
 * /download route. Typed off base's config so the entry shape is base's
 * own (DownloadEntry) and never restated here.
 */
export const LMS_FOOTER_DOWNLOADS: NonNullable<FooterChromeConfig["downloads"]> =
  LMS_SHOWN_APPS.map((app) => ({
    id: app.id,
    platform: app.downloadPlatform,
    label: app.label,
    href: app.href,
    external: app.external,
    title: app.description,
    mark: app.mark,
  }));

export const LMS_FOOTER_CHROME: FooterChromeConfig = {
  copyrightHolder: LMS_COPYRIGHT_HOLDER,
  version: process.env.NEXT_PUBLIC_APP_VERSION || LMS_LANDING_VERSION,
  downloads: LMS_FOOTER_DOWNLOADS,

  // The row's defaults are semantic green/amber/red; Supacharge's palette
  // already carries its own semantic trio, so the dot speaks in the page's
  // own colours without losing the green-good / red-bad reading. The brand
  // orange is deliberately NOT one of them: an orange dot on an orange page
  // says nothing.
  statusColors: {
    operational: "var(--sc-success)",
    maintenance: "var(--sc-star)",
    offline: "var(--sc-danger)",
    checking: "var(--sc-ink-3)",
  },
};
