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
