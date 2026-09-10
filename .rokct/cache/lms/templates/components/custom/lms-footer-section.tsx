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

// The landing page's footer: the motto, the section links, the auth links
// the page hands in, the app links and the copyright row. Copy:
// LMS_LANDING_CONFIG.footer and, since 1.12.0, one link per shown app from
// LMS_SHOWN_APPS (the Android APK and the desktop build; iOS is in the list
// with shown: false and never renders) in place of the single "Get the app".
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

import { FooterChromeRow } from "@/components/custom/footer-chrome";
import { LmsWordmark } from "@/components/custom/landing/lms-wordmark";
import { LMS_FOOTER_CHROME } from "@/components/custom/landing/lms-footer-chrome";
import {
  LMS_LANDING_CONFIG,
  LMS_SHOWN_APPS,
} from "@/components/custom/landing/lms-landing-config";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export function LmsFooterSection({
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

  return (
    <footer
      id={id}
      className="w-full bg-[var(--sc-card-alt)] text-[var(--sc-ink-2)] border-t border-[var(--sc-stroke-subtle)] py-12 md:py-16"
    >
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-2">
            <LmsWordmark height={34} className="text-[var(--sc-ink)]" />
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
            {LMS_SHOWN_APPS.map((app) => (
              <a
                key={app.id}
                href={app.href}
                target={app.external ? "_blank" : undefined}
                rel={app.external ? "noopener noreferrer" : undefined}
                title={app.description}
                className="hover:text-[var(--sc-ink)] transition-colors"
              >
                {app.label}
              </a>
            ))}
          </nav>
        </div>
        <FooterChromeRow
          config={LMS_FOOTER_CHROME}
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
 */
export const meta: PageSectionMeta = { order: 95, nav: [], anchor: "site-footer" };

export default function LmsFooterPageSection({
  id,
  loginUrl,
  signupUrl,
}: PageSectionProps) {
  return <LmsFooterSection id={id} loginUrl={loginUrl} signupUrl={signupUrl} />;
}
