"use client";

/**
 * Host-owned wordmark seam. Named in base_sdk's manifest `requires` and
 * rendered by its landing hero.
 *
 * NEUTRAL BY DESIGN. It prints the name this shell already shows — the
 * `SITE_NAME` in `app/site.ts`, via `@/app/config/platform` — and nothing
 * else. RokctAI/rokctai_frontend's copy resolves a remote branding record
 * (name/country-code/beta badge) through a control-plane server action this
 * shell does not compose; mirroring that here would put a second, divergent
 * identity in front of visitors. Keep this file dumb: change `app/site.ts`
 * if the name ever changes.
 */
import { PLATFORM_NAME } from "@/app/config/platform";

export function Branding({
  showBadge = false,
  forceWhite = false,
  className,
}: {
  showBadge?: boolean;
  forceWhite?: boolean;
  className?: string;
}) {
  // showBadge is accepted for API parity with the SDK's callers; this shell
  // has no country-code badge to show.
  void showBadge;

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`${className || "text-2xl"} font-sans font-bold tracking-tight leading-none ${
          forceWhite ? "text-white" : "text-black dark:text-white"
        }`}
      >
        {PLATFORM_NAME}
      </span>
    </span>
  );
}

export default Branding;
