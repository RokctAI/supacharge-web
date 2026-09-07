# supacharge-web

Web shell for the Supacharge product — its web frontend, alongside the existing Flutter app repo.

Spawned by [RokctAI Factory](https://github.com/rokctai/factory) from https://github.com/RokctAI/factory/issues/127.

## Status

**Holding page in public — composed app shell underneath.**

What a visitor sees is still the placeholder: `/` is the Supacharge name, one
line about what it is, and a link to the app download. It exists so
`https://supacharge.app` serves something correct and branded the moment the
domain is pointed at this Vercel project, and it makes no API calls and
fetches no fonts. That public face is unchanged and stays unchanged until
**Build v0** lands; when it does, replace `app/page.tsx` wholesale rather than
growing a product out of it.

Underneath it, the repo is a real composed shell, not a holding page with CI
bolted on. It commits the **host layer** the Next.js SDKs in its
`composer.json` require — `components/ui/*` (shadcn primitives mirrored from
[`RokctAI/rokctai_frontend`](https://github.com/RokctAI/rokctai_frontend)),
`lib/utils.ts`, `hooks/use-mobile.tsx`, `app/config/*`, `app/lib/*` and the
`components/custom/*` seams named in `base_sdk`'s manifest `requires` — so
that `telemetry_sdk` + `base_sdk` compose and **build**. Composing adds the
`/admin`, `/manager` and `/landing` trees those SDKs own; nothing composed is
ever committed, so none of it is served from this repo's `main`.

Two builds are therefore expected to be green at all times, and CI runs both:

| build | what it is | routes |
| --- | --- | --- |
| bare | `npm ci && npm run build` on `main` as committed | 5 |
| composed | compose from the registry template, then build | 29 |

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
`rokctai_frontend` and the SDK manifests already use. The holding page itself
imports none of it — it is still inline styles and a system font stack — so
none of this reaches the bytes `/` serves.

No Tailwind build is configured. The mirrored primitives carry Tailwind class
names because that is how they are written upstream, but this shell compiles
them as plain strings; adding a stylesheet would change what `/` looks like,
which is out of scope until Build v0.

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

Other commands: `npm run build` (production build, what Vercel runs),
`npm start` (serve the build), `npm run typecheck`.

## Configuration

Copy [`.env.example`](.env.example) to `.env.local`. Every variable this shell
reads is documented there; none is required for the holding page to build or
serve.

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

The composed SDKs are `telemetry_sdk` and `base_sdk`. The composer does not
generate the application shell itself: everything listed under **Status**
above is host-owned, and the installer skips any file a developer has edited
rather than clobbering it. Each host seam file says in its own header which
`requires` entry it answers and which SDK replaces it when composed — read
those before widening one.
