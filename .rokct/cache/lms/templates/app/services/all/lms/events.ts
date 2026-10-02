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
  LiveClass,
  Evaluation,
} from "@/app/actions/handson/all/lms/events/types";

/**
 * Live classes are rlms' scheduled Replay Sessions
 * (api.replay.get_upcoming_sessions, the endpoint the app's schedule
 * reads), narrowed to the learner's subjects (api.lms.allowed_subjects).
 * The web lists them; joining one is the app's (lesson playback stays
 * app-only), so no join link is emitted.
 *
 * Evaluations are the tutor-evaluated homework questions: the learner's
 * own (api.lms.list_homework_questions) and, for the admin, the pending
 * queue (api.lms.homework_pending_requests, System Manager only).
 */
interface ReplaySession {
  session_id: string;
  subject: string;
  grade?: number;
  topic?: string;
  scheduled_at: string;
  airing_context?: string;
  room?: string;
}

const AIRING_LABEL: Record<string, string> = {
  live: "Live class",
  holiday: "Holiday programme",
  revision: "Revision",
};

function toLiveClass(s: ReplaySession): LiveClass & Record<string, unknown> {
  const at = new Date(s.scheduled_at.replace(" ", "T"));
  const valid = !isNaN(at.getTime());
  const title = [s.subject, s.topic].filter(Boolean).join(": ");
  return {
    name: s.session_id,
    title: title || s.session_id,
    start_time: s.scheduled_at,
    end_time: "",
    meeting_link: "",
    status: AIRING_LABEL[s.airing_context ?? ""] ?? "Live class",
    course: s.subject,
    description: [
      AIRING_LABEL[s.airing_context ?? ""] ?? "Live class",
      s.grade != null ? `Grade ${s.grade === 0 ? "R" : s.grade}` : "",
      "Join in the app",
    ]
      .filter(Boolean)
      .join(" · "),
    date: valid ? at.toLocaleDateString() : s.scheduled_at,
    time: valid
      ? at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
  };
}

const HOMEWORK_OPEN = ["Submitted", "In Review", "Ready"];

function excerpt(text: string, n = 80) {
  const t = (text || "").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function toEvaluation(row: any): Evaluation & Record<string, unknown> {
  const id = row.id ?? row.name;
  const submitted = row.submitted_at ? String(row.submitted_at) : "";
  return {
    name: id,
    title: excerpt(row.question_text),
    due_date: submitted,
    type: "Assignment",
    course: row.subject || "",
    status: row.status === "Ready" ? "Ready to answer in the app" : row.status,
    course_title: [row.subject, excerpt(row.question_text, 60)]
      .filter(Boolean)
      .join(": "),
    date: submitted.slice(0, 10),
    start_time: "",
    evaluator_name: "",
    member: row.member,
  };
}

export class EventService extends BaseService {
  private static async sessions(subjects?: string[]) {
    const rows: ReplaySession[] =
      (await this.call("api.replay.get_upcoming_sessions", {
        subjects: JSON.stringify(subjects ?? []),
      })) ?? [];
    return rows.map(toLiveClass);
  }

  /**
   * Get user's upcoming live classes.
   */
  static async getMyLiveClasses(): Promise<LiveClass[]> {
    try {
      const subjects: string[] =
        (await this.call("api.lms.allowed_subjects")) ?? [];
      if (subjects.length === 0) return [];
      return await this.sessions(subjects);
    } catch (error) {
      console.error("EventService.getMyLiveClasses error:", error);
      return [];
    }
  }

  /**
   * The learner's homework questions still with (or just back from) a
   * tutor. [courses]/[batch] are kept for the signature; rlms scopes by
   * the caller.
   */
  static async getUpcomingEvaluations(
    courses?: string[],
    batch?: string,
  ): Promise<Evaluation[]> {
    try {
      const rows: any[] =
        (await this.call("api.lms.list_homework_questions")) ?? [];
      return rows
        .filter((r) => HOMEWORK_OPEN.includes(r.status))
        .map(toEvaluation);
    } catch (error) {
      console.error("EventService.getUpcomingEvaluations error:", error);
      return [];
    }
  }

  /**
   * Admin: every scheduled session in the next two weeks, all subjects.
   */
  static async getAdminLiveClasses() {
    try {
      return await this.sessions();
    } catch (error) {
      console.error("EventService.getAdminLiveClasses error:", error);
      return [];
    }
  }

  /**
   * Admin: the homework questions waiting on a tutor (System Manager).
   */
  static async getAdminEvals() {
    try {
      const rows: any[] =
        (await this.call("api.lms.homework_pending_requests")) ?? [];
      return rows.map(toEvaluation);
    } catch (error) {
      console.error("EventService.getAdminEvals error:", error);
      return [];
    }
  }
}
