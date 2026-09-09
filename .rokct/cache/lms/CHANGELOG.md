# Changelog

## 1.8.0

* Cuts the Supacharge landing's height on a phone by laying most of its card
  sections out as ONE swipeable row instead of a column of cards. Ray,
  2026-09-09: "actually most cards should be one row in mobile. even subjects
  cards", and the reason behind it: "im avoiding a long scroll". The long
  scroll is the complaint; the row is only how it is answered, so the sections
  were picked by how much height each one actually costs stacked.
* `components/custom/landing/lms-theme.css` grows one class, `.sc-row`, and
  every converted section adds it to the grid it already has. It is the row
  `.sc-deck` above it already was - snap so a swipe lands on a card rather
  than anywhere, `scroll-snap-stop: always` so a fling cannot skip one, the
  scrollbar hidden because the next card's own edge is the "there is more"
  signal, and a card sized `calc(100% - 1.75rem)` so that edge shows.
  * A class, not the `lms-card-deck.tsx` component, because these sections
    want only the row. The deck brings page dots, two arrows and the JS drag
    `lms-tutors-section.tsx` needs; here that JS would be the thing standing
    between a tapped plan card and its flip. The scroll is the browser's own,
    so a tap stays a tap and `lms-plan-card.tsx` keeps flipping inside the row.
  * Phones only, and mechanically so: the rules live in one
    `@media (max-width: 639.98px)` block. Every grid that takes the class was
    already a single column below 640px, so it drops the `grid-cols-1` that
    said so and leaves no `grid-template-columns` for the column flow to
    fight; a section whose own break is `md:` pins `sm:grid-cols-1` in its
    place so the 640-767px band keeps the explicit single column it had.
    Measured at six viewports, every section is pixel-identical from 640px up.
* Converted, in order of the height each one was costing (measured at a 390px
  viewport, real card copy): features 1472px -> 186px, subjects 1124px ->
  222px, pricing 998px -> 338px, the session steps 922px -> 346px,
  testimonials 1070px -> 418px, partners 618px -> 278px. About 4400px of
  page - some five phone screens of thumb - comes off the landing.
  * Pricing is in rather than out. Stacked plan cards are among the tallest
    things on the page, and a row of them is how the app's own plan deck
    reads; side-by-side comparison is what the grid is for from 640px up,
    where there is width to compare in.
* Left stacked, deliberately: the three FACTS under the session steps (bare
  paragraphs, not cards - prose in a snap row reads as broken), the FAQ (an
  accordion, already short while collapsed, and a row of expanding panels
  would fight itself) and the footer link list (not cards). The tutors
  section is untouched on Ray's own say-so - 2026-09-09: "tutor cards already
  looks great" - and needed nothing anyway: it has been the `lms-card-deck.tsx`
  deck since 1.2.0, the same request he made of it on 2026-09-08.
* The testimonials row now holds FIVE items instead of three, on Ray's call -
  2026-09-09: "i need you to add 2 more so when i replace i will replace all.
  right now is about the design". The point is the layout: five is the length
  the real row will be, so the swipe row and the desktop grid are judged at
  that length rather than at three.
  * All five are PLACEHOLDER stand-ins and `LMS_LANDING_PLACEHOLDERS` now says
    so by name - Naledi, Shireen, Sipho, Lerato, Yusuf - and asks for ALL FIVE
    to be replaced, not three. That registry row is the only thing standing
    between a stand-in and a reader who assumes it is a customer, so it had to
    grow with the section: two genuine-looking quotes added under a note that
    counted three would have read as two real ones.
  * The two new entries are written in the same register as the first three -
    a first name, a role, no surname, no school, no employer, no company, so
    nobody in them is a traceable person - and, like the others, carry no
    mark, percentage or measured outcome. Each describes something the product
    does and the page already claims: tomorrow's recording of a missed session
    (`sessions.facts`) and the two-teacher format. Neither says anything about
    who answers a question during the break, a mechanic the page states in one
    place (`sessions.steps`) and a testimonial has no business restating.
  * Desktop grows by one ragged row and is otherwise untouched: the grid is
    still `md:grid-cols-3`, so five cards read as three then two.

## 1.7.0

* Gives Supacharge's landing page a HEADER MENU, which answers the half of
  Ray's "menus in header and footer are not injected" that was actually
  missing. The footer menu was not: `lms-footer-section.tsx` has rendered
  `LMS_LANDING_CONFIG.footer.links` - Sessions, Subjects, Tutors, Partners,
  FAQ, plus the two auth links and the app link - since this SDK shipped its
  footer. The HEADER carried only the wordmark, the theme toggle and the two
  auth links, and this SDK could not change that: `components/custom/header.tsx`
  is the host shell's own file (base_sdk `requires`), so no SDK may ship it.
  base_sdk 1.13.0 added the seam and this registers into it.
* `components/custom/landing/lms-header-menu.ts` is Supacharge's menu,
  registered with one line at `// @rokct-sdk-header-menu-start`. It names
  SECTION IDS and nothing else - `sessions`, `subjects`, `tutors`,
  `features`, `partners`, `pricing`, `faq`, in the page order the sections'
  own `meta.order` already puts them in, so reading down the menu is reading
  down the page.
  * No labels and no hrefs. base_sdk resolves each id against the page's live
    nav, so the word on screen and the Partners `new` badge come from each
    section's own `meta.nav` - one place to edit when a section stops being
    new, and no second list to fall out of step.
  * `pricing` is the entry that shows why ids beat hrefs: `lms-pricing.tsx`
    declares `renders: ({ plans }) => showsPricing(plans)` and draws nothing
    when the platform returns no plan rows. On such a render base_sdk drops
    the header entry too, instead of offering a link to an anchor that is not
    on the page.
  * `testimonials` is deliberately left out while
    `lms-testimonials-section.tsx` is still rendering
    `[[TESTIMONIAL_n_QUOTE]]` placeholder copy. The header is the most
    prominent thing on the page, so it points at finished sections only; the
    section keeps its floating-nav stop in the meantime.
  * No fixed `links`. Sign in and sign up are already in the host header
    beside the row, and the app download - a real URL now, not the old
    `[[PLAY_STORE_URL]]` token - points off-site to a GitHub releases page,
    which the footer already carries. The header is where a visitor looks to
    move around THIS page, so it stays in-page only.
* Corrects what the session break step claims the assistant DOES. Ray, reading
  the live page: "assistant doesnt answer questions but read them out to tutor
  to answer before handing over to the next tutor". The step read "Thandi,
  Bianca or Mandy keeps time, answers the questions you would rather not ask
  out loud, and hands over", which is wrong about the product - the assistant
  does not answer anything. It now reads "Thandi, Bianca or Mandy keeps time,
  reads out the questions you would rather not ask out loud for your tutor to
  answer, and hands over to the next tutor." Ray's words, one sentence of
  `LMS_LANDING_CONFIG.sessions.steps`; the step number, the "about 5 minutes"
  duration and the "Break - the assistant" heading are untouched.
* `LMS_LANDING_VERSION` in `lms-footer-chrome.ts` follows `manifest.json` to
  1.7.0. Its own doc comment asks for the two to be kept in step, and 1.7.0's
  header-menu work had moved the manifest without it, which would have printed
  "VERSION 1.6.0" in the footer of a 1.7.0 landing.

## 1.6.0

* The landing page's footer ended on a bare legal line while rokct.ai's
  footer ends on a row: the copyright on the left, a status indicator and the
  version string on the right. Ray asked for Supacharge to carry the same
  row. It now does - and through base_sdk's shared `FooterChromeRow`
  (base_sdk >= 1.12.0), not a copy of rokct's host file, which would have
  made generic page chrome a third copy. `lms-footer-section.tsx` renders it
  in place of `<p>{config.legal}</p>`, keeping the section's own divider and
  spacing by handing them in as `className`.
* `components/custom/landing/lms-footer-chrome.ts` is Supacharge's half of
  that config, in its own file because `lms-landing-config.ts` holds product
  COPY - the words of each section - and none of this is copy. It names the
  legal entity the row puts in the copyright line (the same company
  `LMS_LANDING_CONFIG.footer.legal` names, now rendered in the platform's own
  `© Copyright <year> - <holder>` shape, which supersedes that field for
  rendering) and the version, `NEXT_PUBLIC_APP_VERSION` first and this SDK's
  own version otherwise - this SDK ships the page the row sits in, so keep
  `LMS_LANDING_VERSION` in step with manifest.json on each release, the same
  hand-maintained arrangement rokctai_frontend has with its version.json.
* THE STATUS COMES FROM THE TENANT, with control as the fallback. Ray asked
  for control "unless tenant can give status too", and it can: base_sdk's
  `api.system.api_status` is `allow_guest=True` and Supacharge's backend
  composes base_sdk's frappe half, so this tenant already answers
  `{status: "ok" | "maintenance", version, user}` to a signed-out visitor -
  and it can report ITS OWN maintenance window, which the control plane
  cannot do on its behalf. base_sdk probes the tenant first and falls back to
  `control:get_versions` (what rokct.ai reads today) when the tenant cannot
  be reached, and `ROKCT_STATUS_SOURCE` pins either one per deployment.
  Nothing here names a cmd: the probe order is base_sdk's and the shell's.
* The dot speaks in Supacharge's own colours - `var(--sc-success)`,
  `var(--sc-star)`, `var(--sc-danger)` from `lms-theme.css` - rather than
  base_sdk's default green/amber/red literals. Deliberately NOT the brand
  orange: an orange dot on an orange page carries no signal. Everything else
  in the row (the copyright line, the pill, the version) inherits the
  footer's own ink and ground, so the row is the same shape as rokct.ai's
  without borrowing its yellow.

## 1.5.2

* The header's theme toggle flipped the header and nothing else. Ray
  (2026-09-08): "theme toggle gets respected by header only". `lms-theme.tsx`
  pinned the mode: its mount effect ended `else root.classList.add("dark")`,
  so whatever the host had decided, the landing put `dark` back. The toggle
  did work - next-themes swapped the class on `<html>`, the host-owned header
  and every `dark:` utility followed it - and then the landing's own class won
  the rest of the page back. It now only supplies a DEFAULT: `dark` goes on
  when neither `dark` nor `light` is present, which is nobody having chosen,
  and an existing choice is left alone. Supacharge's landing stays dark out of
  the box; it is no longer dark against the visitor's wishes.
* There were two theme mechanisms and only one of them was ever written. The
  tokens' light set lived behind `.sc-landing[data-sc-theme="light"]`, and
  nothing in any repo set `data-sc-theme` - not the shell, not base_sdk, not
  this SDK, which only ever read it. So the attribute was unreachable and the
  light tokens were dead CSS: flipping the toggle switched Tailwind's `dark`
  class off, the header and base_sdk's chrome changed, and the landing held its
  dark `--sc-*` values because the one selector that could have changed them
  keyed on an attribute with no author. Two mechanisms that cannot agree is the
  actual bug, so there is now one.
* That one is Tailwind's `dark` class on `<html>`, which the host already owns:
  `darkMode: ["class"]` reads it, next-themes writes it, and it is the only
  theme signal that crosses the SDK boundary. The light set is keyed on
  `html.sc-landing:not(.dark)`, so the `--sc-*` tokens and every `dark:`
  variant in base_sdk's hero, nav and footer flip off the same class, in the
  same paint. Being pure CSS, the sections re-theme the instant the toggle
  fires rather than on the next reload, and there is no state to re-render or
  keep in step.
* `data-sc-theme` survives as a derived mirror of that class - written by
  `lms-theme.tsx`, read by nothing - for anything that would rather match an
  attribute than a class. A `MutationObserver` on `<html>`'s `class` keeps it
  accurate while the landing is mounted; it watches `class` and writes only
  `data-sc-theme`, so it cannot retrigger itself, and it is disconnected on
  unmount with the attribute restored to whatever it was.
* Light mode needed no recolouring to be legible: every `--sc-*` consumer
  already goes through the tokens, and the ten literal `text-white` /
  `bg-white` spots in the sections all sit on the orange primary or on the
  black gradient over a tutor portrait, where white is correct in either mode.
  No base_sdk change was needed either - its hero, nav and footer already
  state both sides of every colour (`bg-white dark:bg-black`), and the `dark`
  class they read is the seam, so the SDK boundary did not have to move.

## 1.5.1

* Pricing is a stop on the landing's floating nav again (Ray, 2026-09-08:
  "pricing not injected so floating nav doesnt have it"). It had none
  because `lms-pricing.tsx` carried `nav: []` on purpose: the section hides
  itself when the platform returns no plan rows, `meta.nav` is static and
  read before the section renders, and a fixed Pricing entry would then
  have left a tick that scrolls nowhere - worse than no tick at all.
* base_sdk >= 1.11.0 settles that with `PageSectionMeta.renders`, a
  predicate over the page facts the section is handed anyway. So the
  section now declares a real `{ id: "pricing", label: "Pricing" }` entry
  together with `renders: ({ plans }) => showsPricing(plans)`, and the host
  asks that once: with plans it renders the section AND lists the stop,
  with none it drops both. The tick appears exactly when there is something
  to scroll to.
* `showsPricing()` is the section's own render guard, not a second copy of
  the test - `LmsPricing` returns null on the same call - so the stop and
  the section cannot drift apart. `anchor: "pricing"` stays, naming the DOM
  id if the entry is ever taken away again.
* Nothing here changes what the page shows today: the section is empty on
  supacharge.app because the plans come back empty, which is an
  environment matter on the deploy (`ROKCT_BASE_URL`) and not this file.
  This is the half that was still wrong once the plans arrive - with them
  present the nav now has its Pricing stop, and without them it still has
  none.

## 1.5.0

* The floating nav can flag an entry NEW or coming SOON, and Partners is
  flagged NEW. rokct.ai has worn those little pills in its header menu for
  a long time and Supacharge had no way to say the same thing, because the
  only nav vocabulary a section had was `{ id, label }`.
  * base_sdk 1.10.0 adds `badge?: "new" | "soon"` to `LandingNavItem`, so a
    section says it on the entry it already registers in `meta.nav`. This
    SDK does two things with that: it renders it, and it sets exactly one.
  * `lms-floating-nav.tsx` draws the pill inside the hover tooltip, beside
    the label, because the label is the only text the nav has - the resting
    state is a 2px tick. Same geometry as the rokct.ai header badge (9px,
    bold, uppercase, tight tracking, full radius) but painted
    `--sc-primary`, not the header's hard-coded `bg-yellow-400`: yellow is
    a rokct accent and Supacharge is orange, so the badge reads from the
    same token as every other accent on this landing and follows the light
    theme with them. The badge word also joins the button's `aria-label`,
    since the pill itself only appears on hover.
  * `lms-partners-section.tsx` sets `badge: "new"` on its own entry (Ray,
    2026-09-08: "new partners for now"). Nothing else on the page is
    flagged, and no other file knows Partners is the flagged one - the
    section drops the flag when it stops being true.
* Requires base_sdk >= 1.10.0. Composed against an older base_sdk the field
  does not exist and the section's `meta.nav` fails to typecheck, so
  base_sdk 1.10.0 must land first.

## 1.4.3

* The testimonials section renders three testimonials. **They are placeholder
  content - Naledi, Shireen and Sipho are stand-ins, not real customers.**
  1.4.2 had switched the section off entirely; Ray ruled against that
  (2026-09-08: "fake them", "its worse with placeholders than fake", "i want
  it to look good will update testimonials later"), so it is back on with
  copy that reads as finished, and he will replace the entries with genuine
  quotes. No source carries a real quote yet.
* They are written to the rule the rest of this file follows even so: each
  describes experience of something the product actually does - the private
  break the session assistant holds, the partner's weekly attendance report,
  the same topic taught twice by two teachers - and none carries a mark, a
  percentage or any measured outcome. There is no result claim in them for
  the product to have to stand behind, which is the half of this that would
  be hard to undo later.
* `LMS_LANDING_PLACEHOLDERS` keeps its testimonial row rather than dropping
  it, because the need for genuine quotes is real and still unmet. The row
  now names the three stand-ins explicitly and says to replace all three and
  then delete the row, so whoever picks this up knows exactly what is on the
  page. The config comment above the entries says the same thing.
* `lms-testimonials-section.tsx` needed no logic change - it renders whatever
  the config carries - only an accurate header comment. Its `isPlaceholder`
  branch stays for the `[[TOKEN]]` state the section used to be in.

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
* The testimonials section is `null` and renders nothing, replacing the three
  `[[TESTIMONIAL_n_*]]` triples. No source carries a real quote, and the
  heading is "From students, parents and teachers", so the section stays off
  the page rather than showing tokens. (Superseded in 1.4.3, which fills it
  with placeholder copy on Ray's instruction.)
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
  unmet.

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
