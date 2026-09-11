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
    <section id={id} className={`${LMS_ROOT_CLASS} w-full py-12`} data-lms-founders="">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 justify-items-center gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:px-0">
        {founders.map((founder) => {
          const video = founderIntroVideo(founder);
          return (
            <LmsTutorCard
              key={founder.id}
              persona={founder}
              role="founder"
              founderCount={founders.length}
              signupUrl={signupUrl}
              priority
              className="max-w-sm"
              onHearMore={video ? () => setPlaying(founder.id) : undefined}
              introVideo={
                video && playing === founder.id
                  ? { src: video, onEnded: () => setPlaying(null) }
                  : undefined
              }
            />
          );
        })}
      </div>
    </section>
  );
}

export default LmsFounderSection;
