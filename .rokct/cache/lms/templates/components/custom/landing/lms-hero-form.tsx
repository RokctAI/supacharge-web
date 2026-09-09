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

// Supacharge's hero body, injected into base_sdk's landing hero through
// components/custom/landing/hero-form.ts. Ray, 2026-09-08: the base hero is
// a frame; the home SDK injects the body the way it injects the page
// sections; the chat box belongs to agent_sdk. Supacharge's hero has no chat
// or search input, and since 1.15.0 it draws no button of its own either:
// the downloads are the frame's store badges, registered through
// ./lms-hero-copy.ts, and the trust line is the frame's, over them - the
// way rokct.ai's hero draws both (Ray, 2026-09-09, on a custom button drawn
// in the badge's shape: "cant say this, look at the rokctai hero how it say
// it"). This module stays registered as the seam for a body of Supacharge's
// own; until there is one the slot renders nothing, exactly as the frame
// renders it with no form registered.

import type { HeroFormProps } from "@/components/custom/landing/hero-form";

export default function LmsHeroForm(_props: HeroFormProps) {
  return null;
}
