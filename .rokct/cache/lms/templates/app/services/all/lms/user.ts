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
  UserProfile,
  LMSCertificate,
} from "@/app/actions/handson/all/lms/user/types";

export class UserService extends BaseService {
  /**
   * Get details of the currently logged-in user.
   */
  static async getUserInfo(): Promise<UserProfile | null> {
    try {
      return await this.call("lms.lms.api.get_user_info");
    } catch (error) {
      console.error("UserService.getUserInfo error:", error);
      return null;
    }
  }

  /**
   * Get user streak info.
   */
  static async getStreakInfo() {
    try {
      return await this.call("lms.lms.api.get_streak_info");
    } catch (error) {
      console.error("UserService.getStreakInfo error:", error);
      return null;
    }
  }

  /**
   * Get user profile details
   */
  static async getProfile() {
    return await this.call("frappe.client.get", {
      doctype: "User",
      name: "me", // 'me' maps to current user in Frappe
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: any) {
    return await this.call("frappe.client.save", {
      doc: {
        doctype: "User",
        name: "me",
        ...data,
      },
    });
  }

  /**
   * Get user certificates
   */
  static async getCertificates(): Promise<LMSCertificate[]> {
    return await this.getList("LMS Certificate", {
      filters: {
        member: "me",
      },
      fields: [
        "name",
        "course",
        "course_title",
        "creation",
        "certificate_link",
      ],
      order_by: "creation desc",
    });
  }
}
