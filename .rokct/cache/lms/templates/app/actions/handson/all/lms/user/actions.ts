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

"use server";

import { UserService } from "@/app/services/all/lms/user";
import { getCurrentSession } from "@/app/(auth)/actions";
import { verifyLmsRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function fetchUserInfo() {
  if (!(await verifyLmsRole())) return null;
  return await UserService.getUserInfo();
}

export async function fetchStreakInfo() {
  if (!(await verifyLmsRole())) return null;
  return await UserService.getStreakInfo();
}

export async function fetchProfile() {
  if (!(await verifyLmsRole())) return null;
  return await UserService.getProfile();
}

export async function updateProfileAction(data: any) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  try {
    const res = await UserService.updateProfile(data);
    revalidatePath("/handson/all/lms/profile");
    return res;
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function fetchCertificates() {
  if (!(await verifyLmsRole())) return [];
  return await UserService.getCertificates();
}

/**
 * Roles that see the Instructor link: the instructor page's reads are
 * System Manager on the server, and LMS Instructors author courses.
 */
const INSTRUCTOR_NAV_ROLES = ["System Manager", "Administrator", "LMS Instructor"];

export interface LmsNavLink {
  href: string;
  label: string;
  description: string;
}

/**
 * The LMS dashboard's quick links. My Children is for any signed-in LMS
 * user (a parent adds their first child there); Instructor only for
 * System Managers and instructors.
 */
export async function fetchLmsNavLinks(): Promise<LmsNavLink[]> {
  if (!(await verifyLmsRole())) return [];
  const links: LmsNavLink[] = [
    {
      href: "/handson/all/lms/children",
      label: "My Children",
      description: "Grades R-3 child profiles on your account",
    },
  ];
  if (await UserService.hasAnyRole(INSTRUCTOR_NAV_ROLES)) {
    links.push({
      href: "/handson/all/lms/instructor",
      label: "Instructor",
      description: "Your courses, cohorts, live classes and homework",
    });
  }
  return links;
}
