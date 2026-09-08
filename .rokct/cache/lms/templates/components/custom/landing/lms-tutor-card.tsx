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

// The tutor card, ported from lms/dart's TutorCard / TutorCardBack
// (pages/discovery/widgets/tutor_card.dart) for the landing page.
//
// FRONT: the persona's card_1080x1440 render full-bleed (BoxFit.cover
// there, object-cover here) under a bottom scrim; the WHO badge top-left
// (Tutor / Assistant) and the grade badge top-right; name, "title ·
// subject", three lines of bio, and the "Know <name>" button that only
// flips - it invites a read, not a commitment. No render (a persona whose
// portrait is not generated or synced yet) hands the card to large, quiet
// initials, exactly as the Flutter card does.
//
// BACK: name and "subject - Grade 10-12", the full bio, the Style / Rating
// facts (a rating only when a real number exists - never a fabricated
// one), and the commitment, "Start with <name>", which goes to sign-up.
// Assistants host rather than teach, so their back carries no Start
// button, as in the app.
//
// Portraits come from the generated team-assets.ts (lms/dart/tool/
// sync_team_assets.dart copies lms/team's renders into this SDK's
// templates/public/team/, installed at public/team/, so `/team/...`
// resolves on any composed shell). next/image is `unoptimized`: the shell's
// next.config carries no image config, and the renders are already the
// size the card draws.

import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  LMS_LANDING_CONFIG,
  type Assistant,
  type CardLabels,
  type Tutor,
} from "@/components/custom/landing/lms-landing-config";
import { LmsFlipCard, stopFlip } from "@/components/custom/landing/lms-flip-card";
import { teamImageFor } from "@/components/custom/landing/team-assets";

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/** "Grade 10-12" for a span, "Grade 12" for one, as the Flutter badge reads. */
function gradeLabel(labels: CardLabels, grades?: number[]): string | null {
  if (!grades || grades.length === 0) return null;
  const sorted = [...grades].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return first === last ? `${labels.grade} ${first}` : `${labels.grade} ${first}-${last}`;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-[var(--sc-primary)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
      {children}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-[13px]">
      <span className="w-20 shrink-0 text-[var(--sc-ink-2)]">{label}</span>
      <span className="text-[var(--sc-ink)]">{value}</span>
    </div>
  );
}

export interface LmsTutorCardProps {
  /** A tutor from LMS_LANDING_CONFIG.tutors.tutors, or an assistant (role "assistant"). */
  persona: Tutor | (Assistant & { title?: string; subject?: string; bio?: string });
  role?: "tutor" | "assistant";
  /** Where "Start with <name>" goes (the page's signupUrl). */
  signupUrl: string;
  /** Sets the eager/priority hint on the first row of portraits. */
  priority?: boolean;
  className?: string;
}

export function LmsTutorCard({
  persona,
  role = "tutor",
  signupUrl,
  priority = false,
  className = "",
}: LmsTutorCardProps) {
  const labels = LMS_LANDING_CONFIG.tutors?.cards;
  if (!labels) return null;

  const tutor = persona as Tutor;
  const name = persona.name;
  const image = persona.slug ? teamImageFor(persona.slug) : undefined;
  const subject = tutor.subject ?? (persona as Assistant).role;
  const title = tutor.title;
  const bio = tutor.bio ?? "";
  const isTutor = role === "tutor";
  const grade = gradeLabel(labels, tutor.grades);
  const rating = typeof tutor.rating === "number" ? tutor.rating : null;

  const front = (
    <div className="relative size-full overflow-hidden rounded-3xl border border-[var(--sc-stroke-subtle)] bg-gradient-to-br from-[var(--sc-card)] to-[var(--sc-surface)] shadow-lg">
      {image ? (
        <Image
          src={image}
          alt={`${name}, ${subject}`}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-white/20"
        >
          {initials(name)}
        </div>
      )}
      <div className="absolute left-3 top-3">
        <Badge>{isTutor ? labels.tutor : labels.assistant}</Badge>
      </div>
      {grade && (
        <div className="absolute right-3 top-3">
          <Badge>{grade}</Badge>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-16 text-left">
        <h3 className="text-xl font-semibold leading-tight text-white">{name}</h3>
        <p className="text-xs text-[var(--sc-primary)]">
          {title ? `${title} · ${subject}` : subject}
        </p>
        {bio && (
          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/90">{bio}</p>
        )}
        <span className="mt-4 block w-full rounded-xl bg-[var(--sc-primary)] py-2.5 text-center text-[13px] font-medium text-white">
          {labels.know} {name}
        </span>
      </div>
    </div>
  );

  const back = (
    <div className="flex size-full flex-col gap-4 overflow-hidden rounded-3xl border border-[var(--sc-stroke-subtle)] bg-[var(--sc-card)] p-5 text-left shadow-lg">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-medium text-[var(--sc-ink)]">{name}</h3>
          <p className="text-xs text-[var(--sc-ink-2)]">
            {grade ? `${subject} — ${grade}` : subject}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="rounded-full p-1 text-[var(--sc-ink-3)] group-hover:text-[var(--sc-ink)]"
          title={labels.flipBack}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 3v6h6" />
          </svg>
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {bio && (
          <p className="text-sm leading-relaxed text-[var(--sc-ink-2)]">{bio}</p>
        )}
        {isTutor && (
          <div className="flex flex-col gap-2">
            {tutor.style && <Fact label={labels.style} value={tutor.style} />}
            {rating !== null && <Fact label={labels.rating} value={`${rating.toFixed(1)} ★`} />}
          </div>
        )}
      </div>
      {isTutor && (
        <Link
          href={signupUrl}
          onClick={stopFlip}
          className="block w-full rounded-xl bg-[var(--sc-primary)] py-3 text-center text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          {labels.startWith} {name}
        </Link>
      )}
    </div>
  );

  return (
    <LmsFlipCard
      front={front}
      back={back}
      flipLabel={`${labels.flip}: ${name}`}
      flipBackLabel={`${labels.flipBack}: ${name}`}
      className={`aspect-[3/4] w-full rounded-3xl ${className}`}
      data-card={`tutor:${persona.slug ?? name}`}
    />
  );
}

export default LmsTutorCard;
