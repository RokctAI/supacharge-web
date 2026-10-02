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
import type {
  ChildInput,
  ChildProfile,
  ChildWeek,
  ClaimCode,
} from "@/app/actions/handson/all/lms/children/types";

/**
 * Parent-side child profiles (Grades R-3) on the web, over the same rlms
 * commands the app uses: partner_children, partner_add_child,
 * partner_update_child, partner_archive_child and
 * partner_issue_child_claim_code. Each child's progress is the partner
 * weekly report (partner_weekly_report) for its learner account. The
 * server resolves every child against the caller's own account.
 * No child mode and no "Who's learning?" picker on the web.
 */
export class ChildrenService extends BaseService {
  static async list(includeArchived = false): Promise<ChildProfile[]> {
    const res = await this.call("api.lms.partner_children", {
      include_archived: includeArchived ? 1 : 0,
    });
    return res?.children ?? [];
  }

  static async add(input: ChildInput, consent: boolean) {
    return (
      await this.call("api.lms.partner_add_child", {
        ...input,
        relationship: "parent",
        consent: consent ? 1 : 0,
      })
    )?.child as ChildProfile;
  }

  static async update(child: string, input: Partial<ChildInput>) {
    return (
      await this.call("api.lms.partner_update_child", { child, ...input })
    )?.child as ChildProfile;
  }

  static async archive(child: string) {
    return await this.call("api.lms.partner_archive_child", { child });
  }

  static async issueClaimCode(child: string): Promise<ClaimCode> {
    return await this.call("api.lms.partner_issue_child_claim_code", { child });
  }

  static async week(student: string, weekStart: string): Promise<ChildWeek> {
    return await this.call("api.lms.partner_weekly_report", {
      week_start: weekStart,
      student,
    });
  }
}
