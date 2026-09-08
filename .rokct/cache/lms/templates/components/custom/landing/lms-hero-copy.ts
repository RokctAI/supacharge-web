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

// Draft copy pending Ray's approval.
//
// Supacharge's hero copy, registered into base_sdk's
// components/custom/landing/hero-copy.ts registry: the hero lays these
// fields over its HERO_CONFIG defaults (rokctapp's words). An omitted field
// keeps the default; an empty list hides the trust line or the store
// badges; an empty background string hides the background. No statistic
// appears here because no source carries one - see LMS_LANDING_PLACEHOLDERS
// in ./lms-landing-config.ts for the facts still owed.

import type { HeroCopy } from "@/components/custom/landing/hero-copy";

const LMS_HERO_COPY: HeroCopy = {
  // The frame renders "<text> <verb> <suffix>"; the suffix carries the
  // connective, so each word's verb is empty.
  headlineWords: [
    { text: "Learn faster", verb: "" },
    { text: "Pass with confidence", verb: "" },
    { text: "Find your tutor", verb: "" },
  ],
  headlineSuffix: "with Supacharge",
  // No input on this hero (lms-hero-form.tsx), so nothing to type into it.
  placeholders: [],
  backgroundImage: "",
  // Rendered by lms-hero-form.tsx under its calls to action.
  trustLine: ["Trusted by learners across South Africa"],
  // Supacharge's store link is the hero body's primary call to action.
  badges: [],
};

export default LMS_HERO_COPY;
