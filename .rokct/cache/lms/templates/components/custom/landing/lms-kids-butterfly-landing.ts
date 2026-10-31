"use client";

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

// When the butterfly has landed on its rectangle, as the visitor sees it
// (1.39.0; Ray, 2026-10-31: "there is a butterfly in landing that lands on
// a button and rectangle, those need to be normal until it lands on them").
// 1.37.11 marked the rectangle on a fixed timer from mount, so every kids
// rectangle below the fold was already in kids mode, its butterfly unseen,
// by the time the visitor scrolled to it - and the timer ran about a second
// behind the animation, which starts at first paint, not at hydration. The
// mark now follows the animation itself: lms-kids-butterfly.tsx reads the
// visit's progress from the browser's own timeline every frame while the
// rectangle is on screen and feeds it here; the rectangle is marked only
// when the butterfly touches down (TOUCHDOWN of the visit) in a frame the
// visitor can see, after it was seen still in the air on that visit. A
// rectangle that scrolls into view while the butterfly is already resting
// waits for the next visit, so the change is never seen without the
// landing. Import-free, so the tests run it bare under node.

/** Where the visit (`sc-kids-butterfly-visit`, lms-theme.css) touches down: its 14% keyframe. */
export const TOUCHDOWN = 0.14;

/** Where it lifts off again: the 50% keyframe ends the rest. */
export const LIFTOFF = 0.5;

export interface LandingWatch {
  /** The butterfly was seen in the air, before touchdown, on this visit. */
  armed: boolean;
  /** The rectangle is marked; never undone. */
  landed: boolean;
}

export const LANDING_START: LandingWatch = { armed: false, landed: false };

/**
 * One frame: `visible` is whether the rectangle is on screen, `progress`
 * the visit's iteration progress (0 to 1), or null before the animation
 * runs. Off screen the watch disarms, so a landing the visitor missed
 * never counts.
 */
export function watchLanding(
  watch: LandingWatch,
  visible: boolean,
  progress: number | null,
): LandingWatch {
  if (watch.landed) return watch;
  if (!visible || progress === null || !Number.isFinite(progress)) {
    return LANDING_START;
  }
  if (progress < TOUCHDOWN) return { armed: true, landed: false };
  // Seen in the air and now resting: it landed in front of the visitor. A
  // jump straight past the rest (a frame skipped while the page was in the
  // background) is a landing nobody saw, so it waits for the next visit.
  if (watch.armed && progress < LIFTOFF) return { armed: false, landed: true };
  return LANDING_START;
}
