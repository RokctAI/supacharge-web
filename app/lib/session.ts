/**
 * Host-owned session seam. Named in base_sdk's manifest `requires` and read
 * by the SDK's own kernel (`app/services/base/session.ts`), which documents
 * this exact contract:
 *
 *   "The bare shell commits a neutral copy of `app/lib/session.ts` whose
 *    functions resolve to null (no auth surface, no sessions); composing
 *    auth_sdk overwrites it with the NextAuth-backed implementation."
 *
 * This shell composes telemetry_sdk and base_sdk only — there is no auth
 * surface — so "no session" is the correct, permanent answer here. Do not
 * grow an auth implementation into this file: compose auth_sdk instead.
 */
export async function getCurrentSession(): Promise<null> {
  return null;
}

export default getCurrentSession;
