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

/**
 * A web quiz is a lesson's questions from the published rlms practice
 * bank (api.lms.quiz_questions, answers stripped server-side). The quiz
 * route's id is the Course Lesson name. A question row's key is
 * "<lesson>::<item id>" so a question can be re-read without state.
 * Answers are graded by api.lms.check_quiz_answer (recorded as a practice
 * attempt) and the result is api.lms.quiz_summary.
 */
const SEP = "::";

interface RlmsQuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface RlmsQuiz {
  lesson: string;
  course: string;
  title: string;
  questions: RlmsQuizQuestion[];
}

function splitKey(key: string): [string, string] {
  const at = key.lastIndexOf(SEP);
  return at < 0 ? ["", key] : [key.slice(0, at), key.slice(at + SEP.length)];
}

export class QuizService extends BaseService {
  private static async rlmsQuiz(lesson: string): Promise<RlmsQuiz | null> {
    return (await this.call("api.lms.quiz_questions", { lesson })) ?? null;
  }

  /**
   * Get Quiz Definition (Settings, Question List)
   */
  static async getQuiz(quizName: string): Promise<Quiz | null> {
    try {
      const quiz = await this.rlmsQuiz(quizName);
      if (!quiz) return null;
      const rows = quiz.questions.map((q) => ({
        name: q.id,
        question: `${quiz.lesson}${SEP}${q.id}`,
      }));
      return {
        name: quiz.lesson,
        title: quiz.title,
        passing_score: 0,
        passing_percentage: 50,
        max_attempts: 0,
        show_answers: 1,
        introduction:
          rows.length === 0
            ? "No questions have been published for this lesson yet."
            : undefined,
        questions: rows,
      };
    } catch (error) {
      console.error("QuizService.getQuiz error:", error);
      return null;
    }
  }

  /**
   * Get Details for a specific question (Content, Options)
   */
  static async getQuestionDetails(
    questionName: string,
  ): Promise<QuestionDetails | null> {
    const [lesson, itemId] = splitKey(questionName);
    if (!lesson) return null;
    const quiz = await this.rlmsQuiz(lesson);
    const q = quiz?.questions.find((x) => x.id === itemId);
    if (!q) return null;
    const details: QuestionDetails & Record<string, unknown> = {
      name: questionName,
      question: q.question,
      type: "Choices",
      multiple: 0,
      options: q.options,
    };
    q.options.forEach((text, i) => {
      details[`option_${i + 1}`] = text;
    });
    return details;
  }

  /**
   * Check Answer (Immediate validation). Returns one entry per option:
   * 1 for the correct option, 0 for the others (the quiz page's shape).
   */
  static async checkAnswer(questionName: string, type: string, answers: any[]) {
    const details = await this.getQuestionDetails(questionName);
    if (!details) return [];
    const selected = (details.options as string[]).indexOf(String(answers[0]));
    const [, itemId] = splitKey(questionName);
    const result = await this.call("api.lms.check_quiz_answer", {
      item_id: itemId,
      selected_index: selected < 0 ? null : selected,
    });
    return (details.options as string[]).map((_, i) =>
      i === result?.correct_index ? 1 : 0,
    );
  }

  /**
   * Get Quiz Summary (Final Result)
   */
  static async getQuizSummary(quizName: string): Promise<QuizResult | null> {
    try {
      const s = await this.call("api.lms.quiz_summary", { lesson: quizName });
      if (!s) return null;
      return {
        score: s.correct,
        max_score: s.out_of,
        score_out_of: s.out_of,
        percentage: s.percentage,
        passed: s.percentage >= 50,
      } as QuizResult;
    } catch (error) {
      console.error("QuizService.getQuizSummary error:", error);
      return null;
    }
  }

  /**
   * The caller's standing on this quiz so far (rlms keeps outcomes per
   * question, not per attempt): one row while anything was answered.
   */
  static async getAttempts(quizName: string): Promise<QuizSubmission[]> {
    const s = await this.getQuizSummary(quizName);
    if (!s || !(s as any).score_out_of) return [];
    return [
      {
        name: quizName,
        creation: "",
        score: s.score,
        score_out_of: (s as any).score_out_of,
        percentage: s.percentage,
        passing_percentage: 50,
        idx: 1,
      } as QuizSubmission,
    ];
  }
}
