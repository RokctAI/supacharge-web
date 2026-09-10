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

// The classes Supacharge's look needs on an ancestor of the landing: the
// `sc-landing` token class lms-theme.css is scoped to and the two next/font
// variables (lms-fonts.ts). ONE list, read from two places: lms-theme.tsx's
// effect puts it on <html>, and lms-theme-section.tsx declares it as
// base_sdk 1.32.0's `meta.rootClass`, which base joins onto the landing root
// on the SERVER, in the first HTML.
//
// This module carries no "use client" directive on purpose, and must not
// gain one: base reads `meta.rootClass` in the server render, and every
// export of a client module is a client REFERENCE there (Next compiles it to
// registerClientReference; a property read on it answers undefined), so a
// string defined in lms-theme.tsx could never reach the root. next/font is
// fine in a server module, and the strings it answers are the same on both
// sides.

import { lmsBrand, lmsSans } from "./lms-fonts";

/** The class every lms-theme.css rule is scoped to. */
export const LMS_THEME_CLASS = "sc-landing";

/** The token class and the two font variables, in one list. */
export const LMS_THEME_CLASSES: readonly string[] = [
  LMS_THEME_CLASS,
  lmsSans.variable,
  lmsBrand.variable,
];

/** LMS_THEME_CLASSES as base_sdk 1.32.0's `PageSectionMeta.rootClass` wants it: space-separated. */
export const LMS_ROOT_CLASS = LMS_THEME_CLASSES.join(" ");
