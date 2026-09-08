import "server-only";

/**
 * Host-owned gateway RPC. Mirrors RokctAI/rokctai_frontend's
 * `app/lib/gateway-rpc.ts`: every call POSTs `{ cmd, payload }` to the ONE
 * universal platform gateway method — never a per-method URL — through the
 * client's own axios instance, which already carries the base URL and the
 * session's token header. The gateway routes `cmd` server-side:
 *
 *  - framework methods: the full dotted frappe path
 *    (e.g. `frappe.client.get_list`);
 *  - tenant-side methods: prefix-free dotted manifest keys
 *    (e.g. `lms.lms.api.get_all_courses`);
 *  - control-side methods: verbatim `control:<name>`.
 *
 * rokctai_frontend imports the method name from base_sdk's composed
 * `app/services/base/platform-gateway.ts`; this file is committed on the
 * bare shell, where nothing composed exists, so the path is spelled out
 * here. It is the same value base_sdk's `gateway-constants.ts` exports and
 * `.env.example` documents; change both or neither.
 *
 * Returns the response body's `message` — the value the whitelisted method
 * returned (Frappe wraps it in a single top-level envelope; base_sdk's
 * `platformCall` unwraps it the same way). Throws on any non-2xx response
 * (axios semantics), so callers' try/catch keep working.
 */
import type { FrappeApp } from "frappe-js-sdk";

export const PLATFORM_GATEWAY_PATH = "/api/v1/method/rokct.platform.api";

export async function gatewayCall<T = any>(
  client: FrappeApp,
  cmd: string,
  payload: Record<string, unknown> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const res = await client.axios.post(
    PLATFORM_GATEWAY_PATH,
    { cmd, payload },
    headers ? { headers } : undefined,
  );
  const body = res.data as { message?: T } | T;
  if (body && typeof body === "object" && "message" in (body as object)) {
    return (body as { message?: T }).message as T;
  }
  return body as T;
}
