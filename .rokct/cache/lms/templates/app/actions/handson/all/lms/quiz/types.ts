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

/** One row of LMS Quiz's `questions` child table (LMS Quiz Question). */
export interface QuizQuestionRow {
  name?: string;
  question: string;
  marks?: number;
}

export interface Quiz {
  name: string;
  title: string;
  passing_score: number;
  passing_percentage?: number;
  max_attempts: number;
  /** Time limit in minutes; absent or 0 means untimed. */
  duration?: number;
  /** LMS Quiz `show_answers` check (Frappe returns 0/1). */
  show_answers?: boolean | number;
  description?: string;
  introduction?: string;
  questions?: QuizQuestionRow[];
  question_list?: QuizQuestionRow[]; // Keep raw for now or refine
}

export interface QuestionDetails {
  name: string;
  question: string;
  type: string;
  multiple?: boolean | number;
  option_1?: string;
  option_2?: string;
  option_3?: string;
  option_4?: string;
  options: unknown[];
}

export interface QuizSubmission {
  name: string;
  creation: string;
  score: number;
  score_out_of: number;
  percentage: number;
  passing_percentage: number;
}

export interface QuizResult {
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
}
