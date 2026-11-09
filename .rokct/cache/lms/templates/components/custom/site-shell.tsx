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

// lms_sdk 1.42.0: the Supacharge frame for auth_sdk's pages (login,
// register, forgot-password). Ray: every app shell gets its own design for
// register and login (the pattern hosting_sdk 1.21.0 set for Cortex).
//
// auth_sdk >= 1.12.0 wraps those pages in SiteShell from this path and
// installs a generic default here. lms_sdk is the Supacharge shell's home
// SDK, so the installer keeps this copy. The landing is base's composed
// landing wearing lms-theme.css (LmsTheme puts .sc-landing and the two
// font variables on <html>, dark by default); the auth pages get the same:
// LmsTheme, base's Header as the landing draws it, a brand panel beside
// the card and a footer with the Supacharge wordmark. The root div carries
// LMS_ROOT_CLASS too, so lms-theme.css's light tokens (html.light
// .sc-landing) reach it. Presentation only: auth_sdk's views, actions and
// fields are untouched. Client-safe: the landing's footer section is an
// async server component, so the footer here is drawn on its own.

"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import "@/components/custom/supacharge-auth/supacharge-auth.css";

import { Header } from "@/components/custom/header";
import { SiteCredit } from "@/components/custom/site-credit";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import { LmsTheme } from "@/components/custom/landing/lms-theme";
import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";
import { LmsWordmark } from "@/components/custom/landing/lms-wordmark";
import { SUPACHARGE_AUTH_COPY, supachargeAuthPanel } from "@/components/custom/supacharge-auth/supacharge-auth-copy";

export interface SiteShellProps {
  children: ReactNode;
  /** Header "Log in" handler from the auth page, passed to base's Header. */
  openLoginPopup?: () => void;
  /** Header "Sign up" handler from the auth page, passed to base's Header. */
  openSignupPopup?: () => void;
}

export function SiteShell({ children, openLoginPopup, openSignupPopup }: SiteShellProps) {
  const panel = supachargeAuthPanel(usePathname());
  return (
    <div className={`${LMS_ROOT_CLASS} sa-root flex flex-col min-h-screen`}>
      <LmsTheme />
      <Header openLoginPopup={openLoginPopup} openSignupPopup={openSignupPopup} />
      <main className="sa">
        <div className="sa-wrap sa-g">
          <aside className="sa-side" aria-label={SUPACHARGE_AUTH_COPY.sideLabel}>
            <p className="sa-kick">{panel.kicker}</p>
            <p className="sa-h">
              {panel.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <p className="sa-lede">{panel.lede}</p>
            <ul className="sa-pts">
              {SUPACHARGE_AUTH_COPY.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </aside>
          <div className="sa-card">{children}</div>
        </div>
      </main>
      <footer className="sa-foot">
        <div className="sa-wrap sa-foot-in">
          <a href="/" className="sa-foot-brand" aria-label="Supacharge home">
            <LmsWordmark height={24} title="Supacharge" />
          </a>
          <nav aria-label="Footer" className="sa-foot-nav">
            <a href={LANDING_CONFIG.loginUrl}>Log in</a>
            <a href={LANDING_CONFIG.signupUrl}>Sign up</a>
          </nav>
          <SiteCredit as="p" siteName="Supacharge" className="sa-credit" heartClassName="sa-heart" />
        </div>
      </footer>
    </div>
  );
}

/** The mark above the auth card: the Supacharge wordmark the app and the landing use. */
export function SiteShellLogo({ size = 56 }: { size?: number }) {
  return <LmsWordmark height={Math.round(size * 0.6)} title="Supacharge" className="sa-mark" />;
}
