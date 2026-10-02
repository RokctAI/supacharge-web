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

/**
 * Course reviews on rlms (LMS Course Review): api.lms.course_reviews reads
 * (any signed-in user), api.lms.submit_course_review writes (enrolled
 * learners only, one review per course; a second submit updates it).
 */
interface RlmsReviews {
  count: number;
  average: number | null;
  has_reviewed: boolean;
  can_review: boolean;
  reviews: {
    name: string;
    rating: number;
    review: string;
    owner_name: string;
    is_mine: boolean;
    creation: string;
  }[];
}

export class ReviewService extends BaseService {
  private static async read(courseName: string): Promise<RlmsReviews | null> {
    return (
      (await this.call("api.lms.course_reviews", { course: courseName })) ??
      null
    );
  }

  /**
   * Get reviews for a course
   */
  static async getReviews(courseName: string): Promise<CourseReview[]> {
    try {
      const data = await this.read(courseName);
      return (data?.reviews ?? []).map((r) => ({
        name: r.name,
        course: courseName,
        rating: r.rating,
        review: r.review,
        owner: r.owner_name,
        fullname: r.owner_name,
        creation: r.creation,
      }));
    } catch (error) {
      console.error("ReviewService.getReviews error:", error);
      return [];
    }
  }

  /**
   * Whether the caller should NOT be offered the review form: they have
   * reviewed already, or are not enrolled (the server refuses them).
   * [user] is kept for the action's signature; the server knows the caller.
   */
  static async hasReviewed(courseName: string, user: string): Promise<boolean> {
    try {
      const data = await this.read(courseName);
      return !data || data.has_reviewed || !data.can_review;
    } catch (error) {
      console.error("ReviewService.hasReviewed error:", error);
      return true;
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
      return await this.call("api.lms.submit_course_review", {
        course: courseName,
        rating,
        review: reviewText || "",
      });
    } catch (error) {
      console.error("ReviewService.createReview error:", error);
      throw error;
    }
  }
}
