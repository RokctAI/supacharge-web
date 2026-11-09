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

// lms_sdk 1.42.0: the words beside the auth card (../site-shell.tsx). Every
// claim is the landing's own (lms-hero-copy.ts, lms-landing-config.ts): the
// two teaching styles, the CAPS plan, the linked partner. The card's own
// words stay auth_sdk's.

export interface SupachargeAuthPanel {
  kicker: string;
  title: string[];
  lede: string;
}

export const SUPACHARGE_AUTH_COPY = {
  sideLabel: "About Supacharge",
  login: {
    kicker: "Supacharge · Log in",
    title: ["Welcome", "back."],
    lede: "Log in to your Supacharge account to carry on.",
  },
  register: {
    kicker: "Supacharge · New account",
    title: ["Learn faster.", "Pass with confidence."],
    lede: "Create a Supacharge account to get started.",
  },
  forgot: {
    kicker: "Supacharge · Account help",
    title: ["Lost your", "password?"],
    lede: "Password reset is not self-service yet. Get in touch with us and we will help you back in.",
  },
  points: [
    "One lesson, two teaching styles",
    "Lessons follow the CAPS plan, term by term",
    "Link a partner who sees the whole week",
  ],
} as const;

/** The panel for the auth page at `pathname` (login when unknown). */
export function supachargeAuthPanel(pathname: string | null): SupachargeAuthPanel {
  const p = pathname ?? "";
  const c = p.startsWith("/register") ? SUPACHARGE_AUTH_COPY.register : p.startsWith("/forgot") ? SUPACHARGE_AUTH_COPY.forgot : SUPACHARGE_AUTH_COPY.login;
  return { kicker: c.kicker, title: [...c.title], lede: c.lede };
}
