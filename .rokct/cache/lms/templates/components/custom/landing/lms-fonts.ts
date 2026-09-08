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

// Supacharge's fonts for the landing, the same two Google families the Dart
// app loads through google_fonts (AppStyle.inter* for every label,
// AppStyle.logoFontBlackItalic for the wordmark). next/font/google fetches
// them at build time and self-hosts them, so the composed shell needs no
// runtime font request; each exposes a CSS variable that lms-theme.css reads
// (--sc-font-sans / --sc-font-brand), applied to <html> by lms-theme.tsx.

import { Inter, Montserrat } from "next/font/google";

export const lmsSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--sc-font-inter",
  display: "swap",
});

export const lmsBrand = Montserrat({
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
  variable: "--sc-font-montserrat",
  display: "swap",
});
