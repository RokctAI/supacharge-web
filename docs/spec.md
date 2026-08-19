# supacharge-web — accepted brief

> Copied verbatim from https://github.com/RokctAI/factory/issues/127 at spawn time. Do not edit: this is the
> record of what was accepted. Decisions taken while building belong in
> `.rokct/decision_log.md`.

**One line:** Web shell for the Supacharge product — its web frontend, alongside the existing Flutter app repo.

## Rationale

The web shell for the Supacharge product. Supacharge's existing repo is the Flutter app; this repo is its web frontend.

Thin shell: it carries `.rokct/config/app_type` with one line naming its composer.json template in The-Rokct-Protocol `core/utils/frappe/composer/`. Contract: [The-Rokct-Protocol PR #253](https://github.com/RokctAI/The-Rokct-Protocol/pull/253).

No app code beyond that marker at creation.

Refiled from https://github.com/RokctAI/factory/issues/123 (prose body the spawn parser could not read; `supacharge_web` renamed to `supacharge-web` because underscores fail the repo slug rule).
