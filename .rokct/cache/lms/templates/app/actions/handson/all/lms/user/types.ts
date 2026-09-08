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

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  full_name: string;
  bio?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  user_image?: string;
  interest?: string;
  occupation?: string;
}

export interface LMSCertificate {
  name: string;
  course: string;
  course_title: string;
  issue_date: string;
  certificate_url?: string;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
}
