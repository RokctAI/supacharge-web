import "server-only";

/**
 * Host-owned gateway service base. Named in lms_sdk's manifest `requires`
 * (`BaseService`, which every `app/services/all/lms/*` service extends).
 *
 * Mirrors RokctAI/rokctai_frontend's `app/services/common/base.ts`: a static
 * wrapper over the host PaaS client (`@/app/lib/client`, credentials from
 * the session seam) and the universal platform gateway
 * (`@/app/lib/gateway-rpc`: `{ cmd, payload }` POSTed to
 * `/api/v1/method/rokct.platform.api`), never a per-method URL.
 *
 * One deliberate difference: `call` returns the method's return value
 * (the body's `message`, the way base_sdk's `platformCall` unwraps it), not
 * the `{ message }` envelope. The lms services consume it that way
 * (`courses.map(...)`, `count > 0`, `?? []`) — rokctai_frontend's copy
 * preserved the envelope for callers that read `response?.message`, of
 * which this shell has none.
 */
import { getClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export interface ServiceOptions {
  headers?: Record<string, string>;
}

export class BaseService {
  /**
   * Executes a whitelisted dotted method against the session's site
   * through the platform gateway and returns what the method returned.
   */
  public static async call<T = any>(
    method: string,
    args: Record<string, unknown> = {},
    options: ServiceOptions = {},
  ): Promise<T> {
    const client = await getClient();
    return gatewayCall<T>(client.app, method, args, options.headers);
  }

  public static async getList<T = any>(
    doctype: string,
    args: Record<string, unknown> = {},
    options: ServiceOptions = {},
  ): Promise<T[]> {
    const rows = await this.call<T[]>(
      "frappe.client.get_list",
      { doctype, ...args },
      options,
    );
    return rows ?? [];
  }

  public static async getDoc<T = any>(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ): Promise<T> {
    return this.call<T>("frappe.client.get", { doctype, name }, options);
  }

  /** Alias for getDoc — kept because rokctai_frontend's services call it. */
  public static async get<T = any>(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ): Promise<T> {
    return this.getDoc<T>(doctype, name, options);
  }

  public static async insert<T = any>(
    doc: Record<string, unknown>,
    options: ServiceOptions = {},
  ): Promise<T> {
    return this.call<T>("frappe.client.insert", { doc }, options);
  }

  public static async setValue(
    doctype: string,
    name: string,
    fieldname: Record<string, unknown> | string,
    options: ServiceOptions = {},
  ) {
    return this.call(
      "frappe.client.set_value",
      { doctype, name, fieldname },
      options,
    );
  }

  public static async delete(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    return this.call("frappe.client.delete", { doctype, name }, options);
  }

  public static async submit(
    doc: Record<string, unknown>,
    options: ServiceOptions = {},
  ) {
    return this.call("frappe.client.submit", { doc }, options);
  }

  public static async cancel(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    return this.call("frappe.client.cancel", { doctype, name }, options);
  }
}
