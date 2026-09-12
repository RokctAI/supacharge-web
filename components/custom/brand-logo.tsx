"use client";

/**
 * Host-owned logo seam. Named in base_sdk's manifest `requires`; rendered by
 * auth_sdk's login and register views (`<BrandLogo width={56} height={56} />`)
 * and by base_sdk's landing hero.
 *
 * The mark is the Supacharge wordmark - lms_sdk's traced glyphs
 * (`components/custom/landing/lms-wordmark.tsx`, viewBox 0 0 660 124,
 * currentColor), the same vector the Dart app draws. Ray, 2026-09-11 20:39Z:
 * "login register page, no s, full supacharge without .school" - so this is
 * never a letter tile and never the dotted address: the accessible name is
 * "Supacharge", not the PLATFORM_NAME string.
 *
 * Sizing: every caller hands over the square its old letter tile took
 * (56px on the auth pages). A wordmark 56px WIDE would be about 10px tall,
 * so `height` is the wordmark's height and the width follows the glyphs'
 * 660:124 ratio (56px tall is about 298px wide); `max-w-full h-auto` keeps
 * it inside a narrow card. Every prop of rokctai_frontend's richer
 * component is still accepted so SDK callers type-check unchanged.
 */
import { LmsWordmark } from "@/components/custom/landing/lms-wordmark";

const BRAND_LABEL = "Supacharge";

export function BrandLogo({
  width = 24,
  height = 24,
  className,
  variant = "auto",
  showBadge = false,
  isCircle = false,
  priority = false,
}: {
  width?: number;
  height?: number;
  className?: string;
  variant?: "auto" | "light" | "dark" | "inverted";
  showBadge?: boolean;
  isCircle?: boolean;
  priority?: boolean;
}) {
  // Accepted for API parity with the SDK's callers; a wordmark has no theme
  // variants, beta badge or circular crop, and nothing is fetched.
  void variant;
  void showBadge;
  void isCircle;
  void priority;

  // The glyphs' height: the caller's height, or the height its width
  // implies when only a width is meaningful (a wider-than-tall box).
  const glyphHeight = Math.max(height, Math.round((width * 124) / 660));

  return (
    <LmsWordmark
      height={glyphHeight}
      title={BRAND_LABEL}
      className={`max-w-full h-auto text-foreground ${className || ""}`}
    />
  );
}

export default BrandLogo;
