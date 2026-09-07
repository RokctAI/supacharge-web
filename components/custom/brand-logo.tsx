"use client";

/**
 * Host-owned logo seam. Named in base_sdk's manifest `requires` and
 * rendered by its landing hero.
 *
 * NEUTRAL BY DESIGN — and asset-free. This shell ships no logo file (its
 * public face is the type-only holding page in `app/page.tsx`), so the mark
 * is the platform initial on the shell's own background colour rather than
 * an invented graphic. Every prop of rokctai_frontend's richer component is
 * accepted so SDK callers type-check unchanged.
 */
import { PLATFORM_NAME } from "@/app/config/platform";

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
  // Accepted for API parity with the SDK's callers; this shell has no image
  // asset, theme variants or beta badge to switch on.
  void variant;
  void showBadge;
  void priority;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        isCircle ? "rounded-full" : "rounded-[5px]"
      } ${className || ""}`}
      style={{
        width,
        height,
        minWidth: width,
        minHeight: height,
        // The holding page's own two colours (see app/layout.tsx).
        background: "#0B0B0F",
        color: "#F5F5F7",
        fontWeight: 700,
        fontSize: Math.round(height * 0.55),
        lineHeight: 1,
      }}
      aria-label={PLATFORM_NAME}
    >
      {PLATFORM_NAME.charAt(0)}
    </div>
  );
}

export default BrandLogo;
