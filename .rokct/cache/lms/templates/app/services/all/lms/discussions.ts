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
  DiscussionReply,
  DiscussionTopic,
} from "@/app/actions/handson/all/lms/discussions/types";

/**
 * Discussions on rlms (LMS Discussion Post): per course, optionally per
 * lesson. Enrolled learners and System Managers read and post; the server
 * checks. [doctype] picks the scope: "Course Lesson" is a lesson's
 * thread, anything else (normally "LMS Course") the course-wide one.
 * Bodies are plain text.
 */
function scope(doctype: string, docname: string) {
  return doctype === "Course Lesson"
    ? { lesson: docname }
    : { course: docname };
}

export class DiscussionService extends BaseService {
  /**
   * Get discussion topics for a document (lesson, course, etc.)
   */
  static async getTopics(
    doctype: string,
    docname: string,
    singleThread = false,
  ): Promise<DiscussionTopic[]> {
    try {
      const rows: any[] =
        (await this.call(
          "api.lms.discussion_topics",
          scope(doctype, docname),
        )) ?? [];
      return rows.map((r) => ({
        name: r.name,
        title: r.title,
        owner: r.owner_name,
        creation: r.creation,
        reference_doctype: doctype,
        reference_docname: docname,
      }));
    } catch (error) {
      console.error("DiscussionService.getTopics error:", error);
      return [];
    }
  }

  /**
   * Create a new discussion topic
   */
  static async createTopic(doctype: string, docname: string, title: string) {
    try {
      return await this.call("api.lms.create_discussion_topic", {
        ...scope(doctype, docname),
        title,
      });
    } catch (error) {
      console.error("DiscussionService.createTopic error:", error);
      throw error;
    }
  }

  /**
   * Get replies for a topic
   */
  static async getReplies(topic: string): Promise<DiscussionReply[]> {
    try {
      const rows: any[] =
        (await this.call("api.lms.discussion_replies", { topic })) ?? [];
      return rows.map((r) => ({
        name: r.name,
        owner: r.owner_name,
        creation: r.creation,
        modified: r.creation,
        reply: r.reply,
        user: { full_name: r.owner_name, user_image: "" },
      }));
    } catch (error) {
      console.error("DiscussionService.getReplies error:", error);
      return [];
    }
  }

  /**
   * Create a reply
   */
  static async createReply(topic: string, reply: string) {
    try {
      return await this.call("api.lms.create_discussion_reply", {
        topic,
        reply,
      });
    } catch (error) {
      console.error("DiscussionService.createReply error:", error);
      throw error;
    }
  }
}
