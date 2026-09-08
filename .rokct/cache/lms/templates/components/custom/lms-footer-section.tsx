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

"use client";

// The landing page's footer: the motto, the section links, the auth links
// the page hands in, the app link and the legal line. Copy:
// LMS_LANDING_CONFIG.footer and LMS_LANDING_CONFIG.app.

import React from "react";
import Link from "next/link";

import { LmsWordmark } from "@/components/custom/landing/lms-wordmark";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
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
  const app = LMS_LANDING_CONFIG.app;

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
            <a
              href={app.href}
              target={app.external ? "_blank" : undefined}
              rel={app.external ? "noopener noreferrer" : undefined}
              className="hover:text-[var(--sc-ink)] transition-colors"
            >
              {app.label}
            </a>
          </nav>
        </div>
        <p className="border-t border-[var(--sc-stroke-subtle)] pt-6 text-xs">{config.legal}</p>
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
