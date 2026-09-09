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

// The marquee for cards that arrive as children: the auto-scrolling row
// the testimonials run (base_sdk >= 1.14.0's components/custom/landing/
// testimonials-marquee.tsx over app/styles/rokct-marquee.css), so the
// tutor cards can keep scrolling the same way (Ray, 2026-09-09: "tutor
// cards should keep scrolling like testamonials").
//
// Why a second wrapper rather than base's: TestimonialsMarquee draws its
// own quote card from an `items` list and has no slot for a card that is
// already a component - the tutor card flips, carries a portrait and a
// sign-up link, and is lms-tutor-card.tsx's to draw. This file is the same
// row with the card left to the caller: the same DOM (the clipping frame,
// the two edge fades, the `w-max` track), the same classes on the track -
// `rokct-marquee` for the keyframes, `rokct-marquee-track` for the
// reduced-motion rule, `group-hover:[animation-play-state:paused]` so the
// row stops under the pointer - and base's stylesheet imported by the same
// path base's component imports it, so the motion, the pause and the
// reduced-motion stillness are one rule set in one file, base's. Nothing
// here is copied from that stylesheet. The testimonials section keeps
// rendering base's component; this one is not a replacement for it.
//
// Same pace, not the same duration: `--rokct-marquee-duration` is per
// loop, and a loop of twelve tutor cards is nearly twice the length of one
// of five quotes, so at 60s the tutors would go by twice as fast. The
// track is measured and the duration set so the row travels at the
// testimonials' own speed - five 350px cards and their 20px gaps over 60s,
// 1850px a minute - whatever it holds.
//
// The cards repeat three times so the loop never shows a gap: the
// keyframes travel one third of the track, and each copy carries the
// row's gap as its own trailing padding, so one third is exactly one
// copy. The copies after the first are aria-hidden - a reader hears each
// tutor once - and stay clickable, because the row is seamless and the
// card under the pointer is a copy two thirds of the time.
//
// Fewer cards than the frame is wide (a short roster, or a wide screen
// over three assistants) is not a marquee: the row is then ONE copy,
// centred and still, with no fades and no animation, and it becomes a
// marquee again the moment the frame gets narrower than its cards. The
// first render assumes it overflows - a full roster does at every width
// this row runs at - so the server sends the moving row and the client
// only ever stands it still, never leaves it blank.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import "@/app/styles/rokct-marquee.css";

export interface LmsMarqueeProps {
  /** One card per child, in row order. */
  children: ReactNode;
  /** Accessible name of the row. */
  label: string;
  /**
   * Classes on each card's slot - the fixed width the track needs of a
   * card, which lives in the stylesheet beside the deck's widths
   * (`sc-marquee-slot` in landing/lms-theme.css).
   */
  itemClassName?: string;
  /**
   * The gradient start of the two edge fades - the part that must match
   * the ground the row sits on. The section ground by default.
   */
  fadeClassName?: string;
  /** Extra classes on the outer frame. */
  className?: string;
}

/** Three copies: the keyframes travel one third of the track. */
const COPIES = 3;

/**
 * The testimonials' pace, pixels per second: their five 350px cards and
 * four 20px gaps plus the loop's own gap, 1850px, over base's default 60s.
 */
const PIXELS_PER_SECOND = 1850 / 60;

export function LmsMarquee({
  children,
  label,
  itemClassName = "",
  fadeClassName = "from-[var(--sc-card-alt)]",
  className = "",
}: LmsMarqueeProps) {
  const cards = React.Children.toArray(children);
  const frame = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLUListElement>(null);
  const [overflows, setOverflows] = useState(true);
  const [copyWidth, setCopyWidth] = useState(0);

  /** Whether one copy of the cards is wider than the frame, and how wide it is. */
  const measure = useCallback(() => {
    const frameEl = frame.current;
    const copyEl = first.current;
    if (!frameEl || !copyEl) return;
    const width = copyEl.scrollWidth;
    setCopyWidth(width);
    setOverflows(width > frameEl.clientWidth);
  }, []);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (frame.current) observer.observe(frame.current);
    if (first.current) observer.observe(first.current);
    return () => observer.disconnect();
  }, [measure, cards.length]);

  if (cards.length === 0) return null;

  const copies = overflows ? COPIES : 1;
  const style = (
    overflows && copyWidth > 0
      ? { "--rokct-marquee-duration": `${(copyWidth / PIXELS_PER_SECOND).toFixed(2)}s` }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <div
      ref={frame}
      className={`relative flex w-full overflow-hidden py-4 group ${className}`}
    >
      {overflows && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-[15%] bg-gradient-to-r to-transparent z-20 ${fadeClassName}`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-[15%] bg-gradient-to-l to-transparent z-20 ${fadeClassName}`}
          />
        </>
      )}

      <div
        style={style}
        className={
          overflows
            ? "flex w-max rokct-marquee rokct-marquee-track py-1 items-center group-hover:[animation-play-state:paused]"
            : "flex w-full justify-center py-1 items-center"
        }
      >
        {Array.from({ length: copies }, (_, copy) => (
          <ul
            key={copy}
            ref={copy === 0 ? first : undefined}
            aria-label={copy === 0 ? label : undefined}
            aria-hidden={copy > 0 || undefined}
            className={`flex shrink-0 items-center gap-5 ${overflows ? "pr-5" : ""}`}
          >
            {cards.map((card, i) => (
              <li key={i} className={itemClassName}>
                {card}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default LmsMarquee;
