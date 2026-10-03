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
import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";
import { LmsTutorCard } from "@/components/custom/landing/lms-tutor-card";
import { RiDoubleQuotesL, RiUserStarLine } from "@remixicon/react";

// The landing's section container and heading copy (1.36.7; Ray,
// 2026-10-03: the about page read "like a junior designer did it"): the
// founder sits under the landing's eyebrow / h2 / blurb header, in the
// landing's max-w-6xl container, with the bio in a landing sc-card beside
// the flip card instead of a lone card pinned to the left.
const CONTAINER = "container mx-auto px-4 xl:px-0 max-w-6xl";
const ABOUT_COPY = {
  eyebrow: "About Supacharge",
  heading: "Access, not capability.",
  blurb: "Supacharge exists for the student with the marks and the drive, and no one to ask.",
  roleLine: "Founder",
} as const;

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
  if (founders.length === 0) return null;

  return (
    <section
      id={id}
      className={`${LMS_ROOT_CLASS} w-full py-4 md:py-12`}
      data-lms-founders=""
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

      <div className={`${CONTAINER} mt-12 flex flex-col gap-12`}>
        {founders.map((founder) => {
          const video = founderIntroVideo(founder);
          return (
            <div
              key={founder.id}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-12"
            >
              <LmsTutorCard
                persona={founder}
                role="founder"
                founderCount={founders.length}
                signupUrl={signupUrl}
                priority
                className="mx-auto w-full max-w-sm"
                onHearMore={video ? () => setPlaying(founder.id) : undefined}
                introVideo={
                  video && playing === founder.id
                    ? { src: video, onEnded: () => setPlaying(null) }
                    : undefined
                }
              />
              <article className="sc-card flex flex-col gap-5 p-6 md:p-10 text-left">
                <RiDoubleQuotesL className="size-8 text-[var(--sc-primary)]" aria-hidden="true" />
                <p className="text-lg md:text-xl font-medium leading-relaxed text-[var(--sc-ink)]">
                  {founder.bio}
                </p>
                <div className="mt-2 flex items-center gap-3 border-t border-[var(--sc-stroke-subtle)] pt-5">
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
    </section>
  );
}

export default LmsFounderSection;
