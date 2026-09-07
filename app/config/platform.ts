/**
 * Host-owned platform/branding seam. Named in base_sdk's manifest
 * `requires`; read by the SDK-installed team switcher, hero config and by
 * this shell's `components/custom/branding.tsx` / `brand-logo.tsx`.
 *
 * Deliberately NEUTRAL. `PLATFORM_NAME` is derived from `app/site.ts`, the
 * single source of truth this shell already ships, so composing SDKs cannot
 * change what the public site calls itself. The remote-branding resolver in
 * RokctAI/rokctai_frontend's copy of this file is not mirrored: it depends
 * on `@/app/actions/branding`, a control-plane server action this shell does
 * not compose. Both resolvers therefore answer with the local name.
 */
import { SITE_NAME } from "@/app/site";

export const PLATFORM_NAME = SITE_NAME;

/** Shape the SDK-installed branding consumers read. */
export interface PlatformBranding {
  name: string;
  code: string;
  showBeta: boolean;
  before: string;
  after: string;
  style: Record<string, unknown>;
}

const LOCAL_BRANDING: PlatformBranding = {
  name: PLATFORM_NAME,
  code: "",
  showBeta: false,
  before: PLATFORM_NAME,
  after: "",
  style: {},
};

/**
 * Synchronous branding for first paint. No localStorage read: this shell has
 * no remote branding to cache, so there is nothing that could differ between
 * the server render and the client one.
 */
export function getBrandingSync(): PlatformBranding {
  return LOCAL_BRANDING;
}

/** Async resolver with the same contract; resolves to the local branding. */
export async function getGuestBranding(
  _force = false,
): Promise<PlatformBranding> {
  return LOCAL_BRANDING;
}

/** The plain platform name, as a string. */
export const getBranding = () => PLATFORM_NAME;
