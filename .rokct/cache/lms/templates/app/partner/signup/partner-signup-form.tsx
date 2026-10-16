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

const EMPTY: PartnerSignupInput = {
  name: "",
  organisation: "",
  email: "",
  password: "",
  interest: "fund_learner",
};

export function PartnerSignupForm() {
  const [v, setV] = useState<PartnerSignupInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="space-y-2" role="status">
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
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const r = await partnerSignupAction(v);
        setBusy(false);
        if (!r.success) return void toast.error(r.error);
        setDone(r.data.email);
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="partner-name">Name</Label>
        <Input
          id="partner-name"
          autoComplete="name"
          required
          maxLength={140}
          value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="partner-organisation">Organisation (optional)</Label>
        <Input
          id="partner-organisation"
          autoComplete="organization"
          maxLength={140}
          value={v.organisation}
          onChange={(e) => setV({ ...v, organisation: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="partner-email">Email</Label>
        <Input
          id="partner-email"
          type="email"
          autoComplete="email"
          required
          value={v.email}
          onChange={(e) => setV({ ...v, email: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="partner-password">Password</Label>
        <Input
          id="partner-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={v.password}
          onChange={(e) => setV({ ...v, password: e.target.value })}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          How you&apos;d like to help
        </legend>
        {PARTNER_INTERESTS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
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
      </fieldset>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating your account..." : "Become a partner"}
      </Button>
    </form>
  );
}
