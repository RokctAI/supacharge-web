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
import { JobOpening } from "@/app/actions/handson/all/lms/jobs/types";

export class JobService extends BaseService {
  /**
   * Get list of Job Opportunities (Native LMS)
   */
  static async getJobs(): Promise<JobOpening[]> {
    return await this.getList("Job Opportunity", {
      fields: [
        "name",
        "job_title",
        "company",
        "location",
        "status",
        "type",
        "description",
      ],
      filters: {
        status: "Open",
      },
      order_by: "creation desc",
    });
  }

  /**
   * Get Job Details
   */
  static async getJob(jobName: string): Promise<JobOpening | null> {
    return await this.getDoc("Job Opportunity", jobName);
  }
}
