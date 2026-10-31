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

// Supacharge's fonts for the landing, the same two families the Dart app
// loads through google_fonts (AppStyle.inter* for every label,
// AppStyle.logoFontBlackItalic for the wordmark). Since 1.39.1 they are
// bundled woff2 files under ./fonts/lms/ loaded through next/font/local, so
// the build makes no request to Google Fonts: next/font/google failed the
// supacharge-web Vercel build on main 6449cbd twice, when fonts.googleapis.com
// answered with fonts.gstatic.com/l/font?kit=... URLs that Turbopack's
// next/font/google loader cannot resolve ("next/font/google queries have
// exactly one entry"). next/font still self-hosts them, so the composed shell
// needs no runtime font request; each exposes a CSS variable that
// lms-theme.css reads (--sc-font-sans / --sc-font-brand), applied to <html>
// by lms-theme.tsx.
//
// The files are the google/fonts OFL sources (Inter 4.001, Montserrat 9.000,
// the versions Google Fonts serves) cut to the latin and latin-ext
// characters, the layout features fonts.googleapis.com keeps, the wght axis
// limited to the weights asked for (Inter 400-800, Montserrat 700-900) and
// every other axis pinned where Google pins it (Inter opsz 14). Google also
// listed cyrillic, greek and vietnamese faces, fetched only for those
// scripts; text in them now draws in the fallback. Licence:
// ./fonts/lms/OFL.txt (SIL Open Font License 1.1). adjustFontFallback keeps
// its default, Arial, the same metric-matched fallback next/font/google drew
// for both sans faces.

import localFont from "next/font/local";

export const lmsSans = localFont({
  src: [
    {
      path: "./fonts/lms/inter-wght-400-800.woff2",
      weight: "400 800",
      style: "normal",
    },
  ],
  variable: "--sc-font-inter",
  display: "swap",
});

export const lmsBrand = localFont({
  src: [
    {
      path: "./fonts/lms/montserrat-wght-700-900.woff2",
      weight: "700 900",
      style: "normal",
    },
    {
      path: "./fonts/lms/montserrat-wght-700-900-italic.woff2",
      weight: "700 900",
      style: "italic",
    },
  ],
  variable: "--sc-font-montserrat",
  display: "swap",
});
