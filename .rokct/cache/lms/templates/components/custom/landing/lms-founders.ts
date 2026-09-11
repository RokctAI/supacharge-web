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


// The founders, as lms/dart's seeded tutor catalogue carries them
// (lib/src/common/infrastructure/repositories/seeded_tutor_catalog.dart,
// the `founder_ray_thompson` TutorProfile): every string here is that
// file's, copied - the name, the title line (the platform motto, the way
// tutor cards carry a motto), the subject, the bio grounded in the
// founder note, and the self-intro video ref the "Hear more" button
// plays. Nothing is authored here; the test beside this SDK reads the
// Dart source and holds the two equal. The portrait comes from the
// generated team-assets.ts (`founders/Ray_Thompson`, the same persona
// folder the Dart half vendors into assets/team/founders), so the card
// draws the 3:4 render once it ships and initials until then, exactly as
// the Flutter card does; the video is served only once the sync ships it
// into public/team/ ([founderIntroVideo]).
//
// The cards render on corporate_sdk's /about through base_sdk 1.38.0's
// page slot (components/custom/lms-founder-section.tsx, `page: "about"`),
// never on the landing.

import { teamAssetsFor } from "@/components/custom/landing/team-assets";

/** One founder, in the shape lms-tutor-card.tsx draws (a persona with a title line). */
export interface Founder {
  /** The Dart catalogue's id, kept so the two halves name the same person. */
  id: string;
  name: string;
  /** The card's title line, before the subject: "To the next level · Supacharge". */
  title: string;
  subject: string;
  bio: string;
  /** The persona folder under lms/team (`founders/Ray_Thompson`): the key team-assets.ts resolves the portrait by. */
  slug: string;
  /** The self-intro video the "Hear more" button plays, as the shell serves it, once the sync ships it. */
  introVideo: string;
}

export const LMS_FOUNDERS: readonly Founder[] = [
  {
    id: "founder_ray_thompson",
    name: "Ray Thompson",
    title: "To the next level",
    subject: "Supacharge",
    bio:
      "Ray built Supacharge for the student he was: strong marks across the board, one subject that would not click, and no tutor, no extra classes, no one at home to ask. Access, not capability, is the gap this platform exists to close.",
    slug: "founders/Ray_Thompson",
    introVideo: "/team/founders/Ray_Thompson/appearance/intro.mp4",
  },
];

/**
 * The founder's intro video when the generated team-assets.ts lists it
 * (the sync ships `intro.mp4` beside the renders once it exists in
 * lms/team), else undefined - and the card's "Hear more" stays disabled,
 * never hidden, as the Flutter card keeps it until a player is wired.
 */
export function founderIntroVideo(founder: Founder): string | undefined {
  return teamAssetsFor(founder.slug).includes(founder.introVideo) ? founder.introVideo : undefined;
}
