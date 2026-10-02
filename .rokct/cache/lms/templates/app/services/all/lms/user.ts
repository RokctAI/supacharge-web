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
import { getCurrentSession } from "@/app/(auth)/actions";
import {
  UserProfile,
  LMSCertificate,
  UserStreak,
} from "@/app/actions/handson/all/lms/user/types";

export class UserService extends BaseService {
  /**
   * Get details of the currently logged-in user.
   */
  static async getUserInfo(): Promise<UserProfile | null> {
    try {
      // The base session user: Frappe's user id is the email the session
      // signed in with. No LMS-specific profile call exists in rlms.
      const session = await getCurrentSession();
      const user = session?.user as
        | { email?: string | null; name?: string | null; image?: string | null }
        | undefined;
      if (!user?.email) return null;
      return {
        name: user.email,
        email: user.email,
        username: user.email,
        full_name: user.name ?? user.email,
        user_image: user.image ?? undefined,
      };
    } catch (error) {
      console.error("UserService.getUserInfo error:", error);
      return null;
    }
  }

  /**
   * True when the signed-in user holds any of `roles` (a Has Role read
   * on their own user). Drives which LMS links the dashboard shows; the
   * pages behind them still enforce their own rules on the server.
   */
  static async hasAnyRole(roles: string[]): Promise<boolean> {
    try {
      const session = await getCurrentSession();
      const email = (session?.user as { email?: string | null } | undefined)
        ?.email;
      if (!email) return false;
      const rows = await this.getList("Has Role", {
        filters: { parent: email, role: ["in", roles] },
        fields: ["role"],
        limit_page_length: 1,
      });
      return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
      console.error("UserService.hasAnyRole error:", error);
      return false;
    }
  }

  /**
   * Get user streak info.
   */
  static async getStreakInfo(): Promise<UserStreak | null> {
    try {
      // api.lms.my_streak answers { current_streak, best_streak }.
      const data = await this.call<{
        current_streak?: number;
        best_streak?: number;
      }>("api.lms.my_streak");
      if (!data || typeof data !== "object") return null;
      return {
        current_streak: data.current_streak ?? 0,
        longest_streak: data.best_streak ?? 0,
      };
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
