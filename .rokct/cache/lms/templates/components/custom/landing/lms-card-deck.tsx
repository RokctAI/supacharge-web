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

// The deck: lms/dart's CardDeck (presentation/widgets/card_deck.dart) as
// the web reads it - ONE row of cards you swipe, rather than a grid that
// wraps (Ray, 2026-09-08: "the tutor cards can still be a deck that take
// one row and can be swipped like in dart").
//
// What the Flutter deck does, kept here:
//
//   * one card at a time on a phone with the NEXT one's edge showing, so
//     "there is more to swipe to" reads without being told - the deck
//     fans its second card 13 px out from under the live one, and the
//     approved mockup (lms/docs/ui-reference/subscription_cards.html) asks
//     for the same thing in as many words: "the next card's edge stays
//     slightly visible at the screen edge... a narrow sliver, not a
//     full-width copy". Every breakpoint here leaves that sliver;
//   * a swipe moves the deck on by exactly ONE card and is reversible
//     (CardDeck's onNext/onPrevious past a 30%-of-width threshold; here
//     scroll snapping with `scroll-snap-stop: always`, so a fling cannot
//     skip a card either);
//   * PageDots under the row (presentation/widgets/page_dots.dart): the
//     card you are on is a stretched pill, the rest are dots, 250 ms
//     between states - the same "where am I" signal onboarding, tutor
//     discovery and the plans sheet all use;
//   * the hint that follows the deal: the deck nudges itself aside and
//     settles back the first time it is seen, "showing it's swipeable
//     without the student having to guess" (CardDeck's _hint - the same
//     46 px over 420 ms). Skipped for a reader who asked for reduced
//     motion, or who has already scrolled it.
//
// Web rather than Flutter: the row is a scroll-snap container, so touch,
// trackpad and a two-finger swipe are the browser's own scrolling instead
// of a re-implemented drag; a mouse can drag the row, and a press that
// turned into a drag is swallowed so dragging never flips a card; the
// arrows and the Arrow / Home / End keys move it a card at a time on a
// desktop; the scrollbar is hidden (.sc-deck in landing/lms-theme.css).
// The deck does NOT wrap the way the Flutter one does: a scrolled row has
// real ends, so the arrows disable there rather than pretending otherwise.
//
// Cards arrive as children. The deck owns the ROW and never the card, so
// the flip (landing/lms-flip-card.tsx) keeps working untouched inside it.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/** The deck's words. They live with the section's copy, never in here. */
export interface DeckLabels {
  /** Accessible name of the row itself. */
  label: string;
  /** Accessible name of the back control. */
  previous: string;
  /** Accessible name of the forward control. */
  next: string;
  /** Caption under the row, as the app's mockup prints one under its deck. Empty prints none. */
  hint: string;
}

export interface LmsCardDeckProps {
  /** One card per child, in deck order. */
  children: ReactNode;
  labels: DeckLabels;
  /**
   * Extra classes on the row. `.sc-deck` already holds one card on a phone
   * and grows to four across on a wide screen, always leaving the next
   * card's edge in view; `sc-deck-trio` is the three-card variant. The
   * widths live in the stylesheet beside the gap they are measured
   * against, never as utilities here.
   */
  deckClassName?: string;
  className?: string;
}

/** CardDeck's swipe hint: 46 px aside, 420 ms, then back. */
const HINT_OFFSET = 46;
const HINT_MS = 420;
/** The deck holds a beat before hinting, the way the Flutter deal does. */
const HINT_DELAY_MS = 900;
/** A press that travels further than this is a drag, not a click. */
const DRAG_SLOP = 6;

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={back ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function LmsCardDeck({
  children,
  labels,
  deckClassName = "",
  className = "",
}: LmsCardDeckProps) {
  const cards = React.Children.toArray(children);
  const scroller = useRef<HTMLUListElement>(null);
  /** Set while a mouse drag is being turned into a click, so the click can be swallowed. */
  const dragged = useRef(false);
  const [index, setIndex] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** Where the deck is: which card leads the row, and whether it has ends left. */
  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
    const edge = el.getBoundingClientRect().left;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    Array.from(el.children).forEach((child, i) => {
      const distance = Math.abs((child as HTMLElement).getBoundingClientRect().left - edge);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setIndex(nearest);
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, cards.length]);

  /** One card along, the deck's own unit of movement. */
  const step = useCallback(
    (direction: -1 | 1) => {
      const el = scroller.current;
      if (!el) return;
      const items = Array.from(el.children) as HTMLElement[];
      const target = items[Math.min(Math.max(index + direction, 0), items.length - 1)];
      if (!target) return;
      el.scrollBy({
        left: target.getBoundingClientRect().left - el.getBoundingClientRect().left,
        behavior: "smooth",
      });
    },
    [index],
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const el = scroller.current;
    if (!el) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (event.key === "End") {
      event.preventDefault();
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  };

  /**
   * Mouse drag, the desktop stand-in for the Flutter deck's pan: touch and
   * trackpad already scroll this row natively, a mouse has nothing to throw
   * it with. Dropping the `is-dragging` class hands snapping back, which
   * lands the deck on a card exactly as letting go of a swipe does.
   */
  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scroller.current;
    if (!el) return;
    dragged.current = false;
    const startX = event.clientX;
    const startLeft = el.scrollLeft;
    let moving = false;
    const onMove = (move: PointerEvent) => {
      const dx = move.clientX - startX;
      if (!moving) {
        if (Math.abs(dx) < DRAG_SLOP) return;
        moving = true;
        dragged.current = true;
        el.classList.add("is-dragging");
      }
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.classList.remove("is-dragging");
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  /** A press that turned into a drag must not also flip the card under it. */
  const onClickCapture = (event: ReactMouseEvent<HTMLUListElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  // The hint, once, the first time the deck is on screen.
  useEffect(() => {
    const el = scroller.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let nudge: ReturnType<typeof setTimeout> | undefined;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        nudge = setTimeout(() => {
          const node = scroller.current;
          if (!node) return;
          // Already swiped, or nothing to swipe to: the hint has no work.
          if (node.scrollLeft > 1) return;
          if (node.scrollWidth - node.clientWidth < HINT_OFFSET) return;
          node.scrollTo({ left: HINT_OFFSET, behavior: "smooth" });
          settle = setTimeout(
            () => scroller.current?.scrollTo({ left: 0, behavior: "smooth" }),
            HINT_MS,
          );
        }, HINT_DELAY_MS);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (nudge) clearTimeout(nudge);
      if (settle) clearTimeout(settle);
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <div className={`sc-deck-wrap ${className}`}>
      <ul
        ref={scroller}
        tabIndex={0}
        aria-label={labels.label}
        className={`sc-deck ${deckClassName}`}
        onScroll={measure}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        {cards.map((card, i) => (
          <li key={i}>{card}</li>
        ))}
      </ul>

      {scrollable && (
        <div className="sc-deck-controls">
          <button
            type="button"
            aria-label={labels.previous}
            disabled={atStart}
            onClick={() => step(-1)}
            className="sc-deck-arrow"
          >
            <Arrow back />
          </button>

          {/* PageDots: the card you are on is a stretched pill, the rest dots. */}
          <span aria-hidden="true" className="sc-deck-dots">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`sc-deck-dot${i === index ? " is-current" : ""}`}
              />
            ))}
          </span>

          <button
            type="button"
            aria-label={labels.next}
            disabled={atEnd}
            onClick={() => step(1)}
            className="sc-deck-arrow"
          >
            <Arrow />
          </button>
        </div>
      )}

      {scrollable && labels.hint && <p className="sc-deck-hint">{labels.hint}</p>}
    </div>
  );
}

export default LmsCardDeck;
