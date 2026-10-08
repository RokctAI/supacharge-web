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

// The client half of lms-founder-section.tsx: the founders as the app's
// flip card (landing/lms-tutor-card.tsx, role "founder" - portrait front
// with the Founder badge, bio and "Hear more" back, no Start button) and
// the one thing that needs the client: which founder's self-intro video
// is playing. The host wires "Hear more" the way the Flutter discovery
// page wires `onHearMore`: only when the asset ships (founderIntroVideo,
// read off the generated team-assets.ts) - until then the button is
// disabled, never hidden. The video plays IN the card, in place of the
// text, and its end (or the card's flip back) hands the text back.
//
// The cards sit in their own token scope: the same class the landing
// root carries (LMS_ROOT_CLASS - the --sc-* tokens and the two font
// variables), on a wrapper here, so the card on /about is the card on the
// landing, and lms-theme.css is imported so the scope has its rules.

import React, { useState } from "react";

import "@/components/custom/landing/lms-theme.css";

import {
  LMS_FOUNDERS,
  founderIntroVideo,
  type Founder,
} from "@/components/custom/landing/lms-founders";
import { LMS_COPYRIGHT_HOLDER } from "@/components/custom/landing/lms-footer-chrome";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import { LMS_MILESTONE } from "@/components/custom/landing/lms-milestone";
import LMS_SITE_METADATA from "@/components/custom/landing/lms-site-metadata";
import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";
import { LmsTutorCard } from "@/components/custom/landing/lms-tutor-card";
import {
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiBuilding2Line,
  RiDoorClosedLine,
  RiDoubleQuotesL,
  RiGroupLine,
  RiRocket2Line,
  RiUserHeartLine,
  RiUserStarLine,
  RiVoiceprintLine,
} from "@remixicon/react";

// 1.36.8 (Ray, 2026-10-03: "about is not about the founder. i wanted a
// founder to be there but the page is about the platform or the company
// behind"): the page is about Supacharge and ROKCT Intelligence, in the
// landing's container and section header style (1.36.7), with the founder
// as one compact section lower down. Every claim is read off the landing
// config, the site metadata or the footer - the phases and their "soon"
// badges, the session facts, the partners' boundary, the copyright holder
// - so the about page can never say more than the landing does. The only
// words written here are ABOUT_COPY's labels and the company line.
const CONTAINER = "container mx-auto px-4 xl:px-0 max-w-6xl";
const H2 =
  "text-[28px] md:text-[40px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance";
const BLURB = "text-lg font-medium text-[var(--sc-ink-2)] max-w-2xl";
const ABOUT_COPY = {
  eyebrow: "About Supacharge",
  heading: "Access, not capability.",
  blurb: "Supacharge exists for the student with the marks and the drive, and no one to ask.",
  platform: { eyebrow: "The platform", heading: "Live tutoring that fits around school." },
  how: { eyebrow: "How it works" },
  company: {
    eyebrow: "The company",
    text: "Supacharge is built by ROKCT Intelligence (Pty) Ltd, the company behind the app, the lessons and this site.",
    teamLabel: "Meet the team",
    teamHref: "/team",
  },
  founder: { eyebrow: "Founder" },
  roleLine: "Founder",
} as const;

const { sessions, subjects, tutors, partners } = LMS_LANDING_CONFIG;
const fact = (title: string) => sessions?.facts.find((f) => f.title === title);

/** The "how it works" row: four landing claims, each with its own landing words. */
const HOW_CARDS = [
  { icon: RiGroupLine, title: tutors?.heading, text: tutors?.blurb },
  { icon: RiDoorClosedLine, ...fact("Doors open, doors close") },
  { icon: RiVoiceprintLine, ...fact("Audio and whiteboard, not video") },
  { icon: RiUserHeartLine, title: partners?.heading, text: partners?.boundary },
].filter((card): card is { icon: typeof RiGroupLine; title: string; text: string } =>
  Boolean(card.title && card.text),
);

function SectionHeader({ eyebrow, heading, blurb }: { eyebrow: string; heading?: string; blurb?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="sc-eyebrow">{eyebrow}</p>
      {heading && <h2 className={H2}>{heading}</h2>}
      {blurb && <p className={BLURB}>{blurb}</p>}
    </div>
  );
}

export function LmsFounderSection({
  id,
  signupUrl = "/register",
  founders = LMS_FOUNDERS,
}: {
  id?: string;
  signupUrl?: string;
  founders?: readonly Founder[];
}) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section
      id={id}
      className={`${LMS_ROOT_CLASS} w-full py-4 md:py-12`}
      data-lms-about=""
    >
      <div className={`${CONTAINER} flex flex-col items-center gap-5 text-center`}>
        <p className="sc-eyebrow">{ABOUT_COPY.eyebrow}</p>
        <h1 className="text-[32px] md:text-[48px] font-extrabold leading-[1.1] tracking-tight text-[var(--sc-ink)] text-balance">
          {ABOUT_COPY.heading}
        </h1>
        <p className="text-lg md:text-xl font-medium text-[var(--sc-ink-2)] max-w-2xl">
          {ABOUT_COPY.blurb}
        </p>
      </div>

      {/* What Supacharge is: the site's own description, the curriculum line and the phases as the landing tabs them. */}
      {subjects && (
      <div className={`${CONTAINER} mt-16 md:mt-24 flex flex-col gap-8`} data-about="platform">
        <SectionHeader
          eyebrow={ABOUT_COPY.platform.eyebrow}
          heading={ABOUT_COPY.platform.heading}
          blurb={LMS_SITE_METADATA.description}
        />
        <p className="mx-auto max-w-2xl text-center text-[var(--sc-ink-2)]">{subjects.blurb}</p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.phases.map((phase) => (
            <li key={phase.name} className="sc-card flex flex-col gap-2 p-5 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--sc-ink)]">{phase.name}</span>
                {phase.badge && <span className="sc-badge-primary">{phase.badge}</span>}
              </div>
              <span className="text-sm font-semibold text-[var(--sc-primary)]">
                {phase.grades}
                {phase.pending && (
                  <span className="ml-2 text-[var(--sc-ink-3)]">
                    {phase.pending.grades} {phase.pending.badge}
                  </span>
                )}
              </span>
              <span className="text-sm text-[var(--sc-ink-2)]">
                {phase.subjects.map((s) => s.name).filter((n, i, all) => all.indexOf(n) === i).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
      )}

      {/* How it works: one lesson, two styles - and the four things that make it different. */}
      {sessions && (
      <div className={`${CONTAINER} mt-16 md:mt-24 flex flex-col gap-8`} data-about="how">
        <SectionHeader eyebrow={ABOUT_COPY.how.eyebrow} heading={sessions.heading} blurb={sessions.blurb} />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_CARDS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="sc-card flex flex-col gap-3 p-5 text-left">
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--sc-primary-tint)]">
                <Icon className="size-5 text-[var(--sc-primary)]" aria-hidden="true" />
              </span>
              <span className="font-bold text-[var(--sc-ink)]">{title}</span>
              <span className="text-sm text-[var(--sc-ink-2)]">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      )}

      {/* The company: the footer's copyright holder, and the team page. */}
      <div className={`${CONTAINER} mt-16 md:mt-24`} data-about="company">
        <article className="sc-card mx-auto flex max-w-3xl flex-col items-center gap-4 p-6 md:p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--sc-primary-tint)]">
            <RiBuilding2Line className="size-6 text-[var(--sc-primary)]" aria-hidden="true" />
          </span>
          <p className="sc-eyebrow">{ABOUT_COPY.company.eyebrow}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--sc-ink)]">{LMS_COPYRIGHT_HOLDER}</h2>
          <p className={BLURB}>{ABOUT_COPY.company.text}</p>
          <a href={ABOUT_COPY.company.teamHref} className="sc-btn sc-btn-outline inline-flex items-center gap-2">
            {ABOUT_COPY.company.teamLabel}
            <RiArrowRightLine className="size-4" aria-hidden="true" />
          </a>
        </article>
      </div>

      {/* Programmes (1.36.16): the programmes Supacharge has been selected
          for, as one quiet strip - a badge and the announcement link, no
          programme logo, never in a "trusted by" row. Copy:
          landing/lms-milestone.ts. */}
      <div className={`${CONTAINER} mt-10 md:mt-12`} data-about="programmes">
        <div className="sc-card mx-auto flex max-w-3xl flex-col items-center gap-3 px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <p className="sc-eyebrow">{LMS_MILESTONE.about.eyebrow}</p>
            <span className="sc-badge-primary inline-flex items-center gap-1.5">
              <RiRocket2Line className="size-4" aria-hidden="true" />
              {LMS_MILESTONE.about.badge}
            </span>
          </div>
          <a
            href={LMS_MILESTONE.announcement.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--sc-primary)] hover:underline"
          >
            {LMS_MILESTONE.announcement.label}
            <RiArrowRightUpLine className="size-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>

      {/* Founder: the 1.36.7 card and quote, compacted, as one section of the page. */}
      {founders.length > 0 && (
        <div className={`${CONTAINER} mt-16 md:mt-24 flex flex-col gap-8`} data-lms-founders="">
          <SectionHeader eyebrow={ABOUT_COPY.founder.eyebrow} />
          {founders.map((founder) => {
            const video = founderIntroVideo(founder);
            return (
              <div
                key={founder.id}
                className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8"
              >
                <LmsTutorCard
                  persona={founder}
                  role="founder"
                  founderCount={founders.length}
                  signupUrl={signupUrl}
                  className="mx-auto w-full max-w-[16rem]"
                  onHearMore={video ? () => setPlaying(founder.id) : undefined}
                  introVideo={
                    video && playing === founder.id
                      ? { src: video, onEnded: () => setPlaying(null) }
                      : undefined
                  }
                />
                <article className="sc-card flex flex-col gap-4 p-6 md:p-8 text-left">
                  <RiDoubleQuotesL className="size-7 text-[var(--sc-primary)]" aria-hidden="true" />
                  <p className="text-base md:text-lg font-medium leading-relaxed text-[var(--sc-ink)]">
                    {founder.bio}
                  </p>
                  <div className="flex items-center gap-3 border-t border-[var(--sc-stroke-subtle)] pt-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-[var(--sc-primary-tint)]">
                      <RiUserStarLine className="size-5 text-[var(--sc-primary)]" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--sc-ink)]">{founder.name}</span>
                      <span className="text-sm text-[var(--sc-ink-2)]">
                        {ABOUT_COPY.roleLine} · {founder.subject}
                      </span>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LmsFounderSection;
