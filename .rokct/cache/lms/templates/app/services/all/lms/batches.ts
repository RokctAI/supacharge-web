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
import { Batch } from "@/app/actions/handson/all/lms/batches/types";

export class BatchService extends BaseService {
  /**
   * Get user's batches.
   */
  static async getMyBatches(): Promise<Batch[]> {
    try {
      return (await this.call("lms.lms.api.get_my_batches")) ?? [];
    } catch (error) {
      console.error("BatchService.getMyBatches error:", error);
      return [];
    }
  }

  /**
   * Admin: Get created batches.
   */
  static async getCreatedBatches() {
    try {
      return await this.call("lms.lms.api.get_created_batches");
    } catch (error) {
      console.error("BatchService.getCreatedBatches error:", error);
      return [];
    }
  }
}
