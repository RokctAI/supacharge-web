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

import { ReviewService } from "@/app/services/all/lms/reviews";
import { revalidatePath } from "next/cache";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const CreateReviewSchema = z.object({
  courseName: z.string().min(1),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(1),
});

export async function fetchCourseReviews(courseName: string) {
  if (!(await verifyLmsRole())) return [];
  return await ReviewService.getReviews(courseName);
}

export async function checkReviewStatus(courseName: string, user: string) {
  if (!(await verifyLmsRole())) return false;
  return await ReviewService.hasReviewed(courseName, user);
}

export async function createReviewAction(
  courseName: string,
  rating: number,
  reviewText: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  const valid = CreateReviewSchema.safeParse({
    courseName,
    rating,
    reviewText,
  });
  if (!valid.success) return { success: false, error: valid.error.message };

  try {
    await ReviewService.createReview(courseName, rating, reviewText);
    revalidatePath(`/handson/all/lms/courses/${courseName}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
