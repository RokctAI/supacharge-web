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

// The tutor and plan cards' flip (lms/dart's CardDeck flip on the web).
// Since lms_sdk 1.41.0 the card itself is base_sdk's shared FlipCard
// (base_sdk >= 1.58.0, components/custom/flip-card.tsx), moved there from
// this file so every shell turns a card the same way (Ray, 2026-10-31).
// This module keeps the names the deck, the tutor and plan cards and the
// tutors section import, and dresses the shared card in Supacharge's focus
// ring; its behaviour (click, Enter / Space, hover on a fine pointer,
// Escape, the reduced-motion crossfade, the inert hidden face) is the
// shared card's, unchanged.

import React from "react";

import { FlipCard, stopFlip, useMediaQuery, type FlipCardProps } from "@/components/custom/flip-card";

export { stopFlip, useMediaQuery };

/** The Supacharge focus ring: the primary, offset from the app's surface. */
export const LMS_FLIP_RING =
  "focus-visible:ring-2 focus-visible:ring-[var(--sc-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sc-surface)]";

export type LmsFlipCardProps = Omit<FlipCardProps, "ringClassName">;

export function LmsFlipCard(props: LmsFlipCardProps) {
  return <FlipCard {...props} ringClassName={LMS_FLIP_RING} />;
}

export default LmsFlipCard;
