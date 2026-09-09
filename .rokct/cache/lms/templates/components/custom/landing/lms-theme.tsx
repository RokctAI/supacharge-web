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
// All of it is undone on unmount, so the handson pages are untouched. Rendered
// by lms-theme-section.tsx, registered before every other section.

import { useEffect } from "react";

import "./lms-theme.css";
import { lmsBrand, lmsSans } from "./lms-fonts";

export const LMS_THEME_CLASS = "sc-landing";

export function LmsTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const added = [LMS_THEME_CLASS, lmsSans.variable, lmsBrand.variable];
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
  return null;
}

export default LmsTheme;
