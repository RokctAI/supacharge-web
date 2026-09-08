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
  Quiz,
  QuestionDetails,
  QuizSubmission,
  QuizResult,
} from "@/app/actions/handson/all/lms/quiz/types";

export class QuizService extends BaseService {
  /**
   * Get Quiz Definition (Settings, Question List)
   */
  static async getQuiz(quizName: string): Promise<Quiz | null> {
    return await this.getDoc("LMS Quiz", quizName);
  }

  /**
   * Get Details for a specific question (Content, Options)
   */
  static async getQuestionDetails(
    questionName: string,
  ): Promise<QuestionDetails | null> {
    return await this.call("lms.lms.utils.get_question_details", {
      question: questionName,
    });
  }

  /**
   * Check Answer (Immediate validation)
   */
  static async checkAnswer(questionName: string, type: string, answers: any[]) {
    return await this.call("lms.lms.doctype.lms_quiz.lms_quiz.check_answer", {
      question: questionName,
      type: type,
      answers: JSON.stringify(answers),
    });
  }

  /**
   * Get Quiz Summary (Final Result)
   */
  static async getQuizSummary(quizName: string): Promise<QuizResult | null> {
    return await this.call("lms.lms.doctype.lms_quiz.lms_quiz.quiz_summary", {
      quiz: quizName,
    });
  }

  /**
   * Fetch User's Attempts
   */
  static async getAttempts(quizName: string): Promise<QuizSubmission[]> {
    return await this.getList("LMS Quiz Submission", {
      filters: {
        quiz: quizName,
      },
      fields: [
        "name",
        "creation",
        "score",
        "score_out_of",
        "percentage",
        "passing_percentage",
      ],
      order_by: "creation desc",
    });
  }
}
