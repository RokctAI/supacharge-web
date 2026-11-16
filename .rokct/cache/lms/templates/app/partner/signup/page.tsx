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

// /partner/signup (1.37.0) - where the landing's "Become a sponsor or partner"
// button on the "Become a Sponsor or Partner" card lands. A public page: the
// visitor has no account yet. The form creates a partner account through
// api.lms.partner_signup (app/actions/handson/all/lms/partner/actions.ts).
// The site's own page, never a chat app or a phone number.
//
// 1.42.1: dressed like the rest of supacharge.school (Ray: "need redesign").
// LmsTheme and base's Header as the landing draws them, a hero that says
// what a partner is, a short benefits row, the form card and a "what
// happens next" list, then a slim footer (no wordmark). Tokens are
// lms-theme.css's (orange #ff6600, Montserrat and Inter, dark by default,
// light under html.light); partner-signup.css is scoped to .ps-root.
// Presentation only: the form's fields, action and submit are unchanged.

import type { Metadata } from "next";

import "./partner-signup.css";

import { Header } from "@/components/custom/header";
import { SiteCredit } from "@/components/custom/site-credit";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import { LmsTheme } from "@/components/custom/landing/lms-theme";
import { LMS_ROOT_CLASS } from "@/components/custom/landing/lms-theme-classes";
import { PartnerSignupForm } from "./partner-signup-form";

export const metadata: Metadata = {
  title: "Become a Sponsor or Partner",
  description:
    "Fund a learner, sponsor a school programme, or partner with us to expand reach.",
};

/** Why partner: only what the landing already says about Supacharge. */
const PARTNER_BENEFITS = [
  {
    title: "Open a seat",
    text: "Every contribution opens a seat for a child who needs it.",
  },
  {
    title: "Follow progress",
    text: "Link the learners you support and follow their progress in the app.",
  },
  {
    title: "Reports built for sponsors",
    text: "Cohort-level outcomes: attendance, progress and impact in one report.",
  },
] as const;

/** What happens after the form is sent. */
const PARTNER_NEXT_STEPS = [
  {
    title: "Your partner account is created",
    text: "Straight away, with the email and password you choose here.",
  },
  {
    title: "Sign in to the app",
    text: "Link learners and follow their progress from your account.",
  },
  {
    title: "We get in touch",
    text: "We talk through how you would like to help and set it up together.",
  },
] as const;

export default function PartnerSignupPage() {
  return (
    <div className={`${LMS_ROOT_CLASS} ps-root flex min-h-screen flex-col`}>
      <LmsTheme />
      <Header />
      <main className="ps">
        <div className="ps-wrap ps-g">
          <section className="ps-intro" aria-labelledby="ps-title">
            <a href="/" className="ps-back">
              Back to the home page
            </a>
            <p className="ps-kick">Sponsors and partners</p>
            <h1 id="ps-title" className="ps-h">
              Become a Sponsor or Partner
            </h1>
            <p className="ps-lede">
              A partner is a person, company or organisation that helps more
              children learn with Supacharge. Fund a learner, sponsor a school
              programme, or partner with us to expand reach. Every
              contribution opens a seat for a child who needs it.
            </p>
            <ul className="ps-benefits" aria-label="Why partner with us">
              {PARTNER_BENEFITS.map((b) => (
                <li key={b.title}>
                  <span className="ps-b-dot" aria-hidden="true" />
                  <span>
                    <strong>{b.title}</strong>
                    <span>{b.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <section className="ps-next" aria-labelledby="ps-next-title">
              <h2 id="ps-next-title">What happens next</h2>
              <ol>
                {PARTNER_NEXT_STEPS.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    <span>{s.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          </section>
          <section className="ps-card" aria-labelledby="ps-form-title">
            <h2 id="ps-form-title" className="ps-card-h">
              Create your partner account
            </h2>
            <p className="ps-card-sub">
              Takes a minute. You can change how you help at any time.
            </p>
            <PartnerSignupForm />
          </section>
        </div>
      </main>
      <footer className="ps-foot">
        <div className="ps-wrap ps-foot-in">
          <nav aria-label="Footer" className="ps-foot-nav">
            <a href="/">Home</a>
            <a href={LANDING_CONFIG.loginUrl}>Log in</a>
            <a href={LANDING_CONFIG.signupUrl}>Sign up</a>
          </nav>
          <SiteCredit as="p" siteName="Supacharge" className="ps-credit" heartClassName="ps-heart" />
        </div>
      </footer>
    </div>
  );
}
