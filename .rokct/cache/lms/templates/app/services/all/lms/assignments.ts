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
  Assignment,
  Submission,
} from "@/app/actions/handson/all/lms/assignments/types";

export class AssignmentService extends BaseService {
  /**
   * Get Assignment Definition
   */
  static async getAssignment(
    assignmentName: string,
  ): Promise<Assignment | null> {
    return await this.getDoc("LMS Assignment", assignmentName);
  }

  /**
   * Get Existing Submission
   */
  static async getSubmission(
    assignmentName: string,
    member: string,
  ): Promise<Submission | null> {
    const list = await this.getList("LMS Assignment Submission", {
      filters: {
        assignment: assignmentName,
        member: member,
      },
      fields: [
        "name",
        "status",
        "answer",
        "assignment_attachment",
        "comments",
        "grade",
        "owner",
        "creation",
      ],
      limit_page_length: 1,
    });
    return list[0] || null;
  }

  /**
   * Create or Update Submission
   */
  static async submitAssignment(doc: any) {
    // If name exists, update; else insert
    if (doc.name) {
      return await this.call("frappe.client.save", { doc });
    } else {
      return await this.call("frappe.client.insert", { doc });
    }
  }
}
