## 1.5.0

* **`/register` shipped a literally blank page, and this fixes it.** The whole
  page sat inside `<Suspense fallback={null}>` because `RegisterPageInner`
  calls `useSearchParams()` to read `?plan=`. A client component that reads
  `useSearchParams()` makes Next bail its enclosing Suspense boundary out to
  client rendering during static prerendering, so the only thing that reached
  the HTML was that boundary's fallback - and the fallback was `null`. The
  served document for `/register` contained zero `<form>` elements, zero
  `<input>` elements, a `<div hidden></div>` and a
  `BAILOUT_TO_CLIENT_SIDE_RENDERING` template: a blank white page until the JS
  bundle downloaded and executed, and a blank page forever if it did not.
  `useSearchParams()` is now confined to `PlanFromQuery`, a leaf that renders
  `null` and hands the value up, wrapped in its own boundary. The bailout is
  confined with it, so the registration form server-renders as ordinary HTML.
  The page-level boundary is kept but its fallback is now a real card-shaped
  skeleton rather than `null`, so a future hook that bails lands on a
  placeholder instead of blanking the route again.
  `components/custom/auth-form.tsx` gained a one-line
  `useEffect` that syncs `activePlan` when `selectedPlan` arrives after the
  first render - `useState(selectedPlan || "Free")` reads its initial value
  once, so without it the deep link `/register?plan=X` would have silently
  stopped preselecting the plan.
* **The auth screens are theme-token driven, so every shell themes itself.**
  Login and register hardcoded Rokct's indigo/purple: `bg-gradient-to-r
  from-indigo-600 to-purple-600` on both submit buttons, an indigo/purple
  gradient behind the login logo, `text-indigo-600` links, and the
  `border-indigo-500/20 ring-indigo-500/10 focus-visible:ring-indigo-500`
  voucher field in `auth-form.tsx`. A host's `--primary` was already correct
  and already served - it was simply painted over, because a gradient is a
  `background-image` and renders on top of `.bg-primary`'s
  `background-color`. Every one of those is now the token: `bg-primary` /
  `hover:bg-primary/90` / `text-primary-foreground` on the buttons (the
  gradient is gone, not restyled - leaving it would overpaint again),
  `text-primary` on links and the voucher label, `border-primary/20` and
  `focus-visible:ring-ring` on the voucher input. The surrounding chrome moved
  off raw greys onto `bg-background`, `bg-card`, `border-border`,
  `text-foreground` and `text-muted-foreground` for the same reason: the
  hardcoded `bg-gray-50` / `bg-white` / `text-gray-900` card ignored the host's
  own light/dark tokens.
  `components/custom/submit-button.tsx` no longer forces `text-white` on every
  submit button; `components/ui/button.tsx`'s default variant already supplies
  `text-primary-foreground`, and the hardcoded white made a light-primary shell
  unreadable.
  **This is a visible change to rokct.ai as well as to supacharge.app.**
  rokctai_frontend composes auth_sdk too, so its login and register now render
  in its own `--primary` instead of the indigo/purple gradient. That is the
  point of the change - each shell themes itself - but it is not confined to
  one product.
* **New requirement: `components/custom/brand-logo.tsx`.** The login page drew
  an inline Lucide "layers" glyph on an indigo gradient - a mark belonging to
  no product - and the register page had no mark at all. Both now render
  `<BrandLogo width={56} height={56} />`. This invents no mechanism: the
  component is an existing host seam that `rokctai_frontend` and
  `supacharge-web` both already ship with an identical prop signature
  (`width`, `height`, `className`, `variant`, `showBadge`, `isCircle`,
  `priority`), so it is added to the manifest's `requires` rather than to its
  `installs`, and each shell shows its own mark with no branching in the SDK.
* **`/forgot-password` is no longer white-on-white.** The placeholder page set
  `text-white` on a container with no background of its own, so it was legible
  only because every shell happened to render it on a dark body. It is now
  `bg-background text-foreground`, which is what makes it survive a host whose
  light theme is actually reachable - `/login` links straight to it.
* **The "Or continue with" divider is gone from the login card.** It labelled
  an empty list: this form ships no OAuth or social provider buttons, so the
  divider sat directly above the "Create an account" link. Restore it in the
  same commit that adds the first provider button.
* The install surface and `install.py` are untouched - `install.py`'s sha256 is
  unchanged, so the protocol's `supacharge.json` / `rokctapp.json` pins still
  hold. `manifest.json` changes only in `version` and in one added `requires`
  entry; no `installs` entry is added, moved or removed.

## 1.4.1

* **`db/index.ts` no longer needs a database to BUILD.** The module read
  `POSTGRES_URL` and constructed the postgres client at import time, throwing
  `POSTGRES_URL environment variable is not set` from module scope. `next build`
  imports it while collecting page data for the auth handler
  (`app/(auth)/api/auth/[...nextauth]/route.ts` -> `app/(auth)/auth.ts` ->
  `@/db`), so any host composing auth_sdk without `POSTGRES_URL` in its BUILD
  environment died with `Failed to collect page data for
  /api/auth/[...nextauth]` - even though nothing needs a database to compile.
  This took supacharge-web's production deploy red on Vercel, where the
  variable is a runtime value and is not present at build time.
  The connection is now created lazily on first use and memoised, so the client
  is still constructed exactly once per process and pooling is unchanged. The
  exported `db` is a transparent proxy around it: callers keep writing
  `db.select()...` / `db.insert()...` with no change at any call site
  (`app/(auth)/auth.ts`, `app/(auth)/actions.ts`,
  `app/services/control/global_settings.ts`).
  **Runtime behaviour is deliberately identical:** the guard still exists and
  still throws the same `Error` with the same message - on the first query
  instead of on import. There is no default connection string and no silent
  fallback; a request that touches the database with `POSTGRES_URL` unset fails
  exactly as loudly as before. Hosts no longer need to feed the build a
  throwaway connection string to get a green build, which is what was masking
  the missing variable in the first place.
* Auth logic, the install surface and `install.py` are untouched (`install.py`
  sha256 is unchanged, so the protocol's `supacharge.json` / `rokctapp.json`
  pins still hold). The only changed file is
  `auth/nextjs/templates/db/index.ts`.

## 1.4.0

* **The templates type-check under a host that does not set
  `typescript.ignoreBuildErrors`.** RokctAI_frontend masks type errors in
  its `next.config.mjs`; the supacharge-web shell does not, and composing
  auth_sdk 1.3.0 into it left `next build` red on four errors inside files
  this SDK installs (host files were clean):
  * `app/(auth)/actions.ts` - the PaaS-provisioning path inserted a `User`
    row without `id`. `db/schema.ts` declares `User.id` as
    `varchar(255).primaryKey().notNull()` with no default ("Matching Frappe
    User ID (Email)", migration 0001), so the insert was both a TS2769 and
    a runtime NOT NULL violation. The insert now sets `id: email`, the same
    value the column's comment and the rest of the auth flow key users by.
  * `components/custom/paas-login.tsx` - `useActionState(login, undefined)`
    passed `undefined` where `login` takes an `ActionState`, and the failure
    toast read `state.message`, a field `ActionState` does not have
    (TS2769 / TS2339 / TS2554). The hook is now typed
    `useActionState<ActionState, FormData>(login, { status: "idle" })` and
    the toast shows `state.error`, the field `login` actually populates.
  No runtime behaviour changes for a working flow: the `idle` initial state
  renders exactly as `undefined` did (both `useEffect` branches check
  `state?.status`), and the failure toast now shows the server's error text
  instead of `undefined`.
* **New install: `components/custom/session-provider.tsx`** - the
  `"use client"` wrapper around `next-auth/react`'s `SessionProvider`,
  byte-identical to RokctAI_frontend's host copy. base_sdk's
  `components/custom/app-sidebar.tsx` and `components/custom/nav/team-switcher.tsx`
  call `useSession()`, which throws (a 500 on `/manager` and
  `/manager/reports`) unless a `SessionProvider` is mounted above them; in
  RokctAI_frontend that provider is a host file mounted by the host's
  `app/layout.tsx`. It is next-auth's provider, so it ships with the SDK
  that owns next-auth. **Host contract (same pattern as the other three
  seams):** the host's `app/layout.tsx` imports
  `{ SessionProvider } from "@/components/custom/session-provider"` and
  wraps the `<body>` children with it; a shell that must build without
  auth_sdk commits a neutral pass-through copy (`return <>{children}</>`)
  that this install overwrites. Composing into RokctAI_frontend overwrites
  its identical committed copy, so nothing changes there.
* `install.py` is untouched (sha256 `b9b0d415...ae21b`, the digest the
  protocol's `supacharge.json` / `rokctapp.json` pin), and both registries
  reference this SDK at `ref: "main"`, so the fix reaches shells on merge
  without a registry re-pin.

## 1.3.0

* **The last hand-rolled platform calls ride the base kernel's gateway
  client.** `app/(auth)/auth.ts` sends the `api.user.login` cmd through
  `platformCall` from `@/app/services/base/platform-gateway` (base_sdk >=
  1.3.0) with `requireAuth: false` and `session: null` — there is no session
  yet, this is the login — plus an explicit `baseUrl`, so the call never
  reads the request scope; `throwOnError` keeps the raw fetch's outcomes (a
  non-2xx answer or a connection failure both end in `return null`, the
  latter still logged as "PaaS Login connection failed").
  `app/(auth)/actions.ts` sends the two provisioning calls as the
  `control:provision_service_subscription` and
  `control:provision_new_tenant` cmds the control app registers, with the
  admin credentials as an explicit `Authorization` header and a 60s timeout
  (the raw fetch had none; provisioning runs well past the client's 10s
  default). A non-2xx answer maps to the same "Service/Tenant Provisioning
  failed" result as before; the response body's `message`, which Frappe only
  sets on success anyway, is no longer read for the error text.
* `get_pricing_metadata` stays on its per-method URL: the control site
  registers no `control:` gateway cmd for it, so it cannot ride the gateway
  yet (noted inline). The session-seam comment in `app/lib/session.ts` now
  names the kernel's `app/services/base/session.ts` reader instead of the
  retired shell helper `app/lib/paas-gateway.ts`. No install, integration,
  requirement or seam changes; `requires` already named
  `app/services/base/platform-gateway.ts`.

## 1.2.0

* **Drop `app/(chat)/page.tsx` from installs; the root route is owned by
  agent_sdk (owner ruling 2026-09-03).** Both auth_sdk and agent_sdk
  installed the same file, so the last SDK composed decided what "/"
  rendered. The template `templates/app/(chat)/page.tsx` is deleted and
  its install entry removed; agent_sdk's installer copies the whole
  `app/(chat)` group (including `page.tsx`), so the route now has exactly
  one owner. No other install, integration, requirement or seam changes.

## 1.1.0

* **The auth templates ride the universal platform gateway instead of
  per-method URLs.** Ports RokctAI_frontend commit `b752351` ("ride
  remaining non-paas per-method calls on the platform gateway", #105) into
  the three templates it touched, so the gateway conversion survives the
  removal of the frontend's own copies of these files:
  * `app/(auth)/actions.ts` - `refreshTokens` posts
    `platformCall("api.auth.refresh", { refresh_token })` (the prefix-free
    auth manifest key) instead of `/api/method/rcore.api.auth.refresh`;
    `getIndustries` rides `platformCall("frappe.client.get_list", ...)`
    with the admin `Authorization` header instead of the per-method URL.
  * `app/(auth)/auth.ts` - the post-login subscription lookup calls
    `platformCall("control:get_my_subscription")` (GET, cookie-authenticated)
    instead of `/api/method/control.control.api.subscription.get_my_subscription`.
  * `lib/actions/getSubscriptionPlans.ts` - fetches
    `platformCall("control:get_subscription_plans", { category })` with
    `cache: "no-store"` instead of the `/api/v1/method/...` URL, and
    validates `{ message }` through the existing zod schema.
* The seed-time fixes carried since 1.0.0 (the `getSubscriptionPlans` and
  `PLATFORM_NAME` imports, the Suspense boundary around `useSearchParams`
  on `/register`) are kept. The deliveryplatform-specific behaviour
  (always-paas login, `/paas/dashboard` landing, trimmed `Message` type,
  `GlobalSettingsRecord` seam type) is unchanged.

## 1.0.0

* Initial nextjs half of auth_sdk (deliveryplatform wave): the app/(auth)
  route group, PaaSLogin form, drizzle/Postgres persistence and the three
  host seams (middleware, session, global settings).
