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

// The landing page's accountability-partner section: what a linked parent,
// guardian, sibling, teacher or mentor receives, and the boundary the
// platform keeps. Copy: LMS_LANDING_CONFIG.partners.
//
// The three cards are one swipeable row below 640px (`sc-row`,
// landing/lms-theme.css); from 640px up the grid is unchanged.
//
// Since 1.37.0 a dark "Become a Sponsor or Partner" card follows the three
// cards (LMS_LANDING_CONFIG.partners.join): the heading, one paragraph,
// three short ways to give and one primary button. The button is a
// same-site link to this SDK's own partner signup page (/partner/signup,
// app/partner/signup/page.tsx, which calls api.lms.partner_signup through
// the platform gateway). It never opens a chat app, a phone number or any
// other off-site contact link. `.sc-sponsor-card` (landing/lms-theme.css)
// keeps the card dark in both modes, with its own ink for each.

// No "use client" here (1.24.0): base reads `meta` in the SERVER render,
// where every export of a client module is a client reference (Next
// compiles it to registerClientReference) whose properties read as
// undefined - `meta.order`, `meta.nav` and `meta.renders` all lost, so the
// section fell to order 100 and the nav listed it by file name. Nothing in
// this module needs the client - no state, no effect, no browser API - so
// it is a server module and its meta a plain object.

import React from "react";
import Link from "next/link";
import {
  RiNotification4Line,
  RiCalendarCheckLine,
  RiShieldCheckLine,
  RiHandHeartLine,
  RiSchoolLine,
  RiTeamLine,
  RiHeart3Fill,
} from "@remixicon/react";

import {
  LMS_LANDING_CONFIG,
  type PartnersJoinConfig,
} from "@/components/custom/landing/lms-landing-config";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

const WAY_ICONS = [RiHandHeartLine, RiSchoolLine, RiTeamLine];

/** Only a same-site path is a valid button target: "/x", never "//x" or a scheme. */
function isSameSitePath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function LmsSponsorCard({ join }: { join: PartnersJoinConfig }) {
  const href = isSameSitePath(join.button.href) ? join.button.href : "/partner/signup";
  return (
    <div
      className="sc-sponsor-card flex flex-col gap-8 p-6 md:p-10"
      data-sponsor-card
    >
      <RiHeart3Fill className="sc-sponsor-heart" aria-hidden="true" />
      <div className="flex flex-col gap-3 max-w-2xl">
        <p className="sc-sponsor-eyebrow">{join.eyebrow}</p>
        <h3 className="text-[32px] md:text-[44px] font-extrabold leading-[1.1] tracking-tight text-balance">
          {join.heading}
        </h3>
        <p className="sc-sponsor-text text-base md:text-lg leading-relaxed">
          {join.text}
        </p>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {join.ways.map((way, i) => {
          const Icon = WAY_ICONS[i % WAY_ICONS.length];
          return (
            <li key={way.title} className="sc-sponsor-way flex gap-3 p-4">
              <Icon className="sc-sponsor-icon size-6 shrink-0" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">{way.title}</span>
                <span className="sc-sponsor-text text-sm leading-relaxed">{way.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div>
        <Link href={href} className="sc-btn sc-sponsor-btn">
          <RiHandHeartLine className="size-5" aria-hidden="true" />
          {join.button.label}
        </Link>
      </div>
    </div>
  );
}

export function LmsPartnersSection({
  id,
  signupUrl,
}: {
  id?: string;
  signupUrl: string;
}) {
  const config = LMS_LANDING_CONFIG.partners;
  if (!config) return null;

  return (
    <section
      id={id}
      className="w-full bg-[var(--sc-card-alt)] py-16 md:py-24 border-y border-[var(--sc-stroke-subtle)]"
    >
      <div className="container mx-auto px-4 xl:px-0 max-w-6xl flex flex-col gap-12">
        <div className="flex flex-col items-center text-center gap-5">
          <p className="sc-eyebrow">
            {config.eyebrow}
          </p>
          <h2 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
            {config.heading}
          </h2>
          <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
            {config.blurb}
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {config.who.map((who) => (
              <li
                key={who}
                className="sc-chip text-sm"
              >
                {who}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sc-row">
          <div className="flex flex-col gap-4 sc-card p-6 md:p-8">
            <RiCalendarCheckLine className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[var(--sc-ink)]">
              {config.weeklyHeading}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[var(--sc-ink-2)] leading-relaxed list-disc pl-4">
              {config.weekly.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 sc-card p-6 md:p-8">
            <RiNotification4Line className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
            <h3 className="text-xl font-bold text-[var(--sc-ink)]">
              {config.alertsHeading}
            </h3>
            <ul className="flex flex-col gap-2 text-sm text-[var(--sc-ink-2)] leading-relaxed list-disc pl-4">
              {config.alerts.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 sc-card sc-card-primary p-6 md:p-8">
            <RiShieldCheckLine className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
            <p className="text-lg leading-relaxed">{config.boundary}</p>
            <div className="mt-auto border-t border-[var(--sc-primary)] pt-4">
              <h4 className="font-bold">{config.sponsors.heading}</h4>
              <p className="text-sm text-[var(--sc-ink-2)] leading-relaxed">
                {config.sponsors.text}
              </p>
            </div>
          </div>
        </div>

        {/* 1.37.6 (Ray, 2026-10-16: "partners section has become partner
            button ... and then link a student with .../register it dont
            make sense", "i think one button is needed"): with the sponsor
            card drawn, its partner signup button is the section's only
            button. The old "Link a student" CTA went to the student
            signup (/register); a partner links a student with the pairing
            code inside the partner flow after signing up. A config with no
            `join` card keeps the CTA. */}
        {config.join ? (
          <LmsSponsorCard join={config.join} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href={signupUrl}
              className="sc-btn sc-btn-primary"
            >
              {config.cta.label}
            </Link>
            <p className="text-sm text-[var(--sc-ink-2)]">{config.cta.sub}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the page order
 * and its floating-nav entry, flagged NEW because partners are the newest
 * thing on the page. The flag is this section's to drop when it stops
 * being true - nothing else on the page knows about it.
 */
export const meta: PageSectionMeta = {
  order: 50,
  nav: [{ id: "partners", label: "Partners", badge: "new" }],
};

export default function LmsPartnersPageSection({
  id,
  signupUrl,
}: PageSectionProps) {
  return <LmsPartnersSection id={id} signupUrl={signupUrl} />;
}
