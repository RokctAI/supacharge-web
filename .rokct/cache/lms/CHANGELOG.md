# Changelog

## 1.4.2

* The pricing section's partner line rendered the literal
  `[[PARTNER_DISCOUNT]]`. Ray (2026-09-08) confirmed the documented number,
  so it now reads "Link an accountability partner and pay R249 a month
  instead of R299." Both prices, not the bare saving: the token sat in "pay
  [[PARTNER_DISCOUNT]] less each month", where the substitution is the R50
  gap rather than the R249 price, and "pay R249 less each month" would have
  been wrong by a factor of five. Naming both numbers cannot be misread, and
  it suits a section that opens "no surprises". Sources agree:
  `supacharge-business.md` section 3 (R299 standard, R249 with a partner,
  "R50/month discount") and `supacharge-subscription-tiers-proposal.md:64`
  ("a flat R50 partner" discount, matching the backend's charging logic).
* The testimonials section is now `null` and renders nothing, replacing the
  three `[[TESTIMONIAL_n_*]]` triples. The heading is "From students,
  parents and teachers", so whatever sits there reads as a named person
  describing their own experience, and no source carries such a quote. Three
  invented quotes signed with invented learner and parent names would be a
  fabricated endorsement rather than placeholder copy - the CPA s.41 and the
  ARB Code both require a testimonial to be genuine and verifiable - so the
  section stays off the page instead. `lms-testimonials-section.tsx` already
  returned null on a missing config, so no component change was needed
  beyond correcting its header comment. One edit reverses it: a real
  `TestimonialsConfig` back in that slot and the section returns.
* Assistant cards carried no bio, so Thandi, Bianca and Mandy read as bare
  names beside twelve tutors who each have one. The card was never the
  problem: `lms-tutor-card.tsx` already reads `bio` off either persona and
  renders it - clamped to three lines over the portrait, in full on the back
  - and its props type already allowed `bio?: string` on an assistant. The
  `Assistant` interface simply never declared the field and the config never
  set it, so the guard `{bio && ...}` saw an empty string. `Assistant` now
  carries an optional `bio` and all three entries have one, which needed no
  component change at all.
* The bios say what each assistant actually does, from the persona folders
  under `lms/team/assistants/CAPS` - intro, timekeeping (halfway, five-minute
  warning, wrap-up), the break handover and the signoff, the same nine
  scripts for all three. All three do one job for their own grade, so each
  bio names that job rather than inventing a personality per assistant;
  `supacharge-characters.md` is explicit that Bianca is a second identity for
  the same role and not a separate character. Nothing claims office hours
  (conditional, and not what the shipped scripts cover), nothing calls them
  AI (the same doc: "not marketed as AI"), and nothing carries a statistic.
* `LMS_LANDING_PLACEHOLDERS` drops the `[[PARTNER_DISCOUNT]]` row now that it
  is answered. The testimonial row stays, because the need is real and still
  unmet; it now records that the section renders nothing meanwhile.

## 1.4.1

* "Get the app" pointed at the literal string `[[PLAY_STORE_URL]]`, live on
  the hero and in the footer - both read `LMS_LANDING_CONFIG.app`. There is
  still no Play listing to point at (the deploy lane has never run), so Ray
  (2026-09-08) answered the token with the repo: "use repo link to apk". It
  now goes to `https://github.com/RokctAI/supacharge/releases/latest`, the
  release page the Android APK is published to.
* The releases PAGE, not a `releases/latest/download/...` asset link: the
  workflow names each APK for its version (`app-v1.2.9.apk`,
  `app-v1.2.8.apk`), so no fixed asset filename resolves and the direct form
  would 404 on the next release. The page always shows the newest release,
  so the landing never needs re-editing per release. It also lists the .aab
  and the Windows build, and lets a visitor read the release notes before
  taking a 127 MB download.
* `LMS_LANDING_PLACEHOLDERS` drops the `[[PLAY_STORE_URL]]` row - the list
  is the outstanding set, and this one is answered. `[[PARTNER_DISCOUNT]]`
  and the three testimonial triples are still open and still render as
  tokens.

## 1.4.0

* The pricing section shows SUPACHARGE's plans. It rendered nothing at all:
  `lms-pricing.tsx` hides itself on an empty list, and the list was always
  empty because base_sdk's landing host prefetched
  `LANDING_CONFIG.plansQuery` - the platform's `Subscription Plan` catalog,
  the plans on which someone RUNS an LMS (USD 20 a month, USD 200 a year;
  `lms/frappe/src/tenant/fixtures/Subscription_Plan/LMS-*.json`). Right for
  rokctai_frontend, wrong for a learner, and unreadable as a guest either
  way.
  * `components/custom/landing/lms-plans-query.ts` registers this tenant's
    own catalog into base_sdk 1.9.0's plans-query seam
    (`// @rokct-sdk-plans-query-start`), one line through this manifest's
    `integrations`. The query is a gateway `cmd` like every other call this
    SDK makes - `api.lms.public_plans`, the rlms module's own
    whitelisted-method alias (`lms/frappe/manifest.json`) for
    `rlms.api.billing.public_plans` - never a dotted method URL.
  * `rlms.api.billing.public_plans` is the new guest-readable half, and it
    is deliberately NOT `plans()` opened up: that answer carries the partner
    monthly rate, the programme window dates and the `assistant_chat` /
    `holiday_access` entitlement flags, and it SEEDS records on the way
    through. The public read writes nothing and returns only the six fields
    the cards display, for ACTIVE, PRICED plans. No doctype permission is
    widened - a guest still cannot read `LMS Plan` generically, only this
    projection of it.
  * The plans are the seeded launch catalog, unchanged and un-invented:
    R299 a month, R2,990 a year (two months free) and R449 for the Holiday
    Programme. They arrive as records, so the owner's edits show on the page.
  * `lms-pricing.tsx` now reads three periods, exactly as the Flutter plan
    sheet does (`plans_sheet.dart` / `lesson_plans.dart`): monthly, yearly,
    and a ONE-OFF that is neither. The monthly/yearly switch moves between
    the recurring terms only; the Holiday Programme stands in both positions
    and is quoted "· once off" (`LMS_LANDING_CONFIG.pricing.labels.onceOff`,
    the app's own wording) instead of being mislabelled "/month" by whatever
    term it sits beside.
  * A misaimed base URL can no longer misprice the page. `ROKCT_BASE_URL`
    pointed at the CONTROL site used to answer the generic query with the
    control plane's tenant plans - a learner quoted USD 20 to run an LMS. A
    control site serves only `control:`-prefixed cmds, so this cmd cannot be
    answered there: the call fails, the plan list is empty and the section
    hides. The worst case is now no prices, never someone else's.

## 1.3.0

* The tutors section is a swipeable deck, not a grid that wraps (Ray,
  2026-09-08: "the tutor cards can still be a deck that take one row and
  can be swipped like in dart"). `landing/lms-card-deck.tsx` is lms/dart's
  `CardDeck` (`presentation/widgets/card_deck.dart`) as the web reads it:
  ONE row, the next card's edge always in view - the sliver the approved
  mockup asks for in as many words ("the next card's edge stays slightly
  visible at the screen edge", `lms/docs/ui-reference/subscription_cards.html`)
  and the 13 px the Flutter deck fans its second card out by; exactly one
  card per swipe (`scroll-snap-stop: always`, the deck's own
  onNext/onPrevious past a 30%-of-width threshold); `PageDots` under the
  row, the live card a stretched pill and the rest dots over 250 ms, the
  same signal onboarding, tutor discovery and the plans sheet all use; and
  the deal's swipe hint, a 46 px nudge over 420 ms the first time the row
  is seen, "showing it's swipeable without the student having to guess"
  (`CardDeck._hint`), skipped under `prefers-reduced-motion` or once the
  reader has scrolled it. Twelve tutors held three or four grid rows and
  the three assistants another; each is one row now. Web rather than
  Flutter: touch and trackpad are the browser's own scrolling, a mouse
  drags the row and a press that turned into a drag is swallowed so a drag
  never flips a card, the arrows and the Arrow / Home / End keys move it a
  card at a time on a desktop, and the scrollbar is hidden (`.sc-deck` in
  `landing/lms-theme.css`). The deck does not wrap the way the Flutter one
  does - a scrolled row has real ends, so the arrows disable there. The
  cards are untouched: the deck owns the row and never the card, so the
  flip still turns exactly as it did. `TutorsConfig` gains `deck` and
  `assistantsDeck` (`DeckLabels`: the row's accessible name, its two
  controls and the caption under it).

## 1.2.0

* The tutors and pricing sections render the app's cards, flip included
  (Ray, 2026-09-08: "bring tutor and subscription cards to nextjs so can
  see their images and flip them"). `landing/lms-flip-card.tsx` is the
  primitive: the same rotateY flip as lms/dart's `CardDeck` (420 ms, back
  counter-rotated), turned by click, Enter or Space on the focused card,
  by hover on a fine-pointer device (a click pins it), and a crossfade
  instead of a rotation under `prefers-reduced-motion`; the hidden face is
  `inert`. `landing/lms-tutor-card.tsx` ports `TutorCard`/`TutorCardBack`:
  portrait front with the Tutor/Assistant and grade badges, name,
  "title · subject", three lines of bio and "Know <name>" (flips only);
  bio, Style and Rating facts and "Start with <name>" (to sign-up) on the
  back, initials when no render ships. A rating shows only when a real
  number exists - none does yet, so the entries carry none.
  `landing/lms-plan-card.tsx` ports `_PlanFamilyCard` with a back the
  Flutter card does not need: price and description front, the row's
  feature list and the Choose action back, "Most popular" on the middle
  plan. `lms-tutors-section.tsx` (30) lays the twelve tutors and three
  assistants out as these cards and now reads the page's `signupUrl`;
  `lms-pricing.tsx` (60) hands each prefetched plan row to a plan card.
  `Tutor` gains `slug`, `style`, `grades`, `rating?`; `Assistant` gains
  `slug`; `TutorsConfig.cards` and `pricing.labels` carry the cards' words.
* Team images ship with the Next.js build (Ray, 2026-09-08: "we already
  have script that copies team to dart's template/assets, it can do the
  same for nextjs"; "if in dart assets are in lms, they should also be in
  lms in nextjs"). `lms/dart/tool/sync_team_assets.dart` - the one tool
  `.github/workflows/sync_team_assets.yml` already runs on every
  `lms/team/**` push - now mirrors the SAME consumable set (tutor,
  assistant, founder and onboarding renders plus any audio/video; never
  `marketing/`, per agent#239's `_excludedRoots`) into
  `templates/public/team/` (installed at `public/team`, served at
  `/team/...`; 58 files, 3.6 MB, no resizing) and writes the generated
  `templates/components/custom/landing/team-assets.ts` (persona folder ->
  the `/team/...` URLs it ships, plus `teamAssetsFor` / `teamImageFor`),
  pruning both the way it prunes the Dart tree. Both `installs` entries
  are marked generated. The workflow's commit step stages the Next.js
  tree and manifest too; a re-run on an unchanged team folder is a no-op,
  so the clean-head gate sees no drift.
* Holds Supacharge's landing page sections and the page that serves `/`,
  registering the sections into base_sdk 1.5.0's generic landing host.
  Ray, 2026-09-03: "each home sdk holds its own landing page", "similar
  to profile in dart"; Ray, 2026-09-07: "supacharge flutter home sdk is
  lms so i expect it to be same for nextjs" - the Flutter registry
  template (`core/utils/flutter/composer/supacharge.json`) already flags
  `lms_sdk` `home_sdk: true`, so this half now carries what the Next.js
  home SDK owns. base_sdk keeps the page, the orchestrator, the section
  registry and the hero; this SDK contributes one `integrations` line per
  section after `// @rokct-sdk-page-sections-start`,
  `{ id: "<file>", load: () => import("@/components/custom/<file>") }`,
  in page order, the same one-marker contract agent_sdk 1.4.0 uses for
  rokctapp. That registry, base_sdk's `landing-config.ts`,
  `app/actions/base/landing.ts` and `app/services/base/session.ts` join
  `requires`; base_sdk composes first.
  * Section templates, each with a default export and a `meta` export
    carrying its `order` and floating-nav entry: `lms-floating-nav.tsx`
    (order -1: a fixed overlay before the hero, receives the whole nav
    from the page), `lms-sessions-section.tsx` (10, `sessions`: the
    two-part lesson - expert, assistant bridge, simplifier - and the
    doors/skip/data rules), `lms-subjects-section.tsx` (20, `subjects`:
    the six CAPS subjects for Grades 10-12 with each subject's tutor duo),
    `lms-tutors-section.tsx` (30, `tutors`: the twelve tutors and three
    session assistants from `lms/team/tutor_catalog.json`),
    `lms-features-section.tsx` (40, `features`: the app's screens in tour
    order), `lms-partners-section.tsx` (50, `partners`: the weekly report,
    instant alerts, the see-everything-control-nothing boundary, sponsor
    reports and pairing codes), `lms-pricing.tsx` (60, anchor `pricing`,
    no nav stop: the page's prefetched `plans` from the platform's
    Subscription Plan rows, hidden when there are none - no price is
    hard-coded), `lms-faq-section.tsx` (80, `faq`),
    `lms-testimonials-section.tsx` (90, `testimonials`) and
    `lms-footer-section.tsx` (95, anchor `site-footer`, no nav stop).
  * `components/custom/landing/lms-landing-config.ts` holds every word,
    link and label on those sections (`LMS_LANDING_CONFIG`: one block per
    section plus `home.url` and `app`); a `null` block hides its section.
    Every claim is taken from what already exists - the Flutter app's
    guided-tour feature guide and `tr_keys` strings, the tutor roster,
    the CAPS lesson pipeline (`factory/lessons/README.md`) and the
    product/business docs. Facts no source carries are `[[PLACEHOLDER]]`
    tokens (`[[PLAY_STORE_URL]]`, `[[PARTNER_DISCOUNT]]`,
    `[[TESTIMONIAL_n_QUOTE|NAME|ROLE]]`), listed in
    `LMS_LANDING_PLACEHOLDERS`; the testimonials template renders a token
    as a token, never dressed up as a quote.
  * `app/page.tsx` serves `/`, the counterpart of agent_sdk's
    `app/(chat)/page.tsx`: an anonymous visitor is redirected to
    `/landing`, a signed-in user to `LMS_LANDING_CONFIG.home.url`
    (`/handson/all/lms`, the Next.js counterpart of the Flutter home
    SDK's `ScheduleRoute`). It reads the session through base_sdk's
    kernel seam (`app/services/base/session.ts`), not `app/(auth)`, so it
    works in a shell with or without auth_sdk. It lands on the shell's
    own `app/page.tsx` - the composer overwrites shell copies, as
    base_sdk's host files do - so an uncomposed shell keeps its own `/`.
  * `dependencies` gains `framer-motion` (the floating nav and the FAQ
    accordion animate with it; base_sdk declares the same range) and
    `@editorjs/header`, which the 1.1.0 lesson editor
    (`courses/[courseName]/learn/[lessonId]/_components/editor-content.tsx`)
    already imported without declaring - a composed shell that did not
    happen to carry it failed `next build` on that import.
  * The 1.1.0 `app/handson/all/lms` surfaces now pass Next 16's type
    check, so a composed shell builds without
    `typescript.ignoreBuildErrors` (17 errors before, 0 after, in a fresh
    supacharge-web clone composed with telemetry_sdk, base_sdk and
    lms_sdk). `courses/[courseName]/learn/layout.tsx` and
    `courses/[courseName]/page.tsx` await the `params` Promise (Next 15+
    route params); `fetchLesson` declares its
    `CourseLesson | LessonAccessDenied | null` result and the lesson page
    narrows on `"error" in data`; the lesson player uses react-player 3's
    element props (`src`, `onTimeUpdate`, `onDurationChange`) in place of
    the v2 `url`/`onProgress`/`onDuration` callbacks, deriving the same
    played fraction and unique-second tracking; `Quiz` gains the
    `duration`, `questions`, `passing_percentage`, `show_answers` and
    `introduction` fields the quiz page reads and `QuestionDetails` its
    `option_1..4`/`multiple`; the batch, discussion, event and review
    services coalesce a null gateway reply to `[]` (their documented
    empty value), `QuizService.getQuestionDetails` admits `null`, and
    `DashboardHeader.fullName` is optional (no user info, no name).
    No behaviour changes; nothing is removed.
  * Nothing else that consumes 1.1.0 changes: the actions' and services'
    exports and the three sidebar nav entries are untouched, and
    `lms_sdk` is in no Next.js registry template's `sdks` list yet (only
    `supacharge.json`'s Flutter and Frappe halves name it).
  * The hero itself is filled by this SDK too. Ray, 2026-09-08: the
    base_sdk hero is a frame; the hero body is injected by the home SDK
    through a registry, like the landing sections; the chat box belongs to
    agent_sdk; lms injects its own body. Two more templates under
    `components/custom/landing/`, each registered with one `integrations`
    line: `lms-hero-form.tsx` at `// @rokct-sdk-hero-form-start` in
    base_sdk 1.7.0's `hero-form.ts` (`{ id: "lms-hero", load: () =>
    import(...) }`; the first registered entry renders in the hero's body
    slot) - Supacharge's hero body with NO chat or search input: a
    primary "Get the app" call to action on `LMS_LANDING_CONFIG.app`
    (still the `[[PLAY_STORE_URL]]` token), a secondary "Sign in" on
    `LANDING_CONFIG.loginUrl`, and the hero's `trustLine` under them,
    built on the shell's `components/ui/button.tsx`; and
    `lms-hero-copy.ts` at `// @rokct-sdk-hero-copy-start` in base_sdk
    1.6.0's `hero-copy.ts` - a `HeroCopy` laid over `HERO_CONFIG`:
    Supacharge's headline words and suffix, no placeholders, no
    background, the trust line, no store badges. That copy is a DRAFT
    pending Ray's approval (the file says so at its top) and carries no
    statistic. `hero-form.ts` and `hero-copy.ts` join `requires`.
  * The landing has Supacharge's own look. Ray, 2026-09-08: give it its
    own feel like the Dart Supacharge app has. The Dart app's look is
    base_sdk's `AppStyle` tokens (lms_sdk injects no palette, so the kernel
    values are Supacharge's) rendered by lms/dart: orange `#FF6600`
    primary on a `#101010` surface, `#1C1C1C` cards with a 1 px `#2E2E2E`
    stroke and 12-14 px corners, white ink over `#8C8C8C` captions, Inter
    for every label and a Montserrat Black Italic wordmark with the
    registered mark, dark-first with the light set behind the profile
    toggle, and the orange radial glow of the welcome screen. Four
    templates under `components/custom/landing/` carry it: `lms-theme.css`
    (the tokens as `--sc-*` custom properties on `html.sc-landing`, the
    light set under `html[data-sc-theme="light"]`, and the shared
    `.sc-card` / `.sc-chip` / `.sc-badge-primary` / `.sc-btn(-primary|
    -outline)` / `.sc-eyebrow` / `.sc-brand` pieces - plain CSS, no
    Tailwind directive, so it holds in a shell without Tailwind),
    `lms-fonts.ts` (Inter 400-800 and Montserrat 700/900 through
    `next/font/google`, the same Google families the Dart app fetches
    through `google_fonts`; no font file is bundled), `lms-theme.tsx`
    (puts the tokens, the two font variables and - because base_sdk's hero
    and the shell's header style their dark side with class-strategy
    `dark:` variants - the `dark` class on `<html>` while the landing is
    mounted, undone on unmount) and `lms-wordmark.tsx` (the Dart wordmark
    traced from Montserrat Black Italic into one `currentColor` path,
    also installed as `public/brand/supacharge-wordmark.svg` and
    `-ink.svg`; the Dart app has no image wordmark - its `logo.png` is the
    kernel's Juvo mark). `components/custom/lms-theme-section.tsx`
    registers the theme first (order -2, one `integrations` line before
    the floating nav). Every section, the hero body and the floating nav
    now read the tokens instead of zinc/yellow utilities: primary orange
    for the eyebrow numerals, feature icons, grade badge, tutor initials
    and every call to action (the Dart Login button: primary fill, radius
    12; the outlined Register button beside it), flat cards on the
    surface, pill chips, and the footer renders the wordmark in place of
    the shell's text `Branding`.
  * base_sdk's hero frame (`components/custom/hero.tsx`, 1.7.0)
    hard-codes `bg-white dark:bg-[#0a0a0a]`, a yellow serif rotating word
    and a fixed 250 px wordmark slot that clips "Supacharge" to "Supac",
    and exposes no className or CSS-variable hook. Until it does,
    `lms-theme.css` re-paints it from outside the file through the `#hero`
    id the frame takes from `LANDING_CONFIG.nav.hero` and the frame's
    element order (surface + glow background, the rotating word in the
    brand italic and primary, the shell's letter tile hidden, the wordmark
    slot un-clipped and set in Montserrat Black Italic with the registered
    mark). The frame should grow `--hero-bg` / `--hero-accent` custom
    properties, a `brandClassName` and an auto-width wordmark slot; that
    is a base_sdk change, not made here.

## 1.1.0 and earlier

* The `app/handson/all/lms` course, batch, job, quiz, assignment,
  discussion, review and profile surfaces with their actions and services,
  and the Learning / My Profile / My Batches sidebar nav entries. See the
  git history of `lms/nextjs/`.
