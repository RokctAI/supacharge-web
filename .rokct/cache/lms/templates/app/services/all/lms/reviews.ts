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
import { CourseReview } from "@/app/actions/handson/all/lms/reviews/types";

export class ReviewService extends BaseService {
  /**
   * Get reviews for a course
   */
  static async getReviews(courseName: string): Promise<CourseReview[]> {
    try {
      return (
        (await this.call("lms.lms.utils.get_reviews", {
          course: courseName,
        })) ?? []
      );
    } catch (error) {
      console.error("ReviewService.getReviews error:", error);
      return [];
    }
  }

  /**
   * Check if user has already reviewed
   * Note: Uses frappe.client.get_count on 'LMS Course Review'
   */
  static async hasReviewed(courseName: string, user: string): Promise<boolean> {
    try {
      const count = await this.call("frappe.client.get_count", {
        doctype: "LMS Course Review",
        filters: {
          course: courseName,
          owner: user,
        },
      });
      return count > 0;
    } catch (error) {
      console.error("ReviewService.hasReviewed error:", error);
      return false;
    }
  }

  /**
   * Create a review
   */
  static async createReview(
    courseName: string,
    rating: number,
    reviewText: string,
  ) {
    try {
      return await this.call("frappe.desk.form.save.savedocs", {
        doc: {
          doctype: "LMS Course Review",
          course: courseName,
          rating: rating,
          review: reviewText || "",
        },
        action: "Save",
      });
    } catch (error) {
      console.error("ReviewService.createReview error:", error);
      throw error;
    }
  }
}
