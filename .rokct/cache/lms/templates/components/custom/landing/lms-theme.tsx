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
// lms-theme.css (the Dart AppStyle tokens and the shared pieces), puts the
// `sc-landing` class and the two font variables on <html>, and - because
// base_sdk's hero and the shell's header style their dark side with
// Tailwind `dark:` variants (class strategy) - the `dark` class too, unless
// the host asked for the light set with html[data-sc-theme="light"]. All of
// it is undone on unmount, so the handson pages are untouched. Rendered by
// lms-theme-section.tsx, registered before every other section.

import { useEffect } from "react";

import "./lms-theme.css";
import { lmsBrand, lmsSans } from "./lms-fonts";

export const LMS_THEME_CLASS = "sc-landing";

export function LmsTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const added = [LMS_THEME_CLASS, lmsSans.variable, lmsBrand.variable];
    const light = root.getAttribute("data-sc-theme") === "light";
    const hadDark = root.classList.contains("dark");
    added.forEach((name) => root.classList.add(name));
    if (light) root.classList.remove("dark");
    else root.classList.add("dark");
    return () => {
      added.forEach((name) => root.classList.remove(name));
      if (hadDark) root.classList.add("dark");
      else root.classList.remove("dark");
    };
  }, []);
  return null;
}

export default LmsTheme;
