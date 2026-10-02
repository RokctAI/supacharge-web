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
import { ChildrenService } from "@/app/services/all/lms/children";
import { verifyLmsRole } from "@/app/lib/roles";
import type {
  ActionResult,
  ChildInput,
  ChildProfile,
  ChildWeek,
  ClaimCode,
} from "./types";

const ChildSchema = z.object({
  display_name: z.string().trim().min(1).max(40),
  grade: z.enum(["R", "1", "2", "3"]),
  avatar_key: z.string().optional(),
  school: z.string().max(140).optional(),
});

function fail(error: unknown): { success: false; error: string } {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  };
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    return fail(error);
  }
}

export async function fetchChildren(includeArchived = false) {
  return run<ChildProfile[]>(() => ChildrenService.list(includeArchived));
}

export async function addChildAction(input: ChildInput, consent: boolean) {
  const valid = ChildSchema.safeParse(input);
  if (!valid.success) return fail(valid.error.issues[0]?.message);
  if (!consent)
    return fail("Please confirm you are this child's parent or guardian.");
  return run(() => ChildrenService.add(valid.data, consent));
}

export async function updateChildAction(child: string, input: ChildInput) {
  const valid = ChildSchema.safeParse(input);
  if (!valid.success) return fail(valid.error.issues[0]?.message);
  return run(() => ChildrenService.update(child, valid.data));
}

export async function archiveChildAction(child: string) {
  return run(() => ChildrenService.archive(child));
}

export async function issueClaimCodeAction(child: string) {
  return run<ClaimCode>(() => ChildrenService.issueClaimCode(child));
}

/** This week's report (Monday start) for one child's learner account. */
export async function fetchChildWeek(student: string) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekStart = monday.toISOString().slice(0, 10);
  return run<ChildWeek>(() => ChildrenService.week(student, weekStart));
}
