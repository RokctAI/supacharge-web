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

// The flip: the web counterpart of lms/dart's CardDeck flip (an animated
// rotateY with the back counter-rotated so it reads the right way round;
// 420 ms there, the same here). One primitive for the tutor and plan cards
// so both turn identically.
//
//   * Click (or Enter / Space on the focused card) turns it over; the
//     whole card is the target, as the Dart front and back both are.
//     Buttons and links inside stop the event so they act on their own.
//   * On a device with a fine pointer that can hover (a mouse, a trackpad)
//     hovering also turns it, and leaving turns it back - unless a click
//     pinned it, so a reader can keep the back open. Touch devices only
//     get the tap.
//   * prefers-reduced-motion: no rotation at all; the faces crossfade.
//
// The hidden face is `inert` (and aria-hidden) so its links and buttons
// drop out of the tab order and the accessibility tree until it shows.

import React, {
  useCallback,
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Stops a click inside a face's own control from also flipping the card. */
export const stopFlip = (event: React.SyntheticEvent) => event.stopPropagation();

export interface LmsFlipCardProps {
  front: ReactNode;
  back: ReactNode;
  /** Accessible name of the flip control while the front shows. */
  flipLabel: string;
  /** Accessible name while the back shows. */
  flipBackLabel: string;
  /** Height and radius come from the caller so tutor and plan decks can differ. */
  className?: string;
  /** Extra classes on the flipping surface (a highlight ring, say). */
  surfaceClassName?: string;
  /** Controlled: the card's flipped state, when the caller wants to own it. */
  flipped?: boolean;
  onFlippedChange?: (flipped: boolean) => void;
  /** Test/automation hook: the wrapper's data attribute. */
  "data-card"?: string;
}

export function LmsFlipCard({
  front,
  back,
  flipLabel,
  flipBackLabel,
  className = "",
  surfaceClassName = "",
  flipped: controlled,
  onFlippedChange,
  "data-card": dataCard,
}: LmsFlipCardProps) {
  const [internal, setInternal] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const id = useId();

  const isControlled = controlled !== undefined;
  const flipped = isControlled ? controlled : internal || (canHover && hovered);

  const set = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onFlippedChange?.(next);
    },
    [isControlled, onFlippedChange],
  );

  const toggle = () => {
    const next = !flipped;
    set(next);
    // A click is a deliberate choice, so it outlives the hover.
    setPinned(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    } else if (event.key === "Escape" && flipped) {
      set(false);
      setPinned(false);
    }
  };

  const onMouseLeave = () => {
    setHovered(false);
    if (!pinned && !isControlled) setInternal(false);
  };

  const duration = "420ms";
  const surface: CSSProperties = reducedMotion
    ? {}
    : {
        transformStyle: "preserve-3d",
        transition: `transform ${duration} cubic-bezier(0.4, 0, 0.2, 1)`,
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      };
  const face = (isBack: boolean): CSSProperties =>
    reducedMotion
      ? {
          transition: `opacity ${duration} ease`,
          opacity: (isBack ? flipped : !flipped) ? 1 : 0,
        }
      : {
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
        };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={flipped ? flipBackLabel : flipLabel}
      aria-describedby={`${id}-face`}
      data-card={dataCard}
      data-flipped={flipped ? "true" : "false"}
      onClick={toggle}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      className={`group relative cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sc-surface)] ${className}`}
      style={reducedMotion ? undefined : { perspective: "1400px" }}
    >
      <div
        className={`relative size-full ${surfaceClassName}`}
        style={surface}
      >
        <div
          id={`${id}-face`}
          className="absolute inset-0"
          style={face(false)}
          aria-hidden={flipped}
          inert={flipped}
        >
          {front}
        </div>
        <div
          className="absolute inset-0"
          style={face(true)}
          aria-hidden={!flipped}
          inert={!flipped}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

export default LmsFlipCard;
