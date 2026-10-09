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

// The client half of lms-team-section.tsx: the Supacharge team as the
// landing draws it, and nothing new. The tutors and the session hosts are
// the landing's own tutors section (lms-tutors-section.client.tsx: the
// same copy, grade tabs, flip cards, deck and marquee, off
// LMS_LANDING_CONFIG.tutors and the renders in team-assets.ts), and the
// founder is the founder card the About page draws (LMS_FOUNDERS through
// landing/lms-tutor-card.tsx, role "founder", "Hear more" wired only when
// the intro video ships). Every name and line is the landing's or the
// founder catalogue's; the only words here are TEAM_COPY's labels.
//
// 1.36.9 (Ray, 2026-10-03: "Team [45]"): the wrapper states how many
// cards it draws - every tutor card, every host/assistant card, every
// founder card, off the same data the sections map - as data-team-count;
// corporate_sdk 1.3.0's /team title sums it into the badge beside "Team".
//
// The page sits in the landing's token scope (LMS_ROOT_CLASS on the
// wrapper, lms-theme.css imported), as the About page does.

import React, { useState } from "react";

import "@/components/custom/landing/lms-theme.css";

import {
  LMS_SHOWN_FOUNDERS,
  founderIntroVideo,
  type Founder,
} from "@/components/custom/landing/lms-founders";
import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";
import { LmsTutorCard } from "@/components/custom/landing/lms-tutor-card";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";
import { LmsTutorsSection } from "@/components/custom/lms-tutors-section.client";

const CONTAINER = "container mx-auto px-4 xl:px-0 max-w-6xl";
const TEAM_COPY = {
  founder: { eyebrow: "Founder" },
} as const;

/**
 * The cards this page draws: LmsTutorsSection's tutors and assistants
 * (nothing when it has no tutors - it returns null) plus the founders.
 */
export function teamCardCount(founders: readonly Founder[] = LMS_SHOWN_FOUNDERS): number {
  const config = LMS_LANDING_CONFIG.tutors;
  const roster = config && config.tutors.length > 0
    ? config.tutors.length + config.assistants.length
    : 0;
  return roster + founders.length;
}

export function LmsTeamSection({
  id,
  signupUrl = "/register",
  founders = LMS_SHOWN_FOUNDERS,
}: {
  id?: string;
  signupUrl?: string;
  founders?: readonly Founder[];
}) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <section id={id} className={`${LMS_ROOT_CLASS} w-full`} data-lms-team=""
      data-team-count={teamCardCount(founders)}
    >
      <LmsTutorsSection id="tutors" signupUrl={signupUrl} />

      {founders.length > 0 && (
        <div className={`${CONTAINER} py-16 md:py-24 flex flex-col items-center gap-8`} data-lms-team-founders="">
          <p className="sc-eyebrow">{TEAM_COPY.founder.eyebrow}</p>
          <div className="flex w-full flex-wrap justify-center gap-6">
            {founders.map((founder) => {
              const video = founderIntroVideo(founder);
              return (
                <div key={founder.id} className="w-full max-w-[16rem] basis-[16rem]">
                  <LmsTutorCard
                    persona={founder}
                    role="founder"
                    founderCount={founders.length}
                    signupUrl={signupUrl}
                    className="w-full"
                    onHearMore={video ? () => setPlaying(founder.id) : undefined}
                    introVideo={
                      video && playing === founder.id
                        ? { src: video, onEnded: () => setPlaying(null) }
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default LmsTeamSection;
