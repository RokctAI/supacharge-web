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

import { useState } from "react";
import { toast } from "sonner";
import { partnerSignupAction } from "@/app/actions/handson/all/lms/partner/actions";
import {
  PARTNER_INTERESTS,
  type PartnerInterest,
  type PartnerSignupInput,
} from "@/app/actions/handson/all/lms/partner/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";

const EMPTY: PartnerSignupInput = {
  name: "",
  organisation: "",
  email: "",
  password: "",
  interest: "fund_learner",
};

type Touched = Partial<Record<"name" | "email" | "password", boolean>>;

// 1.42.1: presentation only. Same fields, ids, limits, action and submit as
// 1.37.0; grouped (About you / Your sign-in / How you'd like to help), with
// hints and inline validation once a field is left (page.tsx, .ps-root).
function fieldError(key: keyof Touched, v: PartnerSignupInput): string | null {
  if (key === "name" && !v.name.trim()) return "Please enter your name.";
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    return "Please enter a valid email address.";
  if (key === "password" && v.password.length < 8)
    return "Use at least 8 characters.";
  return null;
}

export function PartnerSignupForm() {
  const [v, setV] = useState<PartnerSignupInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [touched, setTouched] = useState<Touched>({});

  const err = (key: keyof Touched) => (touched[key] ? fieldError(key, v) : null);
  const leave = (key: keyof Touched) => () => setTouched((t) => ({ ...t, [key]: true }));

  if (done) {
    return (
      <div className="ps-done space-y-2" role="status">
        <p className="font-semibold">
          Thank you - your partner account is ready.
        </p>
        <p className="text-sm text-muted-foreground">
          Sign in with {done} in the app to link learners and follow their
          progress. We will be in touch about how you would like to help.
        </p>
      </div>
    );
  }

  return (
    <form
      className="ps-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const r = await partnerSignupAction(v);
        setBusy(false);
        if (!r.success) return void toast.error(r.error);
        setDone(r.data.email);
      }}
    >
      <fieldset className="ps-group">
        <legend className="ps-group-t">About you</legend>
        <div className="ps-field">
          <Label htmlFor="partner-name">Name</Label>
          <Input
            id="partner-name"
            autoComplete="name"
            required
            maxLength={140}
            placeholder="Your full name"
            aria-invalid={err("name") ? true : undefined}
            aria-describedby={err("name") ? "partner-name-err" : undefined}
            value={v.name}
            onBlur={leave("name")}
            onChange={(e) => setV({ ...v, name: e.target.value })}
          />
          {err("name") && <p id="partner-name-err" className="ps-err">{err("name")}</p>}
        </div>
        <div className="ps-field">
          <Label htmlFor="partner-organisation">
            Organisation <em>(optional)</em>
          </Label>
          <Input
            id="partner-organisation"
            autoComplete="organization"
            maxLength={140}
            placeholder="Company, school or foundation"
            aria-describedby="partner-organisation-hint"
            value={v.organisation}
            onChange={(e) => setV({ ...v, organisation: e.target.value })}
          />
          <p id="partner-organisation-hint" className="ps-hint">
            Leave blank if you are giving as an individual.
          </p>
        </div>
      </fieldset>
      <fieldset className="ps-group">
        <legend className="ps-group-t">Your sign-in</legend>
        <div className="ps-field">
          <Label htmlFor="partner-email">Email</Label>
          <Input
            id="partner-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            aria-invalid={err("email") ? true : undefined}
            aria-describedby={err("email") ? "partner-email-err" : "partner-email-hint"}
            value={v.email}
            onBlur={leave("email")}
            onChange={(e) => setV({ ...v, email: e.target.value })}
          />
          {err("email") ? (
            <p id="partner-email-err" className="ps-err">{err("email")}</p>
          ) : (
            <p id="partner-email-hint" className="ps-hint">
              You will sign in to the app with this email.
            </p>
          )}
        </div>
        <div className="ps-field">
          <Label htmlFor="partner-password">Password</Label>
          <Input
            id="partner-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={err("password") ? true : undefined}
            aria-describedby={err("password") ? "partner-password-err" : "partner-password-hint"}
            value={v.password}
            onBlur={leave("password")}
            onChange={(e) => setV({ ...v, password: e.target.value })}
          />
          {err("password") ? (
            <p id="partner-password-err" className="ps-err">{err("password")}</p>
          ) : (
            <p id="partner-password-hint" className="ps-hint">At least 8 characters.</p>
          )}
        </div>
      </fieldset>
      <fieldset className="ps-group">
        <legend className="ps-group-t">
          How you&apos;d like to help
        </legend>
        <div className="ps-opts">
          {PARTNER_INTERESTS.map((option) => (
            <label key={option.value} className="ps-opt">
              <input
                type="radio"
                name="partner-interest"
                value={option.value}
                checked={v.interest === option.value}
                onChange={() =>
                  setV({ ...v, interest: option.value as PartnerInterest })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" className="ps-submit w-full" disabled={busy}>
        {busy ? "Creating your account..." : "Become a partner"}
      </Button>
      <p className="ps-fine">
        Already have an account? <a href={LANDING_CONFIG.loginUrl}>Log in</a>
      </p>
    </form>
  );
}
