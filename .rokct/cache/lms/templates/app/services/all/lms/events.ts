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

export class EventService extends BaseService {
  /**
   * Get user's upcoming live classes.
   */
  static async getMyLiveClasses(): Promise<LiveClass[]> {
    try {
      return (await this.call("lms.lms.api.get_my_live_classes")) ?? [];
    } catch (error) {
      console.error("EventService.getMyLiveClasses error:", error);
      return [];
    }
  }

  /**
   * Get upcoming evaluations.
   */
  static async getUpcomingEvaluations(
    courses?: string[],
    batch?: string,
  ): Promise<Evaluation[]> {
    try {
      return (
        (await this.call("lms.lms.utils.get_upcoming_evals", {
          courses,
          batch,
        })) ?? []
      );
    } catch (error) {
      console.error("EventService.getUpcomingEvaluations error:", error);
      return [];
    }
  }

  /**
   * Admin: Get all live classes.
   */
  static async getAdminLiveClasses() {
    try {
      return await this.call("lms.lms.api.get_admin_live_classes");
    } catch (error) {
      console.error("EventService.getAdminLiveClasses error:", error);
      return [];
    }
  }

  /**
   * Admin: Get all evaluations.
   */
  static async getAdminEvals() {
    try {
      return await this.call("lms.lms.api.get_admin_evals");
    } catch (error) {
      console.error("EventService.getAdminEvals error:", error);
      return [];
    }
  }
}
