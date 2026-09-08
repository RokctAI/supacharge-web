"use client";

/**
 * Host-owned session-provider seam. auth_sdk (1.4.0+) installs
 * `components/custom/session-provider.tsx`, a next-auth `SessionProvider`
 * wrapper, and base_sdk's app-sidebar / team-switcher call `useSession()`,
 * which throws without a provider above them.
 *
 * Same contract as `app/lib/session.ts`: the bare shell commits a neutral
 * pass-through so it builds and renders without auth_sdk (no auth surface,
 * no sessions); composing auth_sdk overwrites this file with the real
 * NextAuth-backed provider. Do not grow an auth implementation into this
 * file: compose auth_sdk instead.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
