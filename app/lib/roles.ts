"use server";

/**
 * Host-owned role gates. Named in lms_sdk's manifest `requires`
 * (`verifyLmsRole`, which every handson lms server action checks first).
 *
 * Mirrors RokctAI/rokctai_frontend's `app/lib/roles.ts` with two changes
 * forced by what this shell composes:
 *
 *   1. The session comes from the host session seam `@/app/lib/session`
 *      (neutral on the bare shell; auth_sdk overwrites it at compose time)
 *      instead of auth_sdk's `@/app/(auth)/auth`, which the bare shell does
 *      not have. On the bare shell every gate therefore answers false.
 *   2. Only the LMS gate is carried: rokctapp's HR / CRM / supply-chain /
 *      finance / lending / employee-separation gates have no consumer here.
 *
 * The role lookup rides the universal platform gateway (`gatewayCall`:
 * `{ cmd: "frappe.client.get_list", payload }` POSTed to
 * `/api/v1/method/rokct.platform.api`), never a per-method URL.
 */
import { getClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";
import { LMS_ROLES } from "@/app/lib/role_constants";
import { getCurrentSession } from "@/app/lib/session";

async function sessionEmail(): Promise<string | null> {
  const session = (await getCurrentSession()) as {
    user?: { email?: string | null } | null;
  } | null;
  return session?.user?.email ?? null;
}

/** True when the signed-in user holds at least one of `roles`. */
async function hasAnyRole(roles: string[]): Promise<boolean> {
  const email = await sessionEmail();
  if (!email) return false;
  try {
    const client = await getClient();
    const rows = await gatewayCall<{ role: string }[]>(
      client.app,
      "frappe.client.get_list",
      {
        doctype: "Has Role",
        filters: { parent: email, role: ["in", roles] },
        fields: ["role"],
        limit_page_length: 1,
      },
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch (e) {
    console.error("Role check failed", e);
    return false;
  }
}

/**
 * Verifies that the current user is an LMS Student, LMS Instructor,
 * System Manager or Administrator.
 */
export async function verifyLmsRole(): Promise<boolean> {
  return hasAnyRole(LMS_ROLES);
}
