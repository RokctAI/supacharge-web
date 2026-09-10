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

// Applies Supacharge's look to the landing while it is mounted: loads
// lms-theme.css (the Dart AppStyle tokens and the shared pieces) and puts the
// `sc-landing` class and the two font variables on <html>. Those ARE
// Supacharge's look, so they go on unconditionally.
//
// Since 1.24.0 the same three classes are ALSO in the first HTML, on the
// landing's root element: base_sdk 1.32.0 renders the landing on the server
// and joins every section's `meta.rootClass` onto that root
// (components/custom/landing/page-sections.ts), and lms-theme-section.tsx
// declares LMS_ROOT_CLASS there - the one list in ./lms-theme-classes.ts (a
// server-readable module; this one is "use client", whose exports the
// server sees only as references), so the server and the effect cannot
// name different classes. Every `.sc-landing` rule in lms-theme.css matches
// from the first byte, without JavaScript; the effect below is idempotent
// with that (it adds only what <html> lacks, and it touches <html>, never
// the root) and stays for what only <html> can carry: the mode default, its
// mirror attribute and the `.sc-landing body` paint outside the root.
//
// The light/dark MODE is not ours to pin. The host shell owns it - on
// supacharge.app next-themes writes Tailwind's `dark` class onto <html> from
// the header's theme toggle - so all this supplies is the DEFAULT: when
// nothing has expressed a mode yet, `dark` goes on, because Supacharge's
// landing is dark. A choice that is already there is left exactly as it is.
// Pinning `dark` on every mount is what made the toggle look broken (Ray,
// 2026-09-08: "theme toggle gets respected by header only"): the header
// followed the toggle and the landing put its own class straight back.
//
// ONE source of truth, and it is that `dark` class. lms-theme.css keys its
// light token set on `html.sc-landing:not(.dark)` - the same signal Tailwind's
// `dark:` variants read (darkMode: ["class"]) - so the tokens and the variants
// cannot disagree, and the sections re-theme the instant the toggle flips,
// in CSS, with no re-render. `data-sc-theme` survives only as a DERIVED
// mirror of that class, a read-only hook for anything that would rather match
// an attribute; it is written here and never read, so it cannot compete.
//
// The hero wordmark is base's since 1.24.0: lms-hero-copy.ts declares
// `brand: "stem"` and base_sdk 1.32.0's hero renders the site name's stem
// (brandStemOf(PLATFORM_NAME), the full name on aria-label and title) on
// the server, so the first HTML already reads "supacharge" and nothing here
// rewrites the DOM (1.22.0's lms-hero-wordmark.ts and its MutationObserver
// are gone). What base does not do is size that text to the hero's width -
// it fits the stem to its own 250px slot - so [LmsTheme] renders one
// `<style>` rule carrying `--hero-chars`, the rendered text's character
// count, derived from the very name base renders by the very rule base
// derives it with ([heroWordmarkChars]); lms-theme.css sizes the stem from
// it (min(72px, (100vw - 32px) / (chars * 0.68em)), the way base sizes its
// header stem from --brand-chars). A build constant on both sides, so the
// server and the client render the same element and hydration has nothing
// to reconcile. No brand string is written here.
//
// All of it is undone on unmount, so the handson pages are untouched. Rendered
// by lms-theme-section.tsx, registered before every other section.

import { useEffect } from "react";

import { PLATFORM_NAME } from "@/app/config/platform";
import { brandStemOf } from "@/components/custom/landing/header-menu";

import "./lms-theme.css";
import { LMS_THEME_CLASS, LMS_THEME_CLASSES } from "./lms-theme-classes";

export {
  LMS_ROOT_CLASS,
  LMS_THEME_CLASS,
  LMS_THEME_CLASSES,
} from "./lms-theme-classes";

/** The custom property lms-theme.css sizes the hero stem from: the rendered text's character count. */
export const HERO_CHARS_VAR = "--hero-chars";

/**
 * How many characters base's hero renders for `name` under `brand: "stem"`:
 * base_sdk 1.32.0's resolveHeroWordmark draws brandStemOf(name) ?? name,
 * so the count is that text's length - base_sdk 1.29.0's rule, imported,
 * not restated. "supacharge.school" counts 10; an undotted name counts
 * itself; an empty name counts 0.
 */
export function heroWordmarkChars(name: string): number {
  return (brandStemOf(name) ?? name).length;
}

/** The one rule the `<style>` carries: `--hero-chars` on the token class, for lms-theme.css. */
export function heroCharsRule(name: string): string {
  return `.${LMS_THEME_CLASS}{${HERO_CHARS_VAR}:${heroWordmarkChars(name)}}`;
}

export function LmsTheme() {
  useEffect(() => {
    const root = document.documentElement;
    // Idempotent with the server-rendered root class: a class already on
    // <html> is not added twice, and only what this effect added is removed.
    const added = LMS_THEME_CLASSES.filter((name) => !root.classList.contains(name));
    added.forEach((name) => root.classList.add(name));

    // Supply the default, never override a choice: `dark` goes on only when
    // neither class is there, i.e. nothing has asked for a mode at all.
    const defaulted =
      !root.classList.contains("dark") && !root.classList.contains("light");
    if (defaulted) root.classList.add("dark");

    // Derived mirror of the class, kept in step for as long as we are mounted.
    const hadAttr = root.getAttribute("data-sc-theme");
    const mirror = () => {
      root.setAttribute(
        "data-sc-theme",
        root.classList.contains("dark") ? "dark" : "light",
      );
    };
    mirror();
    // Only `class` is watched, and only `data-sc-theme` is written, so the
    // mirror cannot retrigger itself.
    const watcher = new MutationObserver(mirror);
    watcher.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      watcher.disconnect();
      added.forEach((name) => root.classList.remove(name));
      if (defaulted) root.classList.remove("dark");
      if (hadAttr === null) root.removeAttribute("data-sc-theme");
      else root.setAttribute("data-sc-theme", hadAttr);
    };
  }, []);
  // The hero stem's character count, in the first HTML, from the name base
  // renders: the same constant on the server and the client.
  return <style>{heroCharsRule(PLATFORM_NAME)}</style>;
}

export default LmsTheme;
