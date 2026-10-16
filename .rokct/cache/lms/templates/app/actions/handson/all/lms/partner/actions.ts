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
"use server";

import { z } from "zod";
import { PartnerService } from "@/app/services/all/lms/partner";
import type { ActionResult, PartnerSignupInput } from "./types";

// No role gate here, unlike the other lms actions: the visitor signing up
// has no account yet. The backend refuses an email that already exists.
const SignupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(140),
  organisation: z.string().trim().max(140),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
  interest: z.enum(["fund_learner", "sponsor_school", "partner"], {
    message: "Please choose how you would like to help.",
  }),
});

/** "Thandi van der Merwe" -> first "Thandi", last "van der Merwe". */
function splitName(name: string): { first_name: string; last_name: string } {
  const parts = name.trim().split(/\s+/);
  return { first_name: parts[0] ?? "", last_name: parts.slice(1).join(" ") };
}

export async function partnerSignupAction(
  input: PartnerSignupInput,
): Promise<ActionResult<{ email: string }>> {
  const valid = SignupSchema.safeParse(input);
  if (!valid.success) {
    return {
      success: false,
      error: valid.error.issues[0]?.message ?? "Please check the form.",
    };
  }
  try {
    const data = await PartnerService.signup({
      email: valid.data.email,
      password: valid.data.password,
      ...splitName(valid.data.name),
      organisation: valid.data.organisation,
      help_type: valid.data.interest,
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
