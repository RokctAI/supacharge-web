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
      return (
        (await this.call("lms.lms.utils.get_discussion_topics", {
          doctype,
          docname,
          single_thread: singleThread,
        })) ?? []
      );
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
      return await this.call("frappe.desk.form.save.savedocs", {
        doc: {
          doctype: "Discussion Topic",
          reference_doctype: doctype,
          reference_docname: docname,
          title: title,
        },
        action: "Save",
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
      return (
        (await this.call("lms.lms.utils.get_discussion_replies", {
          topic: topic,
        })) ?? []
      );
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
      return await this.call("frappe.desk.form.save.savedocs", {
        doc: {
          doctype: "Discussion Reply",
          topic: topic,
          reply: reply,
        },
        action: "Save",
      });
    } catch (error) {
      console.error("DiscussionService.createReply error:", error);
      throw error;
    }
  }
}
