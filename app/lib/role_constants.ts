/**
 * Role lists the host's role gates (`app/lib/roles.ts`) check against the
 * platform's `Has Role` rows. Kept out of `roles.ts` because that file is a
 * `"use server"` module and may only export async functions.
 *
 * Mirrors RokctAI/rokctai_frontend's `app/lib/role_constants.ts`, trimmed to
 * what this shell composes: rokctapp's HR / CRM / supply-chain / finance /
 * lending / hosting / telephony lists have no consumer here.
 */
export const SYSTEM_ROLES = ["System Manager", "Administrator"];

export const LMS_ROLES = [
  "LMS Student",
  "LMS Instructor",
  "System Manager",
  "Administrator",
];
