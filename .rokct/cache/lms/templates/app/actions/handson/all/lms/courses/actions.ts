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

import { CourseService } from "@/app/services/all/lms/courses";
import { revalidatePath } from "next/cache";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";
import type { CourseLesson } from "./types";

/** Returned by fetchLesson when the viewer may not read the lesson. */
export interface LessonAccessDenied {
  error: "access_denied";
  message: string;
}

const SaveProgressSchema = z.object({
  courseName: z.string().min(1),
  lessonName: z.string().min(1),
});

export async function fetchCourses() {
  if (!(await verifyLmsRole())) return [];
  return await CourseService.getAllCourses();
}

export async function fetchCourseByName(courseName: string) {
  if (!(await verifyLmsRole())) return null;
  return await CourseService.getCourseDetails(courseName);
}

export async function fetchMyCourses() {
  if (!(await verifyLmsRole())) return [];
  return await CourseService.getMyCourses();
}

/**
 * Fetch lesson content and details used in the Lesson Viewer.
 * If chapter is not provided, it looks it up from the course details.
 */
export async function fetchLesson(
  courseName: string,
  lesson: string,
  chapter?: string,
): Promise<CourseLesson | LessonAccessDenied | null> {
  if (!(await verifyLmsRole()))
    return { error: "access_denied", message: "Unauthorized" };

  // Guardrail: Check enrollment
  // We fetch course details to finding chapter anyway, so we check enrollment status there.
  // Even if chapter is provided, we should verify enrollment.
  const course = await CourseService.getCourseDetails(courseName);
  if (!course) return null;

  // Strict Guardrail: Check if user is enrolled
  if (!course.is_enrolled) {
    return {
      error: "access_denied",
      message: "You must be enrolled to view this lesson.",
    };
  }

  if (chapter) {
    return await CourseService.getLesson(courseName, chapter, lesson);
  }

  // Lookup chapter if not provided
  if (!course.chapters) return null;

  let foundChapterIndex = "1";
  for (let i = 0; i < course.chapters.length; i++) {
    const ch = course.chapters[i];
    if (ch.lessons && ch.lessons.some((l) => l.name === lesson)) {
      foundChapterIndex = (i + 1).toString();
      break;
    }
  }

  return await CourseService.getLesson(courseName, foundChapterIndex, lesson);
}

/**
 * Save lesson progress
 */
export async function saveLessonProgress(
  courseName: string,
  lessonName: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  // Validate Input
  const valid = SaveProgressSchema.safeParse({ courseName, lessonName });
  if (!valid.success) return { success: false, error: "Invalid parameters" };

  const res = await CourseService.saveProgress(courseName, lessonName);
  revalidatePath("/handson/all/lms");
  revalidatePath(`/handson/all/lms/courses/${courseName}`);
  return res;
}
