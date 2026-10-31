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


// The faces a local-data site may choose (corporate_sdk 1.4.0), served
// through next/font: a small allowed set, named in data/theme.json `fonts`
// and validated by base_sdk (lib/site-data/validate-site.mjs DISPLAY_FONTS
// / TEXT_FONTS). next/font needs every face declared statically, so all of
// them are declared here; a page downloads only the files its two faces
// use. Each face's CSS variable is `--cs-font-<name>`, which
// site-theme.ts points `--cs-font-display` / `--cs-font-text` at.
import { DM_Sans, Figtree, Fraunces, Inter, Montserrat, Playfair_Display, Space_Grotesk } from "next/font/google";

import type { SiteDisplayFont, SiteTextFont, SiteTheme } from "@/lib/site-data/kinds";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--cs-font-montserrat",
  display: "swap",
});
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--cs-font-fraunces", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--cs-font-space-grotesk", display: "swap" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--cs-font-playfair-display",
  display: "swap",
});
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--cs-font-figtree", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--cs-font-inter", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--cs-font-dm-sans", display: "swap" });

const DISPLAY: Record<SiteDisplayFont, { variable: string }> = {
  montserrat,
  fraunces,
  "space-grotesk": spaceGrotesk,
  "playfair-display": playfairDisplay,
};
const TEXT: Record<SiteTextFont, { variable: string }> = { figtree, inter, "dm-sans": dmSans };

/** The next/font class names that define the theme's two face variables. */
export function siteFontClasses(theme: SiteTheme | undefined): string[] {
  const display = DISPLAY[theme?.fonts?.display ?? "montserrat"] ?? montserrat;
  const text = TEXT[theme?.fonts?.text ?? "figtree"] ?? figtree;
  return [text.variable, display.variable];
}
