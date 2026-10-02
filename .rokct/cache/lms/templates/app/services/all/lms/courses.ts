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

import { BaseService } from "@/app/services/common/base";
import {
  Course,
  CourseLesson,
  LessonAccessDenied,
} from "@/app/actions/handson/all/lms/courses/types";

/** The throw text get_lesson_session uses for a missing lesson (course.py). */
const LESSON_NOT_FOUND = "Lesson not found.";

/** The server's reason out of a failed call, whatever shape the base SDK threw. */
function serverReason(error: unknown): string | null {
  if (typeof error === "string") return error.trim() || null;
  if (error && typeof error === "object") {
    const e = error as { message?: unknown; exception?: unknown };
    for (const v of [e.message, e.exception]) {
      if (typeof v === "string" && v.trim()) {
        // Frappe exception strings read "frappe.exceptions.X: reason".
        return v.replace(/^[\w.]+(Error|Exception):\s*/, "").trim();
      }
    }
  }
  return null;
}

// Wire shapes of the rlms aliases (lms/frappe/manifest.json) - the same
// keys the Dart twin (HttpLmsRepository) calls. The upstream Frappe-LMS
// `lms.lms.api.*` methods these replaced are not installed in the fleet.
interface RlmsCourseCard {
  name: string;
  title: string;
  subject?: string;
  grade?: number | null;
  short_introduction?: string;
  image?: string;
  lesson_count?: number;
}

interface RlmsChapter {
  name: string;
  title: string;
  sequence?: number;
  lessons: {
    name: string;
    title: string;
    sequence?: number;
    session_id: string | null;
  }[];
}

interface RlmsEnrollment {
  name: string;
  progress?: number;
  current_lesson?: string;
}

function toCourse(card: RlmsCourseCard): Course {
  return {
    name: card.name,
    title: card.title,
    description: card.short_introduction ?? "",
    short_introduction: card.short_introduction,
    image: card.image,
    // list_courses only ever returns published courses.
    is_published: true,
    is_featured: false,
    lesson_count: card.lesson_count,
  };
}

export class CourseService extends BaseService {
  private static async listCourseCards(): Promise<RlmsCourseCard[]> {
    const data = await this.call<RlmsCourseCard[]>("api.lms.list_courses");
    return Array.isArray(data) ? data : [];
  }

  private static async getMyEnrollment(
    courseName: string,
  ): Promise<RlmsEnrollment | null> {
    const data = await this.call<RlmsEnrollment | null>(
      "api.lms.get_my_enrollment",
      { course: courseName },
    );
    return data && typeof data === "object" && data.name ? data : null;
  }

  /**
   * Get all available (published) courses.
   */
  static async getAllCourses(): Promise<Course[]> {
    try {
      return (await this.listCourseCards()).map(toCourse);
    } catch (error) {
      console.error("CourseService.getAllCourses error:", error);
      return [];
    }
  }

  /**
   * Get details for a specific course by name.
   */
  static async getCourseDetails(courseName: string): Promise<Course | null> {
    try {
      const [cards, chapters, enrollment] = await Promise.all([
        this.listCourseCards(),
        this.call<RlmsChapter[]>("api.lms.get_course_content", {
          course: courseName,
        }),
        this.getMyEnrollment(courseName).catch(() => null),
      ]);
      const card = cards.find((c) => c.name === courseName);
      if (!card) return null;
      return {
        ...toCourse(card),
        chapters: (Array.isArray(chapters) ? chapters : []).map((ch) => ({
          name: ch.name,
          title: ch.title,
          lessons: (ch.lessons ?? []).map((l) => ({
            name: l.name,
            title: l.title,
          })),
        })),
        is_enrolled: enrollment !== null,
      };
    } catch (error) {
      console.error(
        `CourseService.getCourseDetails(${courseName}) error:`,
        error,
      );
      return null;
    }
  }

  /**
   * Get user's enrolled courses.
   */
  static async getMyCourses(): Promise<Course[]> {
    try {
      // rlms has no "my courses" list: the catalog, kept to the courses the
      // caller holds an enrollment for (get_my_enrollment per course).
      const cards = await this.listCourseCards();
      const enrolled = await Promise.all(
        cards.map((c) => this.getMyEnrollment(c.name).catch(() => null)),
      );
      return cards
        .filter((_, i) => enrolled[i] !== null)
        .map((c) => ({ ...toCourse(c), is_enrolled: true }));
    } catch (error) {
      console.error("CourseService.getMyCourses error:", error);
      return [];
    }
  }

  /**
   * Get lesson content and details.
   */
  static async getLesson(
    courseName: string,
    chapter: string,
    lesson: string,
  ): Promise<CourseLesson | LessonAccessDenied | null> {
    try {
      // get_lesson_session applies the server-side serving gate and throws
      // with a reason when the caller may not open the lesson. That reason
      // is surfaced as LessonAccessDenied (the lock explained), not folded
      // into null ("not found"); only the missing-lesson throw means null.
      let session: { session_id: string | null; next_lesson: string | null };
      try {
        session = await this.call<{
          session_id: string | null;
          next_lesson: string | null;
        }>("api.lms.get_lesson_session", { lesson });
      } catch (error) {
        const reason = serverReason(error);
        if (!reason || reason.includes(LESSON_NOT_FOUND)) throw error;
        return { error: "access_denied", message: reason };
      }
      const [chapters] = await Promise.all([
        this.call<RlmsChapter[]>("api.lms.get_course_content", {
          course: courseName,
        }),
      ]);
      const list = Array.isArray(chapters) ? chapters : [];
      const ch =
        list.find((c) => c.lessons?.some((l) => l.name === lesson)) ??
        list.find((c) => c.name === chapter);
      const all = list.flatMap((c) => c.lessons ?? []);
      const idx = all.findIndex((l) => l.name === lesson);
      return {
        name: lesson,
        title: idx >= 0 ? all[idx].title : lesson,
        session_id: session?.session_id ?? null,
        prev: idx > 0 ? all[idx - 1].name : undefined,
        next: session?.next_lesson ?? undefined,
        chapter_title: ch?.title,
      };
    } catch (error) {
      console.error(
        `CourseService.getLesson(${courseName}, ${chapter}, ${lesson}) error:`,
        error,
      );
      return null;
    }
  }

  /**
   * Save lesson progress.
   */
  static async saveProgress(courseName: string, lessonName: string) {
    try {
      // rlms keys progress by lesson; the course is implied by it.
      return await this.call("api.lms.save_progress", {
        lesson: lessonName,
        is_complete: 1,
      });
    } catch (error) {
      console.error(`CourseService.saveProgress error:`, error);
      return null;
    }
  }

  /**
   * Admin: every course with its enrollment count (api.lms.created_courses,
   * System Manager only: rlms courses are published by the factory/admin).
   */
  static async getCreatedCourses() {
    try {
      return (await this.call("api.lms.created_courses")) ?? [];
    } catch (error) {
      console.error("CourseService.getCreatedCourses error:", error);
      return [];
    }
  }
}
