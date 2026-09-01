# supacharge-web

Web shell for the Supacharge product — its web frontend, alongside the existing Flutter app repo.

Spawned by [RokctAI Factory](https://github.com/rokctai/factory) from https://github.com/RokctAI/factory/issues/127.

## Status

**Holding page only — this is not v0.**

The repo now carries a minimal Next.js App Router application whose single
route is a placeholder: the Supacharge name, one line about what it is, and a
link to the app download. It exists so `https://supacharge.app` serves
something correct and branded the moment the domain is pointed at this Vercel
project. It decides nothing about what the real web product becomes — no API
calls, no dependencies beyond Next/React, no UI library, no fetched fonts.

The real build is tracked by the **Build v0** issue. When it lands, replace
`app/page.tsx` wholesale rather than growing a product out of it.

The full brief lives in [docs/spec.md](docs/spec.md); the build instructions
for the agent live in [AGENTS.md](AGENTS.md).

## Stack

Next.js 16 (App Router) + React 19 + TypeScript, matching
[`RokctAI/rokctai_frontend`](https://github.com/RokctAI/rokctai_frontend)'s
versions and config style so the two shells stay on one set of conventions.
The `@/*` → `./*` tsconfig path alias is the one the Next.js SDK installer
convention assumes, so composed SDK templates resolve their imports unchanged.

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

`composer.json` and `.rokct/config/app_type` describe this shell's Next.js SDK
composition; the composer
(`The-Rokct-Protocol core/utils/nextjs/sdk_composer.py`) copies SDK templates
into `app/` and merges their npm dependencies into `package.json`. It does not
generate the application shell itself — the files above are host-owned, and
the installer skips any file a developer has edited rather than clobbering it.
