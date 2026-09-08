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
// or search input: two calls to action - the store link and sign-in - and
// the hero's trust line under them (the frame shows that line only beside
// its store badges, which this product's copy hides). Links:
// LMS_LANDING_CONFIG.app and LANDING_CONFIG.loginUrl; words: the copy this
// SDK registers in lms-hero-copy.ts. Shapes: the Dart welcome screen's
// primary Login button (AppStyle.primary fill, radius 12) and outlined
// Register button, from lms-theme.css.

import React from "react";
import Link from "next/link";

import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import type { HeroFormProps } from "@/components/custom/landing/hero-form";
import { LMS_LANDING_CONFIG } from "@/components/custom/landing/lms-landing-config";

export default function LmsHeroForm({ hero }: HeroFormProps) {
  const app = LMS_LANDING_CONFIG.app;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        <a
          href={app.href}
          target={app.external ? "_blank" : undefined}
          rel={app.external ? "noopener noreferrer" : undefined}
          className="sc-btn sc-btn-primary w-full px-8 sm:w-auto"
        >
          {app.label}
        </a>
        <Link
          href={LANDING_CONFIG.loginUrl}
          className="sc-btn sc-btn-outline w-full px-8 sm:w-auto"
        >
          Sign in
        </Link>
      </div>

      {hero.trustLine.length > 0 && (
        <p className="text-sm font-medium text-[var(--sc-ink-2)]">
          {hero.trustLine.join(" \u00b7 ")}
        </p>
      )}
    </div>
  );
}
