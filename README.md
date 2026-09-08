# supacharge-web

Web shell for the Supacharge product — its web frontend, alongside the existing Flutter app repo.

Spawned by [RokctAI Factory](https://github.com/rokctai/factory) from https://github.com/RokctAI/factory/issues/127.

## Status

**Composed at deploy — the SDK cache is committed, the composed output is not.**

Vercel builds this repo from a commit, so everything the build composes from
has to be in that commit. The vendored SDK cache under `.rokct/cache/` is
therefore committed and pinned by `.rokct/lock.json`, and `vercel.json`'s
`buildCommand` is `bash scripts/compose.sh && npm run build`: compose offline
from the committed cache, then build. No token, no clone and no network reach
the deploy — the model the Dart app shells already use (`paas_manager` and
`paas_driver` both track `.rokct/cache/`).

Composing adds the `/landing`, `/admin`, `/manager` and `/handson/all/lms`
trees and the `/login`, `/register`, `/forgot-password` and
`/api/auth/[...nextauth]` routes the SDKs own; `/` is `lms_sdk`'s page, which
sends anonymous visitors to `/landing`. 43 routes in all.

Nothing composed is committed. Every path an installer writes is listed in the
generated block at the end of [`.gitignore`](.gitignore) — including the four
SDK install targets this shell used to carry a placeholder copy of
(`app/page.tsx`, `app/lib/session.ts`,
`components/custom/session-provider.tsx`, `hooks/use-mobile.tsx`): an SDK owns
each of them, and a placeholder committed over one only drifts against the SDK
copy the build installs. What the repo does commit is the **host layer** the
Next.js SDKs' manifests name under `requires` — `components/ui/*` (shadcn
primitives mirrored from
[`RokctAI/rokctai_frontend`](https://github.com/RokctAI/rokctai_frontend)),
`lib/utils.ts`, `app/config/*`, `app/lib/*`, the `app/handson` host layer and
the `components/custom/*` seams — plus the cache the SDKs come from.

Because those install targets are not in the tree, a bare `npm run build`
without composing first is not a supported build of this shell: run
`bash scripts/compose.sh` first (it needs nothing but the checkout). CI's
`Compose Offline + Build (Vercel parity)` job runs exactly the two commands
Vercel runs and fails if a compose changes anything committed.

The full brief lives in [docs/spec.md](docs/spec.md); the build instructions
for the agent live in [AGENTS.md](AGENTS.md).

## Stack

Next.js 16 (App Router) + React 19 + TypeScript, matching
[`RokctAI/rokctai_frontend`](https://github.com/RokctAI/rokctai_frontend)'s
versions and config style so the two shells stay on one set of conventions.
The `@/*` → `./*` tsconfig path alias is the one the Next.js SDK installer
convention assumes, so composed SDK templates resolve their imports unchanged.

The host layer adds the UI library the composed SDKs import: Radix primitives
wrapped as `components/ui/*`, `class-variance-authority`, `clsx` and
`tailwind-merge` behind `cn()`, plus `lucide-react`, `sonner`,
`react-day-picker` and `frappe-js-sdk`. Versions are pinned to the specs
`rokctai_frontend` and the SDK manifests already use.

**No Tailwind build is configured yet.** The mirrored primitives and the
composed SDK pages carry Tailwind class names because that is how they are
written upstream, but this shell compiles them as plain strings, so the
composed routes render with layout utilities inert. What does apply is plain
CSS the SDKs ship themselves — `lms_sdk`'s `components/custom/landing/
lms-theme.css` token sheet (written to work "in a shell with or without
Tailwind") and `base_sdk`'s `app/styles/rokct-scroll.css`. Wiring Tailwind
(`tailwind.config.ts`, `postcss.config.mjs`, a `globals.css` imported from the
root layout, as `rokctai_frontend` has it) is the next piece of work on this
shell and is deliberately not part of the compose-at-deploy change.

`.npmrc` sets `legacy-peer-deps=true`: `react-day-picker@8` (the version
`components/ui/calendar.tsx` and `base_sdk`'s date-range picker are written
against) declares a `date-fns` peer of `^2 || ^3`, while `base_sdk`'s manifest
declares `date-fns@^4`. The pair works — `rokctai_frontend` ships it under
pnpm — but npm's strict peer resolver refuses the tree.

## Getting started

```bash
bash .rokct/bootstrap.sh   # installs the Rokct agent protocol into this repo

npm install
npm run dev                # http://localhost:3000
```

Composing is part of any build of this shell:

```bash
bash scripts/compose.sh    # offline: composes from the committed .rokct/cache/
npm run build              # what Vercel runs after it, per vercel.json
```

Other commands: `npm start` (serve the build), `npm run typecheck`.

## Configuration

Copy [`.env.example`](.env.example) to `.env.local`. Every variable this shell
reads is documented there. `POSTGRES_URL` must be set for a composed build:
`auth_sdk`'s `db/index.ts` constructs its client at import time and
`next build` imports it, so any syntactically valid URL satisfies the build
even though nothing connects during it.

`NEXT_PUBLIC_SITE_URL` is the only place the public origin is configured — it
is resolved once in [`app/site.ts`](app/site.ts) and defaults to
`https://supacharge.app`. Metadata, the canonical URL, OpenGraph and Twitter
cards, `/robots.txt`, `/sitemap.xml` and the web app manifest all derive from
it, so a preview deployment can advertise its own URL by setting it.

## Composition

`.rokct/config/app_type` names the registry template
(`The-Rokct-Protocol core/utils/frappe/composer/supacharge.json`) that is
canonical for this shell's Next.js composition; the composer
(`The-Rokct-Protocol core/utils/nextjs/sdk_composer.py`) materializes
`composer.json` from it on every compose, copies SDK templates into `app/`
and merges their npm dependencies into `package.json`. The committed
`composer.json` is the offline mirror of that template's `sdks` block — change
the registry template first, then mirror it here so the two do not drift.

The composed SDKs are `telemetry_sdk`, `base_sdk`, `auth_sdk` and `lms_sdk`. The
composed build needs `POSTGRES_URL` set (any syntactically valid URL — see
`.env.example`); `auth_sdk`'s `db/index.ts` throws at import when it is
unset, and `next build` imports it while collecting page data for
`/api/auth/[...nextauth]`. The composer does not
generate the application shell itself: the host layer listed under **Status**
above is host-owned. Each host seam file says in its own header which
`requires` entry it answers and which SDK replaces it when composed — read
those before widening one.

`scripts/compose.sh` has two modes:

| mode | who runs it | what it does |
| --- | --- | --- |
| `bash scripts/compose.sh` | Vercel, CI, developers | Verifies the vendored composer and every cache entry against `.rokct/lock.json`, then runs each cached SDK's `install.py`. Offline: no git, no network, no token. |
| `bash scripts/compose.sh refresh` | a maintainer, or Actions with `MONOREPO_PAT` | Re-fetches the protocol composer and every SDK the registry template names, replaces `.rokct/cache/` wholesale, rewrites `.rokct/lock.json`, the composed-output block in `.gitignore` and `package-lock.json`, and stages the cache. Commit the result to `main`; that commit is what ships the new SDK version. |

The cache is listed in `.gitignore` and committed with `git add -f`. The
ignore rule is there for one reason: the fleet linter's auto-fix runs
`prettier --write . --ignore-path .gitignore` and commits the result, and
reformatting a vendored template would change the content `.rokct/lock.json`
pins — the next deploy would then refuse to compose. `refresh` stages the
cache with `-f` for the same reason.
