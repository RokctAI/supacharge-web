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

// The landing page's footer: the wordmark, the motto, the section links,
// the auth links the page hands in, and the copyright row with the Legal
// link group, the app download buttons and the install offer. Copy:
// LMS_LANDING_CONFIG.footer.
//
// Since 1.31.2 the copyright row carries base_sdk's Legal link group (Ray,
// 2026-09-11, 20:36:37Z: "still no legal pages in supa, even rokct they
// still #"). base_sdk 1.37.0's FooterChromeRow draws link groups only from
// `config.links`, and ./landing/lms-footer-chrome's LMS_FOOTER_CHROME
// declares none - so no legal link ever rendered, whatever the backend
// published. This section, a server component, now awaits base's guest
// read `listPublicTerms()` (app/actions/base/legal.ts: the enabled "Terms
// and Conditions" documents, and since base_sdk 1.45.0 the shell's bundled
// data/legal/ pages when the backend answers nothing) and spreads
// `legalFooterLinks(terms)` over the chrome config as `links`. Titles come
// from the documents, hrefs are /legal/<name> (corporate_sdk's pages), and
// the group's one word, "Legal", is base's default label. With nothing
// published `legalFooterLinks` answers `[]` and base draws no group, so the
// footer reads exactly as 1.31.1 until a document exists; the read
// soft-fails to that same empty list, never to a failed page.
//
// The app links (1.12.0-1.30.0: one text link per shown app in the nav)
// are gone from this file since 1.31.0 (Ray, 2026-09-11: "footer has
// download links let them be platform icons buttons"): the downloads are
// declared once on ./landing/lms-footer-chrome's config and base_sdk
// 1.41.0's FooterChromeRow draws them as platform icon buttons, with its
// InstallOffer beside them offering the build for the visitor's own
// device. Sign in and Create an account stay where they were.
//
// The wordmark is the traced SVG alone (lms-wordmark.tsx), as it was
// through 1.30.0. 1.31.0 drew the name's suffix after it in the primary
// colour, reading Ray's 07:34:03Z ruling ("also site name the .school get
// primary color in nextjs") as reaching the footer; it covered the site
// name in the header only (Ray, 2026-09-11, 20:33:16Z: "i dont think i
// told you to add .school to footer"), so 1.31.1 takes the suffix span
// out again. Nothing here carries `data-brand-wordmark`: the header's
// suffix is base's own span, and lms-theme.css still colours THAT one.
//
// The last row is base_sdk's shared chrome (FooterChromeRow, base_sdk
// >= 1.12.0) rather than a bare legal line: the same copyright row rokct.ai
// carries, status indicator and version included, with Supacharge's values
// from ./landing/lms-footer-chrome. It supersedes
// LMS_LANDING_CONFIG.footer.legal for rendering - that field names the same
// company and is left in place for now.
//
// The row would also carry base_sdk 1.23.0's network strip ("Trusted by",
// the other sites of the Rokct network) above the copyright line, and
// since 1.18.0 it does not: ./landing/lms-network-strip.ts registers the
// footer surface off (Ray, 2026-09-09: "supacharge dont need the strip
// yet"), so base's rule draws nothing here and this file passes nothing.

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. Nothing in
// this module needs the client - no state, no effect, no browser API - so
// it is a server module and its meta a plain object.

import React from "react";
import Link from "next/link";

import { listPublicTerms } from "@/app/actions/base/legal";
import { FooterChromeRow } from "@/components/custom/footer-chrome";
import { legalFooterLinks } from "@/components/custom/landing/legal-links";
import { LmsWordmark } from "@/components/custom/landing/lms-wordmark";
import { LMS_FOOTER_CHROME } from "@/components/custom/landing/lms-footer-chrome";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

/** The wordmark's height in px; the traced glyphs set the width. */
const WORDMARK_HEIGHT = 34;

export async function LmsFooterSection({
  id,
  loginUrl,
  signupUrl,
}: {
  id?: string;
  loginUrl: string;
  signupUrl: string;
}) {
  const config = LMS_LANDING_CONFIG.footer;
  if (!config) return null;

  // The published legal documents, read as a guest on the server; `[]`
  // with none (or no backend), which base's row draws as no group.
  const terms = await listPublicTerms();

  return (
    <footer
      id={id}
      className="w-full bg-[var(--sc-card-alt)] text-[var(--sc-ink-2)] border-t border-[var(--sc-stroke-subtle)] py-12 md:py-16"
    >
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-2">
            <LmsWordmark height={WORDMARK_HEIGHT} className="text-[var(--sc-ink)]" />
            <p className="text-xl font-semibold text-[var(--sc-primary)]">
              {config.motto}
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-3 text-sm"
          >
            {config.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--sc-ink)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href={loginUrl} className="hover:text-[var(--sc-ink)] transition-colors">
              Sign in
            </Link>
            <Link href={signupUrl} className="hover:text-[var(--sc-ink)] transition-colors">
              Create an account
            </Link>
          </nav>
        </div>
        <FooterChromeRow
          config={{ ...LMS_FOOTER_CHROME, links: legalFooterLinks(terms) }}
          className="border-t border-[var(--sc-stroke-subtle)] pt-6"
        />
      </div>
    </footer>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: the last place in the page
 * order, right before the host's own footer anchor. Not a nav stop - the
 * host's `footer` entry already ends the nav.
 *
 * Since 1.31.3 also part of the SITE FRAME (base_sdk 1.47.0's
 * `PageSectionMeta.frame`): base's site-frame.tsx draws it after the content
 * of a composed page that sits in the frame (corporate_sdk 1.2.0's /about,
 * /team and /legal), so those pages end the way the landing does (Ray,
 * 2026-09-11, 20:44:16Z: "https://supacharge.school/about we have no way
 * to get here and its so disconnected to the rest of the site"). On the
 * landing it renders exactly as before, by its order.
 */
export const meta: PageSectionMeta = {
  order: 95,
  nav: [],
  anchor: "site-footer",
  frame: true,
};

export default function LmsFooterPageSection({
  id,
  loginUrl,
  signupUrl,
}: PageSectionProps) {
  return <LmsFooterSection id={id} loginUrl={loginUrl} signupUrl={signupUrl} />;
}
