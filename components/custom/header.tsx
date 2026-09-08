"use client";

/**
 * Host-owned landing header seam. Named in base_sdk's manifest `requires`
 * and rendered by its `components/custom/landing-content.tsx`.
 *
 * NEUTRAL BY DESIGN. RokctAI/rokctai_frontend's copy is a ~670-line
 * marketing header: mega-menu, theme toggle, remote branding, react-icons.
 * Mirroring it would (a) put a second, divergent visual identity in this
 * repo and (b) drag `react-icons` in for a surface no visitor of this shell
 * reaches today. This copy keeps the same public API — `loginUrl`,
 * `signupUrl`, `session` — and renders the wordmark, the theme toggle and
 * the two auth links, nothing more. Replace it wholesale when this shell
 * grows a real product header; do not grow one out of it.
 *
 * The theme toggle IS carried over (same path and prop signature as
 * rokctai_frontend's `components/custom/theme-toggle.tsx`), because without
 * a control the `dark` class on <html> is not reachable at all and every
 * `dark:` variant in this file and in the composed auth pages is dead CSS.
 */
import Link from "next/link";

import { Branding } from "@/components/custom/branding";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import t from "@/app/lib/i18n";

export function Header({
  loginUrl = "/login",
  signupUrl = "/register",
  session = null,
  openLoginPopup,
  openSignupPopup,
}: {
  loginUrl?: string;
  signupUrl?: string;
  session?: any;
  /** auth_sdk's login/register pages pass these instead of URLs. */
  openLoginPopup?: () => void;
  openSignupPopup?: () => void;
}) {
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Branding className="text-xl" />
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {/* Sits ahead of the auth actions in both states, so the Sign up
              pill stays the right-most element. Tokens, not literal colours:
              text-muted-foreground/text-foreground are the themed equivalent
              of the black/70 - white/70 pair the links use. */}
          <ThemeToggle className="-mr-1 text-muted-foreground hover:text-foreground" />

          {user ? (
            <span className="text-black/70 dark:text-white/70">
              {user.email ?? user.name ?? ""}
            </span>
          ) : (
            <>
              <Link
                href={loginUrl}
                onClick={openLoginPopup}
                className="text-black/70 dark:text-white/70"
              >
                {t("auth.login")}
              </Link>
              <Link
                href={signupUrl}
                onClick={openSignupPopup}
                className="rounded-full bg-black px-4 py-2 font-semibold text-white dark:bg-white dark:text-black"
              >
                {t("auth.signup")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
