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

export interface Course {
  name: string;
  title: string;
  description: string;
  short_introduction?: string;
  image?: string;
  is_published: boolean;
  is_featured: boolean;
  level?: string;
  duration?: string;
  lesson_count?: number;
  instructors?: any[]; // Refine if needed
  chapters?: CourseChapter[];
  is_enrolled?: boolean;
}

export interface CourseChapter {
  name: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  name: string;
  title: string;
  body?: string;
  content?: string; // JSON string for EditorJS
  video_url?: string;
  youtube?: string;
  is_complete?: boolean;
  prev?: string;
  next?: string;
  chapter_title?: string;
  course_title?: string;
}
