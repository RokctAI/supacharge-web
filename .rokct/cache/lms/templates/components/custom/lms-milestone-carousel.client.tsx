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

// The milestone band's slider (1.36.18; Ray, 2026-10-09: "that milestone
// section will auto scroll to left when more milestones are added").
//
// One slide is not a slider: it renders as is, still, with no controls.
// Two or more advance to the left on their own every few seconds, always
// leftward: a copy of the first slide sits after the last, and once the
// track has slid onto it the track jumps back to the real first slide
// with no transition, so the loop never runs backwards. The slider pauses
// under the pointer and while focus is inside it, never moves for a
// reader who asked for reduced motion, and the dots under it go straight
// to a slide. Slides off screen are aria-hidden and inert, so a reader
// and the keyboard only ever meet the one in view.

import React, { Children, useCallback, useEffect, useState, type ReactNode } from "react";

export interface LmsMilestoneCarouselProps {
  /** One slide per child, newest first. */
  children: ReactNode;
  /** Accessible name of the slider. */
  label: string;
  /** How long each slide stays before the next slides in. */
  intervalMs?: number;
}

const SLIDE_MS = 700;

export function LmsMilestoneCarousel({ children, label, intervalMs = 7000 }: LmsMilestoneCarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  // index runs 0..count; count is the copy of slide 0 after the last.
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const t = window.setInterval(() => {
      setAnimate(true);
      setIndex((i) => (i >= count ? 1 : i + 1));
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [count, paused, reduced, intervalMs]);

  // Landed on the copy of slide 0: jump back to the real one, unanimated.
  useEffect(() => {
    if (index !== count || count < 2) return;
    const t = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [index, count]);

  const goTo = useCallback((i: number) => {
    setAnimate(true);
    setIndex(i);
  }, []);

  if (count < 2) return <>{slides}</>;

  const shown = index % count;
  const track = [...slides, slides[0]];
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-milestone-carousel=""
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate && !reduced ? `transform ${SLIDE_MS}ms ease-in-out` : "none",
          }}
        >
          {track.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={i}
                className="w-full shrink-0"
                aria-roledescription="slide"
                aria-label={`${(i % count) + 1} of ${count}`}
                aria-hidden={active ? undefined : true}
                inert={!active}
              >
                {slide}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center gap-2 pb-8">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show milestone ${i + 1} of ${count}`}
            aria-current={i === shown ? "true" : undefined}
            className={`h-2.5 rounded-full bg-[#111111] transition-all ${i === shown ? "w-8" : "w-2.5 opacity-40"}`}
          />
        ))}
      </div>
    </div>
  );
}
