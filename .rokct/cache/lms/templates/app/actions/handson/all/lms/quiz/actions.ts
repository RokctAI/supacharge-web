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

import { QuizService } from "@/app/services/all/lms/quiz";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const CheckAnswerSchema = z.object({
  questionName: z.string().min(1),
  type: z.string(),
  answers: z.array(z.any()), // Allow mixed types for now but enforce array
});

export async function fetchQuiz(quizName: string) {
  if (!(await verifyLmsRole())) return null;
  return await QuizService.getQuiz(quizName);
}

export async function fetchQuestionDetails(questionName: string) {
  if (!(await verifyLmsRole())) return null;
  return await QuizService.getQuestionDetails(questionName);
}

export async function checkAnswer(
  questionName: string,
  type: string,
  answers: any[],
) {
  if (!(await verifyLmsRole())) return { is_correct: false };

  const valid = CheckAnswerSchema.safeParse({ questionName, type, answers });
  if (!valid.success) return { is_correct: false, error: "Invalid Input" };

  return await QuizService.checkAnswer(questionName, type, answers);
}

export async function fetchQuizSummary(quizName: string) {
  if (!(await verifyLmsRole())) return null;
  return await QuizService.getQuizSummary(quizName);
}

export async function fetchQuizAttempts(quizName: string) {
  if (!(await verifyLmsRole())) return [];
  return await QuizService.getAttempts(quizName);
}
