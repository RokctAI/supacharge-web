# Changelog

## 1.31.0

* The name's suffix in the primary colour (Ray, 2026-09-11, 07:34:03Z:
  "also site name the .school get primary color in nextjs"). The footer's
  wordmark is `lms-wordmark.tsx`'s traced SVG, which draws the stem only;
  `lms-footer-section.tsx` now draws the text after the stem of the name
  the shell declares - `PLATFORM_NAME` cut by base's `brandStemOf`, the
  one stem rule the header and the hero already fold by, never a
  hard-coded ".school" - right after it, in the brand face (italic, 900,
  `-0.03em`, sized to the trace's x-height), `aria-hidden` because the
  SVG's `aria-label` already says the full name, on the
  `data-brand-wordmark="tld"` hook. Requires base_sdk >= 1.41.0 for
  `components/custom/header.tsx`: 1.41.0 puts the same hook on the suffix
  span of the header's stem wordmark, so one rule reaches both.
  * ONE new rule in `lms-theme.css`, `.sc-landing [data-brand-wordmark="tld"]`,
    beside the header stem rule: `color: var(--sc-primary)` and nothing
    else. Not scoped through `<header>` - the hook is the same on both
    surfaces by design. No `!important`, no hard-coded colour, no brand
    string. The hero stays on `brand: "stem"`; nothing about it moves.
* The footer's download links are platform icon buttons (Ray, 2026-09-11,
  07:34:37Z, verbatim:
  "footer has  download links let them be platform icons buttons").
  The text links the footer nav printed since 1.12.0 are gone
  from `lms-footer-section.tsx` (Sign in and Create an account stay); the
  downloads are declared once on `lms-footer-chrome.ts` as
  `FooterChromeConfig.downloads` (base_sdk 1.41.0) and base's
  `FooterChromeRow` draws them as icon buttons - one `<a>` per entry with
  the store mark and an `aria-label`.
  * `lms-landing-config.ts`: `LandingApp` gains `downloadPlatform` (base's
    `DownloadPlatform`, restated as the local union
    `"ios" | "android" | "huawei" | "macos" | "windows" | "linux" | "web"`
    so the literal still lifts under bare node) and `mark` (a
    `BRAND_MARKS` key, the local union `DownloadMark`). android is
    `"android"` / `googlePlay`, huawei `"huawei"` / `appGallery`, desktop
    `"windows"` / `windows`, ios `"ios"` / `appStore` and still
    `shown: false`. The display `platform` field is untouched.
  * `lms-footer-chrome.ts`: `LMS_FOOTER_DOWNLOADS`, one entry per
    `LMS_SHOWN_APPS` app - `id`, `platform`, `label`, `href` (the store
    listing when `storeUrl` is set, else the `/download` route, as
    `LMS_SHOWN_APPS` resolves it), `external`, `title` (the description),
    `mark` - typed off `FooterChromeConfig["downloads"]` so the entry
    shape is base's own; `LMS_FOOTER_CHROME.downloads` carries it. Reads
    the shown list, never the raw one: a demoted platform has no button.
* The install offer is platform-aware (Ray, 2026-09-11, 07:37:17Z, verbatim:
  "this nextjs has install, it does show on mobile though i havent seen it in desktop i think it installs as pwa but i think it should check the platform and offer app of that platform").
  base_sdk 1.41.0's
  `FooterChromeRow` mounts its `InstallOffer` beside the buttons; it
  reads the same download entries, detects the visitor's platform and
  offers that platform's build, the PWA install when none matches. This
  SDK declares nothing more for it - the entries above are the whole
  input - so nothing else in this SDK changes for it.
* Requires base_sdk >= 1.41.0 for `components/custom/footer-chrome.tsx`
  (the icon buttons and the install offer), for
  `components/custom/landing/footer-chrome-config.ts`
  (`FooterChromeConfig.downloads`; against 1.40.0 the field is a type
  error) and for `components/custom/header.tsx` (the `tld` hook; against
  1.40.0 the header's suffix simply stays in the foreground colour).
  supacharge-web re-pins both after base 1.41.0 and this release merge.
* `tests/test_landing_apps.py` (the suite goes from 134 to 140):
  `TestFooterDownloads` holds that every shown app carries a
  `downloadPlatform` from base's union and a `mark` that is a real
  `BRAND_MARKS` key, with the mapping above; that the footer chrome maps
  the shown list field for field and hands it to the row; that the footer
  section prints no text download link, imports the shown list no more,
  and draws the suffix span - derived, `aria-hidden`, hooked, in the
  primary token and the brand face - after the wordmark; that the `tld`
  rule exists exactly once with the colour and nothing else, so the sheet
  now carries the hook twice; and that the manifest, the changelog and
  `LMS_LANDING_VERSION` say 1.31.0 with the three floors at 1.41.0. The
  footer surface in the shown-list check is now `lms-footer-chrome.ts`.
* Version-only side effects: `manifest.json` 1.30.0 -> 1.31.0.
  `LMS_LANDING_VERSION` in `lms-footer-chrome.ts` goes to 1.31.0 with it.
  The base_sdk floor for `components/custom/header.tsx` is 1.41.0 since
  1.31.0 (it was 1.40.0 since 1.29.0); `components/custom/footer-chrome.tsx`
  and `components/custom/landing/footer-chrome-config.ts` go from 1.12.0
  to 1.41.0.

## 1.30.0

* Cambridge and its soon pill sit in ONE border-only rectangle with a
  primary-colour border (Ray, 2026-09-10: "i think cambridge and its label
  should be in a border only rectangle to give it distiction."; 2026-09-11:
  "give the border primary color"). The curriculum line, "Built for CAPS,
  IEB and Cambridge", already gave a badged name and its pill one
  non-breaking span in `lms-curricula.tsx`; that span is now the rectangle.
  CAPS and IEB carry no badge, get no span and render exactly as before;
  the pill itself is untouched.
  * `lms-curricula.tsx`: the badged span takes the class
    `sc-curriculum-outlined` and `data-curriculum-outlined=""`; nothing
    else in the markup moves, and the gap between the name and the pill is
    what it was. Base's `MenuLabel` is untouched: the rectangle is lms's
    own markup around it.
  * ONE new rule in `lms-theme.css`, `.sc-curriculum-outlined`, beside
    `.sc-eyebrow`: `border: 1px solid var(--sc-primary)` (the primary
    token `.sc-chip-primary` already draws its edge with, so the border is
    the brand orange in both themes), `border-radius: 10px`,
    `padding: 2px 8px`, `background: transparent`. No fill, no
    `!important`, no hard-coded colour, no brand string.
  * `tests/test_landing_apps.py` (the suite goes from 131 to 134):
    `TestCambridgeOutline` holds that only the badged branch wraps and
    that the wrapper carries the class and the attribute, that the rule
    exists exactly once with the 1px primary-token border, the transparent
    background and the 10px radius, and that the manifest, the changelog
    and `LMS_LANDING_VERSION` say 1.30.0. `TestCurricula`'s markup
    regex admits the attribute.
* Version-only side effects: `manifest.json` 1.29.0 -> 1.30.0.
  `LMS_LANDING_VERSION` in `lms-footer-chrome.ts` goes to 1.30.0 with it.
  No base_sdk floor moves: `components/custom/header.tsx` stays at 1.40.0
  (since 1.29.0) and `components/custom/menu-label.tsx` at 1.14.0.

## 1.29.0

* The header's stem wordmark is drawn in the brand face (Ray, 2026-09-11:
  on supacharge.school the "Supacharge" wordmark was in the right font in
  the hero and in the footer but not in the header). The hero's span is
  painted by `lms-theme.css` through base's `#hero` element order - the
  brand face, italic, 900, `-0.03em` - and the footer's wordmark is
  `lms-wordmark.tsx`'s traced SVG, which carries the face in its paths;
  the header's stem (`header.tsx` `BrandStemWordmark`, the wordmark
  base's collapsing brand renders for a dotted name) had no rule here and
  inherited the shell's sans at Tailwind's bold, upright. Requires
  base_sdk >= 1.40.0 for `components/custom/header.tsx`: 1.40.0 puts
  `data-brand-wordmark="stem"` on that span and on the hero's, the same
  hook on both, and drops the hero span's own `font-sans`.
  * ONE new rule in `lms-theme.css`,
    `.sc-landing header [data-brand-wordmark="stem"]`: `font-family:
    var(--sc-font-brand)`, `font-style: italic`, `font-weight: 900`,
    `letter-spacing: -0.03em` - the hero wordmark rule's face, style,
    weight and tracking, declaration for declaration, and nothing of its
    size, line height, colour or transform: the header sizes its stem
    from `--brand-chars` and keeps its own foreground token. The code
    span beside the stem (the market's code at its 1.36.0 cap) is not
    the wordmark and is untouched; so are the hero rule and the footer.
    Scoped through `<header>` and reached from the `sc-landing` class
    `lms-theme.tsx` puts on `<html>` while the landing is mounted. No
    brand string: the rule keys on base's hook, not on a name.
  * `tests/test_landing_apps.py` (the suite goes from 128 to 131): the
    header rule exists exactly once and its family, style, weight and
    tracking equal the hero rule's, parsed from both; it carries none of
    the hero's size, line-height, colour or transform; and the manifest
    floors `components/custom/header.tsx` at base_sdk 1.40.0 with the
    changelog naming it.
* Version-only side effects: `manifest.json` 1.28.0 -> 1.29.0.
  `LMS_LANDING_VERSION` in `lms-footer-chrome.ts` goes to 1.29.0 with it.
  The base_sdk floor for `components/custom/header.tsx` is 1.40.0 since
  1.29.0 (it was 1.28.0, the letter tile).

## 1.28.0

* The LIVING marketing calendar (Ray, 2026-09-11: "i want it alive like
  schedule move as time pass"). The snapshot document that preceded it was
  a table fixed on the day it was written; `/admin/calendar` computes the
  same calendar on the day it is READ, so the countdowns move, "Now" is
  where the school year actually is, and a window that has passed drops
  off the list by itself. Two packaged anchors, both on the backend and
  never fetched at runtime: the gazetted DBE term dates
  (`lms/frappe/src/tenant/rlms/data/sa_school_terms.json`, read through
  `term_report_rules.terms_for_year` / `resolve_term`; LEARNER dates,
  never "corrected" to the educators' dates in the gazette's parentheses)
  and NEW `data/nsc_exam_windows.json`: the published May/June 2026
  (11 May to 24 Jun) and October/November 2026 (written papers 13 Oct to
  26 Nov) windows with the DBE timetable's title, URL and retrieval date,
  the 2027 windows as the customary pattern flagged `customary` with no
  source, and the mid-January results release, `customary` until the DBE
  announces it. September prelims are `school_set` and computed as the
  last three weeks of Term 3 from the term data, never stored; so are the
  grade 10 and 11 mid-year and year-end windows (last three weeks of
  Terms 2 and 4).
  * NEW backend module `rlms/marketing_calendar.py` beside
    `term_report_rules.py`: `build_calendar(today, years)` answers the
    ordered events (term open, learner close, holiday, exam window,
    results, campaign window) each with `start`, `end`, `kind`, `status`
    (gazetted / published / customary / school_set / approximate),
    `label`, `theme` (the snapshot document's theme lines, verbatim),
    `days_until` (negative once started) and `active`, plus `now` through
    `resolve_term`: the term, its week and the days left, or in a holiday
    the term that just ended and the countdown to the next opening. The
    campaign lead times are one set of constants: 14 days before each
    term opening, 28 before the finals, 21 before the May/June sitting,
    7 before the prelims, the week after the results, and a report-review
    window around each learner close. `render_ics` writes the feed:
    all-day VEVENTs, one stable UID per event id, DTEND exclusive, lines
    folded at 75 octets, `X-WR-CALNAME` "Supacharge marketing calendar",
    CONFIRMED for gazetted and published dates and TENTATIVE for the rest.
    Pure: no frappe import at module level.
  * NEW endpoints `rlms/api/marketing_calendar.py`, registered in
    `lms/frappe/manifest.json` as `api.lms.marketing_calendar`
    (`get_calendar`: the JSON, System Manager only through
    `frappe.only_for` exactly as `admin.py` and `announcements.py` gate,
    `today` read in Africa/Johannesburg with an optional ISO override)
    and `api.lms.marketing_calendar_ics` (`ics`: `text/calendar`, inline,
    so Google Calendar and Outlook can subscribe). A calendar app cannot
    sign in, so the feed is reachable with a per-site token from
    `site_config.json` (`marketing_calendar_feed_token`); the URL that
    carries it is handed only to a System Manager in `get_calendar`'s
    `feed_url`, and without a configured or matching token the feed
    falls back to the same System Manager gate. No secret in code.
    `tests/test_marketing_calendar.py` (50 tests; the rlms suite goes
    from 509 to 559) pins the holiday reading on 2026-07-06 (Term 2 just
    ended, 15 days to Term 3), the last day of Term 3 2027, every lead
    window, the published dates and their sources, the computed prelim
    window, the feed's shape and UID uniqueness, the status vocabulary
    and both gates.
  * NEW `app/admin/calendar/page.tsx`, a server page (the data is loaded
    in the render, never in an effect; `dynamic = "force-dynamic"` so
    today's countdowns are never prerendered) over NEW
    `components/custom/lms-marketing-calendar.tsx`: the "Now" card
    (term, week, days left - or the holiday and the next opening), the
    "Next" card (the next campaign window and its countdown), the
    upcoming list (label, day-first dates, countdown, theme, status
    badge) and the subscribe card (a `webcal://` link to the feed plus the
    copy-link button, which is the one client control, in NEW
    `lms-marketing-calendar.client.tsx`). No `"use client"` on the entry.
    Every word is read through the shell's `t` (`app/lib/i18n`, which
    joins `requires`) under `app.lms.calendar.*` with the English beside
    each key as the fallback, the `agent-header-menu.ts` pattern; nothing
    in this half names the brand or a host - the calendar's name and the
    feed URL come from the backend's answer. NEW pure, import-free
    `components/custom/landing/lms-calendar-rules.ts` holds the wire types
    and the page's reading of the answer (underway windows first, then
    what is to come, never the past; the countdown wording; the date
    ranges; the badge variants; the webcal link), and
    `app/actions/handson/all/lms/calendar/` (`fetchMarketingCalendar`,
    gated by the host's `verifyLmsRole` first) and
    `app/services/all/lms/marketing-calendar.ts`
    (`api.lms.marketing_calendar` through the gateway) ride the existing
    directory mappings. The shell's theme provider is dark by default and
    the page paints only theme tokens.
  * NEW `tests/test_marketing_calendar_page.py` (the suite goes from 104
    to 128): the rules under node, the page's server shape, the labels'
    keys, the manifest's four installs and the i18n requirement, and that
    no file of this half writes the brand or a host.
* Version-only side effects: `manifest.json` 1.27.0 -> 1.28.0, a minor
  step for the new files and the new `requires` entry. `LMS_LANDING_VERSION`
  in `lms-footer-chrome.ts` goes to 1.28.0 with it. No new `base_sdk`
  seam or floor.

## 1.27.0

* The founder card reaches the company's about page (Ray, 2026-09-10:
  corporate_sdk owns `/about` and `/team` as renderers; their content
  comes from the shell's `data/` folder or is empty, and Supacharge's
  about page reuses lms's existing founder card). Requires base_sdk >=
  1.38.0 for `components/custom/landing/page-sections.ts`
  (`PageSectionMeta.page`, the page slot).
  * `lms-tutor-card.tsx` gains the founder role, the Flutter card's
    founder branch (`lms/dart/.../discovery/widgets/tutor_card.dart`)
    ported unchanged in look: the WHO badge reads Founder - Co-Founder on
    every founder card once the deck holds more than one - and there is
    no grade badge; the back carries the subject alone, the bio and no
    Style / Rating facts; where a tutor card offers its teaching snippet
    a founder card offers "Hear more", the self-intro video - disabled,
    never hidden, until the asset ships and the section wires it, and
    playing in the card in place of the text while it runs; no Start
    button. Tutor and assistant cards render byte for byte what they
    rendered. The three words are `CardLabels.founder`, `coFounder` and
    `hearMore` in `lms-landing-config.ts`.
  * NEW `landing/lms-founders.ts`: `LMS_FOUNDERS`, the founders as
    `seeded_tutor_catalog.dart`'s `founder_ray_thompson` carries them -
    name, the title line, subject, bio, the `founders/Ray_Thompson`
    persona folder (the already-shipped renders under `public/team/`,
    listed in the generated `team-assets.ts`) and the intro video ref;
    every string copied from the Dart source and held equal by the
    tests. `founderIntroVideo()` answers the video only once
    `team-assets.ts` lists it.
  * NEW `lms-founder-section.tsx`, the server-readable entry (`meta`:
    `page: "about"`, order 10, no nav entry, `renders` only with a
    founder to draw; no `"use client"`) over NEW
    `lms-founder-section.client.tsx` (the cards in the landing's token
    scope - `LMS_ROOT_CLASS` on a wrapper, `lms-theme.css` imported - and
    the one `useState`: which founder's video plays). Registered with one
    line at the page-sections marker, after the footer; the landing never
    draws it and lists no stop for it.
* `LMS_LANDING_VERSION` is `1.27.0`.
* Tests: `TestServerSafeSections` counts the founder entry and its client
  half; NEW `TestFounderCard` reads the Dart catalogue and holds every
  string of `lms-founders.ts` equal to it, the badge words, the card's
  founder branch (no grade badge, no Start, "Hear more" disabled with no
  video), the entry's page slot, the portrait's presence under
  `public/team/`, and the manifest's floor.

## 1.26.1

* Four lines of landing copy described a phase the product does not have: a
  learner asking a question DURING the break, and an assistant answering one
  there. There is no composer in the break to ask with, and the assistant
  does not answer in it. `LessonState.chatPhaseOpen`
  (`lms/dart/lib/src/common/application/lesson/lesson_state.dart`) is
  `completed || (!introActive && !breakActive && speakingRole !=
  SpeakingRole.assistant)` - chat is open while the tutor is teaching and
  CLOSED through the intro, the break and any assistant-held segment, and
  `lesson_chat_gating_test.dart` pins exactly that across a break with
  question beats in it. What the break actually does is read questions out
  for the TUTOR to answer aloud; outside the break the assistant answers the
  student itself, in chat, one on one
  (`agent/frappe/src/tenant/brain/ask_assistant.py`).
* The testimonial in `testimonials.items[0]` (Naledi) said "I can ask what I
  missed without the whole class hearing me" - both halves wrong in the same
  sentence, since the asking happens earlier and the hearing is the point of
  the break. It now says the learner sends the question in while the tutor is
  still teaching, unseen, and it comes back answered in the break. The
  privacy claim moves to where the product actually keeps it: the SENDING is
  private, not the hearing.
* `team.assistants[1]` (Bianca) said "The break is hers - questions asked
  privately". Asking is not what the break is for; it now reads "your
  questions read out and answered, so you can say what did not land without
  saying it to the class". Same promise, on the mechanic that exists, and in
  step with `sessions.steps[1]` one screen up, which already says the
  assistant "reads out the questions you would rather not ask out loud for
  your tutor to answer".
* `team.assistants[2]` (Mandy) said she "uses the break to clear up what part
  one left behind" - the same defect one bio down, and the one that named the
  assistant as the answerer outright. Mandy is an assistant, not a tutor
  (`lms/team/tutor_catalog.json` gives her `"role": "assistant"` and
  `"title": "Grade 12 session assistant"`, and `assistants/CAPS/roster.json`
  maps `assistant_003` to her), so clearing up the maths is not hers to do.
  It now reads "in the break she reads out what part one left behind so your
  tutor can clear it up" - the same arc and the same sentence shape, with the
  answering moved to the tutor where `sessions.steps[1]` already puts it.
* The placeholder note above `testimonials` opened "these three are stand-ins"
  and contradicted itself four lines later, where it says all FIVE are. It
  says five from the first line now. Nothing else in the note changed - the
  rest of it is deliberate, including the registry row it points at.
* Unchanged on purpose: `sessions.steps[1]`, whose framing of the break
  questions as the students' own is an approved product decision, not an
  oversight; and the other four testimonials, which make no phase claim.
* Version-only side effects: `manifest.json` 1.26.0 -> 1.26.1. A copy
  correction with no new file, seam or floor is a patch, the way 1.4.1-1.4.3
  and 1.5.1-1.5.2 were. `LMS_LANDING_VERSION` in `lms-footer-chrome.ts` goes
  to 1.26.1 with it, keeping the step it is supposed to keep. No Dart file
  changed, so the Dart manifest stays at 1.16.9, and no new `base_sdk` seam
  or floor.

## 1.26.0

* The apps lead the header's panel, in one row (Ray, 2026-09-10:
  "header app links first. if possible put mobile apps in one row since
  supa dont have much menu"). `lms-header-menu.ts` now declares the
  groups as apps FIRST with `layout: "row"` (base_sdk 1.36.0's
  `HeaderMenuGroup.layout`), then Explore, then Platform, and
  `megaLabel: "Explore"` (base_sdk 1.36.0's `HeaderMenu.megaLabel`) so
  the bar still reads `[Explore v]  Pricing  FAQ`: the panel opens on
  the three app cards side by side across the widened lead column, with
  Explore (sessions, subjects, tutors) and Platform (features, partners
  with its badge) as the headed columns beside them. The items, the
  anchors, the flat links and the brand declaration are unchanged; the
  burger's stacked list shows the same three groups in the new order.
* The base_sdk floor is 1.36.0 for `components/custom/landing/header-menu.ts`
  and `components/custom/header-menu.tsx`: against 1.29.0-1.35.0 the two
  fields are type errors. (1.36.0, not 1.33.0: core's header release was
  re-versioned above base_sdk 1.35.0, which landed first.)
* The footer's wordmark carries no registered mark (Ray, 2026-09-10:
  "footer supa name has (r)"; the brand string is `supacharge.school`,
  lowercase, never decorated). `lms-wordmark.tsx` traced the ® the Dart
  app's AppHelpers appends after the name as the last five sub-paths of
  `LMS_WORDMARK_PATH`, and the footer drew it at the end of the name
  (`lms-footer-section.tsx` is the one place the shell draws the vector).
  Those sub-paths are gone from the component and from the two installed
  files (`public/brand/supacharge-wordmark.svg`, `-ink.svg`), and the
  viewBox ends just past the "e" - 660 units, was 690 - so the vector
  keeps its height and loses only the mark's width; the glyphs of the
  name are untouched, as is the accessible name. The hero's stem was
  clipped on its descenders and last glyph ("supa name in hero cut off
  on g and e"): that is base_sdk 1.36.0's fix in `hero-view.tsx`, and
  nothing here changes for it.
* The site url is `https://supacharge.school` (Ray, 2026-09-10: the .app
  domain is dropped entirely and must never be written into code again).
  `lms-site-metadata.ts` already said so; `test_site_name_is_the_brand_string`
  now also asserts that the .school host is the only host its code writes.

## 1.25.0

* The curriculum line names Cambridge, marked soon (Ray, 2026-09-10:
  "add soon label in curriculum for cambridge"). Cambridge was not on
  the page before - the subjects section's eyebrow and the Subjects
  feature card's first list line both read "Built for CAPS and IEB" - so
  it joins the line as the third curriculum, spelled as the backend's
  `CURRICULA` tuple spells it: "Built for CAPS, IEB and Cambridge", with
  base_sdk's `MenuLabel` pill (`badge="soon"`, the one the floating nav
  and the header wear, at its default size) right after the name. The
  pill is the only addition after the name; the word "soon" is never
  written in copy. The line is plain text, no link and no choice, so
  nothing carries `aria-disabled`.
* `LMS_LANDING_CONFIG.subjects.curricula` (`Curriculum[]`: `name`, and
  `badge` in base's `LandingNavBadge` vocabulary) is the one source; the
  new `landing/lms-curricula.tsx` renders it after `subjects.eyebrow`
  ("Built for") and both surfaces render that component - the Subjects
  feature card through `Feature.curricula: true`, before its `lines` - so
  the two copies of the line cannot drift. No "use client": `MenuLabel`
  is a plain component, so the pill is in the server-rendered first
  HTML. The prose that mentions CAPS and IEB (the subjects blurb, the FAQ)
  is unchanged.
* `manifest.json` 1.25.0: `lms-curricula.tsx` installed; no new base
  floor (base_sdk >= 1.32.0 as since 1.24.0). `LMS_LANDING_VERSION`
  1.25.0.

## 1.24.0

Requires base_sdk >= 1.32.0 (the floor moves from 1.29.0):
`PageSectionMeta.rootClass` and `HeroConfig.brand`, the two server-side
hooks of the server-rendered landing, ship there; against 1.29.0-1.31.0
both fields are type errors.

* The theme class is in the first HTML. base_sdk 1.32.0 renders the
  landing on the server, and until now its no-JS render painted unthemed:
  `lms-theme.tsx` put `sc-landing` on `<html>` from a client effect, so
  the server's copy first painted in the shell's own colours. Now
  `lms-theme-section.tsx`'s `meta` declares `rootClass: LMS_ROOT_CLASS`
  (the new `landing/lms-theme-classes.ts`: `sc-landing` and the two
  next/font variables, the one list the effect also uses), which base
  joins onto the landing root on the server; every `.sc-landing` rule
  matches before any script runs. Both modules carry no "use client"
  directive: base reads `meta` in the server render, where every export
  of a client module is a client reference (Next compiles it to
  `registerClientReference`) whose properties read as `undefined` - the
  section's component only renders the client `LmsTheme`, so nothing in
  it needs the client.
  The effect stays, idempotent with the root class (it adds only what
  `<html>` lacks and removes only that), for what only `<html>` can
  carry: the dark default, the `data-sc-theme` mirror and the
  `.sc-landing body` paint outside the root. `lms-theme.css` paints the
  root itself the way it paints body (`.sc-landing:not(html)`, under
  base's `bg-white dark:bg-black`) and lands its light set on the root as
  well as `<html>`, keyed on the shell's explicit `light` class
  (`html.light .sc-landing`) - the root's own dark set would otherwise
  out-cascade what it inherits - so a document with no mode at all (the
  render without JavaScript) keeps Supacharge's dark default.
* The hero stem is in the first HTML. `lms-hero-copy.ts` declares
  `brand: "stem"` and base's hero renders `brandStemOf(PLATFORM_NAME)` -
  "supacharge", the full name on the element's `aria-label` and `title` -
  on the server. 1.22.0's client rewrite is retired: `lms-hero-wordmark.ts`
  and the `MutationObserver` watch `lms-theme.tsx` started are deleted,
  and the hero's text never changes after hydration. base fits the stem
  to its own 250px slot rather than the hero's width, so the derived size
  rule stays in `lms-theme.css`, now keyed on the span base renders
  (`... > div:last-child > div > span`): `min(72px, (100vw - 32px) /
  (var(--hero-chars) * 0.68em))`, and `--hero-chars` - the stem's
  character count, from the very name base renders by the very rule base
  derives it with (`heroWordmarkChars`, `brandStemOf` imported, not
  restated) - is one `<style>` rule `LmsTheme` renders, a build constant
  on both sides. The 1.21.0 clamp for the server-rendered full name and
  the `span > span[data-sc-brand-name]` rule are gone with the rewrite;
  the `::after` mark stays switched off, retargeted to the same span.
* Every section entry is server-readable. The rootClass fix above held
  only for `lms-theme-section.tsx`; the other ten registered modules
  still began with "use client", so on base_sdk 1.32.0's server render
  their `meta.order`, `meta.nav` and `meta.renders` read as undefined:
  every section fell to order 100, the floating nav listed it by file
  name ("Scroll to lms-sessions-section"), the Explore mega menu's
  anchors did not resolve and pricing never dropped without plans. Now
  the contract is one rule for all of them: the ENTRY module (the one
  the page-sections line imports) has no directive and exports `meta`
  and the default component; whatever needs the client - hooks, state,
  effects, browser APIs, framer-motion - lives in a sibling
  `<name>.client.tsx` that starts with "use client" and the entry
  renders. `lms-floating-nav`, `lms-tutors-section`, `lms-pricing` and
  `lms-faq-section` are split that way (`showsPricing`, the pure rule
  `meta.renders` asks, stays in the pricing entry); sessions, subjects,
  features, partners, testimonials and footer had nothing that needed
  the client and only lose the directive. Markup and behaviour are
  unchanged; `manifest.json` installs the four client halves.
* `manifest.json` 1.24.0: the hero wordmark install is dropped; the
  `page-sections.ts` and `hero-config.ts` floors move to base_sdk >=
  1.32.0; `app/config/platform.ts` joins `requires` (host-owned, the name
  the count follows); "Since 1.24.0" notes, the section contract in
  `about` among them. `LMS_LANDING_VERSION` 1.24.0.
* Tests: `TestBrandString` now holds that the copy declares the stem, that
  no client rewrite remains, that the count is derived under node from the
  same names 1.22.0 ran (`supacharge.school` counts 10) and that the size
  rule is keyed on base's element; `TestServerHooks` holds the rootClass
  declaration, its one shared list, the idempotent effect and the 1.32.0
  floor in the manifest and this changelog.

## 1.23.0

* Most of the header's section links move into the mega menu (Ray,
  2026-09-10, on supacharge.app: "some of menus in header i think there
  should have gone to mega menu"). The desktop bar now reads
  `[Explore v]  Pricing  FAQ`; the panel behind the trigger has three
  columns - Explore (sessions, subjects, tutors: the first group, so
  base draws its label as the ONE trigger and its items as the 300px lead
  column), Platform (features, partners) and Get the app (the same app
  cards as before, unchanged). `lms-header-menu.ts` orders its `groups`
  for that render and lists every section entry as `{ anchor: id }`, the
  id-only form the flat `anchors` list already used, so base still
  resolves each against the page's live nav: the words and badges come
  from the sections' own `meta.nav` (partners keeps its "new"), and
  `pricing` - one of the two links kept flat - is still dropped when
  `lms-pricing.tsx` renders no plan. The burger panel lists the same two
  links and the same three headed groups. The two new group labels,
  "Explore" and "Platform", are this module's own words: a group is not a
  section, so there is no `meta.nav` to lift them from. No new base_sdk
  floor: the anchor form of a group item and the panel are base_sdk
  1.18.0's, and the floor stays at 1.29.0 (1.22.0).

## 1.22.0

Requires base_sdk >= 1.29.0 (the floor moves from 1.28.0): `brandStemOf`,
the stem rule the hero wordmark now reads, ships there.

* The hero wordmark shows the site name's STEM, never the dotted suffix
  (Ray, 2026-09-10: the landing hero must not show ".school"; "we not hard
  coding but saying if value of x has a dot, do this"). The text is
  derived from whatever name the shell renders: the part before the first
  dot when the name has one at index > 0, the whole name otherwise - the
  ONE rule base_sdk 1.29.0's header already folds the brand by, exported as
  `brandStemOf(name)` from `components/custom/landing/header-menu.ts` and
  imported, not restated, by the new
  `components/custom/landing/lms-hero-wordmark.ts` (`heroWordmark(name)`
  answers `{ text, name }`). No brand string is written anywhere new.
  base's hero frame draws the host's `Branding`, which prints
  `PLATFORM_NAME`, and exposes no name hook, so `lms-theme.tsx` keeps the
  frame's brand span on the stem while the landing is mounted
  (`watchHeroWordmark`: applied at mount and again on any tree change,
  restored on unmount), reaching that span the way `lms-theme.css` already
  re-paints the frame through `#hero`; the full name stays on the same
  span as its `aria-label` and `title`, so assistive tech and a hover
  still carry the address. Safe against hydration: base's landing host
  loads its sections on the client after the page hydrated, and React
  never rewrites a text node whose content did not change. Metadata,
  `<title>`, canonical, the Open Graph card and the header are untouched
  (the header still shows the full name and folds it to the stem itself).
* The hero wordmark's size follows the text (`lms-theme.css`): once the
  stem is in, `--hero-chars` (the rendered text's character count, set
  inline) sizes it as `min(72px, (100vw - 32px) / (chars * 0.68em))` -
  the way base sizes its header stem from `--brand-chars` - so a stem of
  any length fills the hero's usable width without crossing it and no
  pixel is tuned to one brand: about 53px at 390 for 10 characters (the
  1.21.0 clamp, sized for the 17-character dotted name, gave 33px), 72px
  from 785 up. That clamp stays as the size of the server-rendered full
  name for the moment before the sections load. The `::after` mark stays
  switched off as 1.21.0 left it.
* Tests: `TestBrandString` reads the stem rule's import, the accessible
  name and the derived size, runs `heroWordmark` under node for a dotted,
  a multi-dot, a trailing-dot, a leading-dot, an undotted, a padded and
  an empty name, and holds the no-®-mark case; `TestHeaderCollapse` and
  `TestVersion` follow the floor.

## 1.21.0

* Site metadata origin moves to https://supacharge.school (Ray,
  2026-09-10). Runtime still prefers NEXT_PUBLIC_SITE_URL; this is the
  fallback and the value rokct.ai's strip resolves the Supacharge
  self-host from. No visible change. The calendar export UID suffix is
  unchanged.
* The brand string is `supacharge.school`, lowercase, wherever it is
  written as the brand (Ray, 2026-09-10; never "Supacharge School", never
  "Supacharge.school"). `lms-site-metadata.ts` registers `siteName:
  "supacharge.school"` and leads its `title` with it - the one name this
  SDK supplies base with, read for the application name, the Open Graph
  site name, the `%s — <siteName>` page-title template and the preview's
  alt; base's header folds the dotted name to its stem after the collapse
  delay, so this SDK supplies the full name. `lms-wordmark.tsx`'s default
  accessible name (the footer's brand line) is the same string. base_sdk
  1.28.0's `HeaderBrand` has no name field (the wordmark text is the host's
  `PLATFORM_NAME`), so `lms-header-menu.ts` declares nothing new; its
  comment records where the name lives. Prose about the product - the
  description, the keywords, the hero and FAQ copy - keeps "Supacharge".
* Hero wordmark font floor lowered so a dotted host name fits at 390
  (`lms-theme.css`: `clamp(28px, 8.5vw, 72px)`, was `clamp(40px, 9vw,
  72px)`). The hero renders the host shell's PLATFORM_NAME as text; at
  390 the old 40px floor put a 17-character `supacharge.school` (plus the
  ® pseudo-element) past the 358px usable width, so the row overflowed
  both edges. Now 33px at 390; 1280 is unchanged at 72px.
* Hero wordmark mark (®) switched off pending a trademark check; rule kept
  (`lms-theme.css`: the `::after` block's `content` is `none`, so no box and
  no margin gap; restore `content: "\00ae"` to re-enable).

## 1.20.0

Requires base_sdk >= 1.28.0 (the floor moves from 1.26.0): the letter tile
a collapsing brand with no image folds into is base_sdk 1.28.0's.

* The header brand collapses, the way rokct.ai's does. Ray, 2026-09-10, on
  supacharge.app: "the country code is lost in supacharge it is only in
  rokctai" and "rokctai has logo and name that the name fold into logo and
  menus disapear, this is not in supacharge. since supacharge has not icon
  cant it fold and only leave the first letter as its icon?" Both were the
  one missing declaration: `lms-header-menu.ts` said `brand: { logo:
  "none" }` and nothing about `collapse`, so base's header drew the still
  wordmark, ran no timer, faded no nav and had nowhere to draw a code. So:
  * `components/custom/landing/lms-header-menu.ts` declares
    `brand: { logo: "none", collapse: { delayMs: 1500, code: marketCode } }`
    - rokct.ai's 1500ms, the logo still no image. base_sdk 1.28.0 then
    shows the "Supacharge" wordmark and the menu at load, folds the
    wordmark into a 44px letter tile ("S" in the primary colour on the tab
    icon's dark ground - base draws it, this SDK ships no icon) after
    1.5s with the code and a chevron beside it, and fades the desktop nav
    until the pointer is over the bar or the page is scrolled past 10px.
  * The code is the market's region, `localeRegion(LMS_SITE_METADATA.locale)`:
    the Open Graph locale `lms-site-metadata.ts` already registers with
    base (`en_ZA` -> `ZA`). rokct.ai's code is the visitor's country from a
    host-only branding cache (rokctai_frontend's app/config/platform.ts
    over its geo lookup) that supacharge-web has no counterpart of - its
    `getBrandingSync()` answers an empty code - so nothing is asked of the
    host and the letters are written in no new place; move the locale and
    the code follows. A locale with no region draws no code.
  * Manifest: version 1.20.0; the base floor 1.28.0 on `about`,
    `components/custom/header.tsx` and
    `components/custom/landing/header-menu.ts`; the footer advertises
    1.20.0.
* Tests: `TestHeaderCollapse` - the declaration (logo still `"none"`,
  1500ms, the code from the site locale, no country letters in the
  module), `localeRegion` run bare under node (`en_ZA`, `en-ZA`,
  `zh_Hant_TW`, a bare language, a numeric region, empty and nothing), and
  the 1.28.0 floor on the manifest and at the head of the changelog.

## 1.19.0

Requires base_sdk >= 1.26.0 as before; the floor is unchanged.

* The feature cards are a bento, not eight identical tiles. The
  supacharge.app audit finding "eight identical icon-in-square feature
  cards" (Ray, 2026-09-09: "the eight identical feature cards if its your
  day you need to fix"). The features section keeps its copy, its icons,
  its order and its phone swipe row, and draws the eight cards as a bento:
  * Schedule and Tutors span two columns (the screen the heading names and
    the two-tutor format the sessions section sells); the rest are single.
    Five columns from 1024px (2+1+2 over 1+1+1+1+1, no hole, tour order);
    two from 640px with the wide cards first; the `.sc-row` swipe row
    below 640px as before (Ray, 2026-09-09: "actually most cards should be
    one row in mobile"), with the wide cards first there too. A wide card
    lays its icon or figure beside the words.
  * Five treatments, one per card, assigned in the config so no two
    neighbours - beside or above - share one at any width: glow (icon over
    a radial accent), numeral (the "2" from "Two tutors per subject"), list
    (the subjects eyebrow and grades line under Subjects), gradient
    (primary tint into the card), outlined (no fill, primary-leaning
    stroke). The identical square icon tile is gone; every colour is a
    lms-theme.css token, mixed with color-mix() where a step is softer.
  * `Feature` gains `treatment`, `wide`, `figure`, `lines`
    (`lms-landing-config.ts`); the new
    `components/custom/landing/lms-features.css` is installed by the
    manifest and imported by the section. No new image, dependency or
    copy; nothing animates.
  * Manifest: version 1.19.0; the sheet installed; the footer advertises
    1.19.0.
* Tests: `TestFeatureCards` lays the cards out the way the browser will at
  each width and checks the neighbour rule, the two wide cards, that every
  figure and line is copy the config already carries, and that the sheet
  holds no literal colour.

## 1.18.0

Requires base_sdk >= 1.26.0 as before; the floor is unchanged.

* supacharge.app shows no network strip. Ray, 2026-09-09: "supacharge
  dont need the strip yet". base_sdk 1.23.0 draws the other sites of the
  Rokct network under "Trusted by" in every shell's footer row by default
  (`FooterChromeRow`, the row `lms-footer-section.tsx` ends the landing
  page with), minus the shell itself - so supacharge.app was showing
  rokct.ai and juvo there. So:
  * `components/custom/landing/lms-network-strip.ts` registers
    `placement: { landing: "none", footer: false }` with one line at
    `// @rokct-sdk-network-strip-start`
    (`components/custom/landing/network-strip.ts`). Base's rule then
    draws nothing on any surface: not in the footer row, not on the
    landing page. Nothing else is said - no heading, no order, no hidden
    keys - and no URL is named; the list stays base's. The shape is
    written out structurally, like `lms-site-metadata.ts`, so an older
    base still compiles the shell. When Ray wants the strip,
    `footer: true` (base's default) is the only change.
  * `lms-footer-section.tsx` passes nothing to `FooterChromeRow`: the
    registration, not a prop, keeps the strip off, so a second footer or
    a host footer that renders the row gets the same answer.
  * Manifest: version 1.18.0; the module installed; requires
    `components/custom/landing/network-strip.ts` (optional against an
    older base: the installer skips the line with a warning); the footer
    advertises 1.18.0.
* Tests: `TestNetworkStrip` - the module is installed, registered where
  base looks in base's one-line contract, says footer off and landing
  none and nothing more (no URL, no tracking word, no import), and no
  landing or footer template of this SDK draws the strip or writes its
  "Trusted by" heading itself (the hero's `trustLine` is copy about
  learners, not the strip).

## 1.17.0

Requires base_sdk >= 1.26.0 (the platform marks under public/brand/marks/,
which base now installs on every host). Against base_sdk <= 1.25.0 the
paths this SDK names resolve to no file and the hero badges and the
lesson prompt draw a broken image, so this version must not be composed
over an older base. The base floor was 1.21.0 through 1.16.0.

* The store marks are base_sdk's, not this SDK's. base_sdk 1.26.0
  installs `public/brand/marks/chrome-web-store.svg`, `google-play.svg`,
  `app-gallery.svg`, `app-store.svg` and `windows.svg` on every host - the
  one set of official platform marks, shared by every home SDK, the same
  drawings this SDK shipped in 1.16.0 - and a home SDK opts into a file by
  naming its path as the image src. So:
  * `templates/public/brand/marks/` and its four files are gone. The
    `templates/public/brand` -> `public/brand` mapping stays: it still
    carries the Supacharge wordmarks and the social still.
  * `lms-hero-copy.ts`'s `LMS_APP_MARKS` table and
    `lms-download-app.tsx` keep the same `/brand/marks/...` paths, so
    nothing visible changes on the hero badges or the lesson prompt.
  * `lms-theme.css` no longer touches a mark. base applies the dark-mode
    treatment for the two monochrome files, app-store.svg and
    windows.svg, itself, keyed on the src basename, and never filters a
    coloured mark, so the 1.16.0 rule that did that under `#hero` is
    gone; no lms stylesheet filters a mark and a home SDK must not ship
    one.
  * Manifest: version 1.17.0, base floor 1.26.0; the footer advertises
    1.17.0.
* Tests: `test_hero_badge_marks_are_the_store_marks_installed_locally`
  becomes `test_hero_badge_marks_are_base_sdks_files` (the mapping and
  the prompt are unchanged; no `templates/public/brand/marks` in this
  SDK; the wordmarks still install), `test_marks_carry_the_colours_ray_ruled`
  goes with the files, `test_only_the_two_monochrome_marks_are_inverted_in_dark_mode`
  becomes `test_no_lms_stylesheet_filters_a_mark` (no `invert`, no
  `filter:`, no `/brand/marks/` in lms-theme.css or any other lms CSS),
  and the manifest names the 1.26.0 floor. The storeUrl, shown and
  wording tests are unchanged.

## 1.16.0

* The hero badges carry the store marks every visitor already knows, in
  their own colours. Ray, 2026-09-09: "we already have nice icons in
  buttons in hero of rokct but supacharge is getting bad ones. we use what
  these platforms use for familiarity"; the four files are Ray's own picks
  ("you will change colors"; "apple is black could be white, huawei is
  black should be red or meroon"; on Windows: "keep it black and white").
  * `public/brand/marks/` now holds `google-play.svg` (the Google Play
    triangle in Google's four colours, `#EA4335` `#FBBC04` `#4285F4`
    `#34A853`, kept exactly as they are; the triangle is centred in a
    square frame so the mark is 24x24 like the others), `windows.svg` (the current
    Windows logo, four equal panes), `app-store.svg` (the Apple mark) and
    `app-gallery.svg` (the Huawei flower in Huawei red, `#CF0A2C`).
    `android.svg` (the robot) is gone. Each is a clean standalone SVG: a
    `viewBox`, plain paths, no width or height, no script, no style, no
    metadata, no external reference, no raster. Served through the same
    `public/brand` mapping; no CDN, no new dependency.
  * The badges say what the stores say. Ray, 2026-09-09: "but eventually
    we getting in those stores except windows". Each `LandingApp`
    (`lms-landing-config.ts`) now carries `badge: { eyebrow, label }` in
    place of `eyebrow` - the store's official badge wording over that
    store's mark: "GET IT ON" / "Google Play" (Android), "Download on the"
    / "App Store" (iOS), "EXPLORE IT ON" / "AppGallery" (the new `huawei`
    entry), and "Download for" / "Windows" for the one platform with no
    store - and `storeUrl`, a string that is empty until the listing
    exists. `LMS_SHOWN_APPS` is every entry shown on its direct download
    plus every entry whose `storeUrl` is set, linked to that listing in
    place of its `href`, so one config line flips a store on and every
    surface (header cards, hero badges, footer links, lesson prompt)
    follows. Shown today, left to right: Android (Play wording, the direct
    download until its `storeUrl` is set), the new `huawei` entry
    (AppGallery wording over the Huawei mark, on the same direct Android
    download until its listing exists - Ray, 2026-09-09: "yes though we
    havent built for huawei yet though we have hms sdk") and Windows. The
    iOS entry sits in the list with its mark, `shown: false` and an empty
    `storeUrl`, pointing at the releases page, and a test proves that
    setting one `storeUrl` shows an entry and relinks it. No hard-coded
    store URL anywhere; no rendered word says APK. `lms-hero-copy.ts`
    maps each entry to its mark (`LMS_APP_MARKS`: Google Play, Windows,
    App Store in place of the frame's built-in `"app-store"` glyph, and
    AppGallery).
  * The two monochrome marks (Apple, Windows) are `fill="currentColor"`
    files, black on the white pill. The frame draws a mark as an `<img>`,
    an isolated document in which `currentColor` cannot follow the badge
    text, so `lms-theme.css` inverts exactly those two images under the
    `dark` class (white on the zinc-900 pill) and never the coloured ones.
    The 1.15.0 rule that inverted every badge image is gone.
  * The lesson download prompt (`components/custom/lms-download-app.tsx`,
    1.12.0) draws the same marks beside its buttons, through the same
    `LMS_APP_MARKS` table, in place of lucide's generic phone and monitor.
    The header's app cards still take base's named icons
    (`HeaderMenuIcon`), which have no image slot - a base_sdk change if
    they are to carry the marks too.
  * Tests: every mark parses as XML, carries a `viewBox`, has no width or
    height, no script, no style, no external reference, no raster; the
    colour rule is asserted per file (Google's four, Huawei red,
    `currentColor` and nothing else on Apple and Windows); the mapping,
    the scoped dark rule and the absence of the blanket 1.15.0 rule are
    checked; the prompt is checked to read the one table. No base_sdk
    change; the base floor stays 1.21.0.

## 1.15.0

* The hero's download buttons are store badges, say the platform and not
  the file format, and the sign-in button is gone from the hero. Ray,
  2026-09-09: "rokct has platform logos but supacharge doesnt in those app
  buttons"; "its saying apk which it should not"; "supacharge must lose
  signin button in hero i think it was added as it had only one app link".
  * The download buttons are base_sdk's own store badges, not a button of
    this SDK's drawn in their shape (Ray, 2026-09-09, on that button: "cant
    say this, look at the rokctai hero how it say it").
    `components/custom/landing/lms-hero-copy.ts` now registers one
    `HeroBadge` per `LMS_SHOWN_APPS` entry (`LMS_HERO_BADGES`) and the frame
    draws it exactly as it draws rokct.ai's - the same pill (white, or
    zinc-900 in dark mode, rounded-xl, shadow, hairline border, scale on
    hover), the same mark at the left, the same 10px uppercase grey small
    line over the same 16px bold big line, the same `md` breakpoint below
    which only the mark shows - with rokct.ai's wording pattern ("Available
    in the" over "Chrome Web Store", "Download on the" over "App Store")
    applied to a platform that has no store: the entry's `eyebrow`
    ("Download for") over its `platform` ("Android", "Windows"). The trust
    line is the frame's too, over the badges, as on rokct.ai.
  * The marks are SVG files this SDK installs under `public/brand/marks/`
    (`android.svg`, `windows.svg`: the Simple Icons tracings, CC0; no CDN,
    no new dependency), handed to the frame through its `{src, alt}` icon
    slot (`LMS_APP_MARKS`); the demoted iOS entry keeps the frame's own
    `"app-store"` glyph for the day it is shown again. The frame draws an
    image mark as an `<img>`, which cannot take the badge's text colour
    the way its built-in marks do, so `lms-theme.css` inverts the black
    marks to white under the `dark` class next-themes writes on `<html>`
    (the one signal lms-theme.tsx and Tailwind's `dark:` variants read).
    No base_sdk change: `HeroBadge.icon` has taken `{src, alt}` since the
    hero-copy registry (base 1.6.0), and base 1.23.0 keeps it.
  * `components/custom/landing/lms-hero-form.tsx` draws nothing any more:
    no button of its own, no sign-in `Link` (the header carries sign-in
    and sign-up, and the hero's job is the download), no trust line of its
    own (the frame's is the one rendered, or the line would appear twice).
    It stays registered as the seam for a body of Supacharge's own; with
    it rendering nothing the slot is exactly what the frame renders with
    no form registered.
  * `LandingApp` (`lms-landing-config.ts`) gains `platform` and `eyebrow`,
    and no rendered word says APK any more: the android entry is
    "Android app" with the description "Direct download for Android from
    the latest release" (was "Android app (APK)" / "Direct APK download
    from the latest release"); the desktop entry's description is "Direct
    download for Windows from the latest release". The header's app cards
    (the mega menu's "Android app (APK)" card), the footer links and the
    lesson prompt read the same fields, so they change with it. "APK"
    survives only in comments and in the asset-name pattern the download
    route matches, which no visitor sees.
* The download buttons download the file. Ray, 2026-09-09: "there is no
  way we can resolve to get the direct download link?". There is: the
  release lane names every asset for its version (`app-v1.2.9.apk`,
  `app-windows-v1.2.9.zip`), so GitHub's stable
  `releases/latest/download/<asset>` form - which needs a version-less
  name - never resolves and 1.4.1 sent visitors to the releases page; but
  the public releases API lists the latest release's assets, and the
  repository is public, so a small route can resolve the file each time.
  * `app/download/[platform]/route.ts` (new; `GET /download/android`,
    `GET /download/windows`) fetches
    `https://api.github.com/repos/RokctAI/supacharge/releases/latest`
    through Next's data cache with `next: { revalidate: 600 }` - one call
    serves every visitor for ten minutes, and a new release is live within
    ten - and answers a 302 to that platform's asset. No token and no
    environment: the API is public and unauthenticated. When the API is
    unreachable, rate-limited or the release has no asset for the platform
    the 302 goes to the releases page instead (the release's own page when
    the API gave one), so the button never dead-ends. A platform the route
    does not serve - iOS, which no lane builds and no listing carries - is
    a 404, never an invented URL, and that entry stays hidden with its
    releases-page href. A prefetch (`Next-Router-Prefetch`, `RSC`,
    `Purpose: prefetch`) is answered 204 with no redirect so a router
    warming the link cannot start a 127 MB download; the entries stay
    `external: true` so every surface renders a plain anchor rather than a
    `Link`.
  * `app/download/[platform]/resolve.ts` (new) is the pure half - the
    platform table with each platform's asset-name patterns in order of
    preference (Android: `app-v<version>.apk`, NOT `app-debug-v<version>.apk`
    or the `.aab`; Windows: the single installer
    `<app>-windows-setup-v<version>.exe` the release lane is moving to
    (Ray, 2026-09-09: one installer instead of the zip) first, then
    `app-windows-v<version>.zip` for the releases that still carry only the
    archive, NOT `update_package.zip`), `pickAssetUrl` and
    `resolveDownload` - with no imports and no environment, so
    `tests/test_download_route.py` runs it under node against a fixture
    shaped like the v1.2.9 release, with and without the installer. The
    Windows badge says "Windows" either way, never the file type.
  * The shown `LMS_APPS` hrefs are now `/download/android` and
    `/download/windows`; `LMS_LANDING_CONFIG.app` and the iOS entry still
    point at the releases page. `/download/<platform>` is two path
    segments, which auth_sdk's middleware matcher (`/:id`, `/handson/:path*`)
    does not cover, so no gate was added and none is needed.
* The hero wordmark renders at its set size. Ray, 2026-09-09: "the
  supacharge name in hero is small". base's hero frame gives the wordmark
  a fixed 250px slot and the host shell's `Branding` shrinks its text to
  fit whatever slot it measures on mount; `lms-theme.css` had widened that
  slot to `auto` since 1.2.0, but `lms-theme.tsx` puts `sc-landing` on
  `<html>` after `Branding` has already measured the 250px, so the
  wordmark kept the inline `transform: scale(0.506)` (and the wrapper the
  matching inline width) that fitted a 72px "Supacharge" into 250px: 238px
  wide and 36px tall at 1280, beside a 60px rotating headline word. The
  stylesheet now clears both inline styles (`transform: none !important`
  on the wordmark, `width: auto !important` on its wrapper), from outside
  the frame as it already re-paints the rest, and the wordmark is the
  72px the rule sets at 1280 (rokct.ai's is 76px) and 40px at 390. No
  base_sdk change; the base floor stays 1.21.0.

## 1.14.0

* The tutor cards keep scrolling like the testimonials. Ray, 2026-09-09:
  "tutor cards should keep scrolling like testamonials". The testimonials
  have run rokct.ai's auto-scrolling row since 1.10.0 (base_sdk >= 1.14.0's
  `components/custom/landing/testimonials-marquee.tsx` over its
  `app/styles/rokct-marquee.css`); the tutor roster was the swipeable deck
  at every width, so on a desktop it stood still until dragged.
  * `components/custom/landing/lms-marquee.tsx` (new) is the same row with
    the card left to the caller: base's `TestimonialsMarquee` draws its
    own quote card from an `items` list and has no slot for a card that is
    already a component, and the tutor card flips, carries a portrait and
    a sign-up link and is `lms-tutor-card.tsx`'s to draw. The DOM is the
    marquee's - the clipping frame, the two edge fades, the `w-max` track
    carrying `rokct-marquee`, `rokct-marquee-track` and
    `group-hover:[animation-play-state:paused]` - and it imports base's
    `app/styles/rokct-marquee.css` by the path base's own component uses,
    so the keyframes, the pause under the pointer and the stillness under
    `prefers-reduced-motion` are base's one rule set; nothing is copied
    out of that file and there is no base_sdk change. Two things the
    testimonials' row does not need: the track is measured and
    `--rokct-marquee-duration` set so the row travels at the testimonials'
    own pace (five 350px cards and their gaps over 60s, 1850px a minute)
    rather than at their per-loop duration, since a loop of twelve tutors
    at 60s would go by twice as fast; and a row whose one copy of cards is
    narrower than its frame - the three assistants on a wide screen, or a
    short roster - stands still and centred as a single copy with no fades
    and no animation, never blank, and becomes a marquee again the moment
    the frame is narrower than its cards. The first render assumes it
    overflows, so the server sends the moving row. The copies after the
    first are `aria-hidden` (a reader hears each tutor once) and stay
    clickable, because the card under the pointer is a copy two thirds of
    the time.
  * `components/custom/lms-tutors-section.tsx` renders TWO rows and the
    breakpoint picks one, so the server sends the right row for the width
    and nothing shifts on hydration. From 640px up the roster, and the
    assistants under it, run in the marquee, full-bleed as the
    testimonials' row is. BELOW 640px the roster is the deck exactly as
    1.3.0 left it (Ray, 2026-09-08: "the tutor cards can still be a deck
    that take one row and can be swipped like in dart"), to the class:
    one swipeable row, the next card's edge showing, one card per swipe,
    dots under it. A visitor who asked for reduced motion gets the deck at
    every width - a still row scrolled by hand is what the marquee's
    reduced-motion rule promises, and the deck is that row with arrows,
    dots and keys. Every prop the section had is kept: the cards, their
    portraits, subjects, grades, `priority` on the first four, the
    `signupUrl` behind "Start with", the assistants' `sc-deck-trio` and
    `lg:max-w-3xl` (which now only matter below 640px, and stay).
  * `components/custom/landing/lms-flip-card.tsx` exports the
    `useMediaQuery` hook it already had, for the section's reduced-motion
    check; its own use is unchanged.
  * `components/custom/landing/lms-theme.css` adds `.sc-marquee-slot`, the
    fixed card width a marquee track needs (17rem, the deck's four-across
    card at 1280px), beside the deck widths for the reason they are there.
  * `manifest.json` installs the new file and adds
    `app/styles/rokct-marquee.css` to `requires` (base_sdk >= 1.14.0, the
    floor the testimonials already stand on). The base floor stays 1.21.0.
  * `lms-testimonials-section.tsx` is untouched and still renders base's
    `TestimonialsMarquee`. `LMS_LANDING_VERSION` is 1.14.0;
    `tests/test_landing_apps.py` asserts the tutors section renders the
    lms marquee from 640px up and the deck below, the testimonials section
    still renders base's, and the lms marquee runs on base's classes and
    stylesheet.

## 1.13.0

* The header shows the wordmark only. Ray, 2026-09-09: "i saw supacharge
  got a s logo in header, let home sdk declare if it needs logo there or
  not. supacharge text is the logo right now until i design an icon". The
  "S" was supacharge-web's own `components/custom/brand-logo.tsx`, an
  asset-free placeholder that draws the platform's first letter on a dark
  square, which base_sdk's header rendered beside the wordmark because
  nothing told it not to.
  * `components/custom/landing/lms-header-menu.ts` declares
    `brand: { logo: "none" }` (base_sdk >= 1.21.0's `HeaderMenu.brand`):
    no image in the brand slot, the wordmark (`branding.tsx`) alone.
    Nothing else about the menu changes. When an icon is designed, the
    declaration becomes its path.
  * `manifest.json` names the floor: `components/custom/landing/header-menu.ts`
    and `components/custom/header-menu.tsx` at base_sdk >= 1.21.0, and
    `components/custom/header.tsx` (the header that reads the
    declaration) joins `requires` at the same floor. Against 1.18.0-1.20.0
    the field is a type error in the registry's `HeaderMenu`.
  * `LMS_LANDING_VERSION` is 1.13.0; `tests/test_landing_apps.py` asserts
    the declaration and Ray's reason beside it.

## 1.12.0

* The landing shows the app's downloads as two entries, and iOS is demoted.
  Ray, 2026-09-09: "supacharge need to show these apps, ios is demoted for
  now. apk and desktop app".
  * `components/custom/landing/lms-landing-config.ts` gains `LandingApp`
    (a `LandingLink` with `id`, `description`, `icon` and `shown`) and
    `LMS_APPS`, one entry per platform, copied from what the app's release
    lane actually publishes (RokctAI/supacharge
    `.github/workflows/release.yml`, `build_android: true` and
    `build_windows: true`; the v1.2.9 release carries `app-v1.2.9.apk`,
    `app-v1.2.9.aab`, `app-windows-v1.2.9.zip`): `android` - "Android app
    (APK)", "Direct APK download from the latest release", icon
    `smartphone`; `desktop` - "Desktop app", "Windows build from the latest
    release", icon `box` (base's header bundles no monitor glyph; a
    `monitor` entry in `HeaderMenuIcon` is a base_sdk change); and `ios` -
    kept in the list with `shown: false` and a "demoted for now" comment,
    because no iOS lane or App Store listing exists. `LMS_SHOWN_APPS` is the
    filtered list and the ONLY thing a surface reads. Every `href` is still
    the releases PAGE, `https://github.com/RokctAI/supacharge/releases/
    latest`, for the reason 1.4.1 gave: assets are named per version, so no
    `releases/latest/download/<file>` link is stable. There is no macOS or
    Linux build, so "Desktop app" means the Windows build. No Play or App
    Store link exists in any source, so none is shown.
  * `components/custom/landing/lms-header-menu.ts` adds ONE group,
    `apps`, labelled with the landing's own "Get the app"
    (`LMS_LANDING_CONFIG.app.label`), whose items are the shown apps with
    their descriptions and icons. A group rather than flat `links` because
    base_sdk 1.18.0 draws an item with a description or an icon as a card
    only inside the groups panel: the desktop bar leads with the one
    trigger that opens the two cards, the burger lists them under the same
    heading. `LMS_LANDING_CONFIG.app` itself is FLAGGED as no longer
    rendered by any surface and kept (a shell may still read it).
  * `components/custom/landing/lms-hero-form.tsx` renders one button per
    shown app - the APK as the primary, the desktop build outlined -
    ahead of "Sign in", the entry's description as the button's title;
    `components/custom/lms-footer-section.tsx` one link per shown app in
    place of the single "Get the app".
  * The base_sdk floor moves from 1.14.0 to 1.18.0: `HeaderMenuLink`'s
    `description` and `icon`, the `HeaderMenuIcon` set `LandingApp.icon`
    is typed as, and the panel that draws them ship there; against
    1.14.0-1.17.0 the fields are type errors. `manifest.json` `requires`
    is unchanged in members; its notes for `header-menu.ts` and
    `header-menu.tsx` name the new floor.
* The web does not play lessons; it asks for the app. Ray, 2026-09-09:
  "supacharge web doesnt play lessons or whatch libray but you should be
  able to watch schedule if you are logged in. for attending lessons it
  should ask you to download app on phone or download desktop app" -
  because "we make things to apps so it will mean waiting on downloading
  those assets to users browser before play. so they will be able to do
  other things like partner loging in to check his students, or student
  wanting to pay or update details on the go".
  * What the web half shipped: ONE playback surface,
    `app/handson/all/lms/courses/[courseName]/learn/[lessonId]/page.tsx`
    (react-player over `video_url`/`youtube`, the EditorJS body, the
    discussions, anti-skip completion); NO library or watch route; the
    schedule as the lms home, `app/handson/all/lms/page.tsx`
    (`LMS_LANDING_CONFIG.home.url`), whose Upcoming Live Classes come from
    `lms.lms.api.get_my_live_classes`.
  * Replaced: the lesson route still resolves (the `learn/` layout 404s only
    for a missing course) but now renders the new
    `components/custom/lms-download-app.tsx` - the landing's "Get the app"
    heading, one line from Ray's brief ("Lessons are attended in the app.
    Download the app on your phone or download the desktop app."), and one
    button per `LMS_SHOWN_APPS` entry with its description (Android APK,
    desktop; iOS never reaches it) plus a "Back to course" link. The
    player is moved whole to
    `learn/[lessonId]/_components/lesson-playback.tsx`, flagged NOT USED
    ON THE WEB, and nothing imports it, so react-player stays out of the
    web bundle. `react-player`, `@editorjs/*` stay in `dependencies` for
    it.
  * Schedule: kept as it is. The lms home and every lesson route sit under
    `/handson`, which auth_sdk's `middleware.ts` matcher already gates
    (`auth.config.ts`: `isOnHandsOn && !isLoggedIn` returns false), and
    `app/page.tsx` sends an anonymous `/` to `/landing`; no new auth
    mechanism. Gap, reported not built: the Flutter schedule reads
    `replay.api.get_upcoming_sessions`
    (`replay/frappe/src/tenant/replay/api/get_upcoming_sessions.py`), a
    different feed from the web dashboard's live classes.
  * Account surfaces the web keeps, untouched: profile and details update
    (`me/profile/page.tsx`, `updateProfileAction`), batches, courses,
    quizzes, assignments, jobs. Gaps, reported not built: no partner
    "my students" view and no signed-in billing/pay page on the web
    (paying is the landing's pricing section via
    `LANDING_CONFIG.planSignupUrl`).
* `tests/test_landing_apps.py` (new; stdlib + node
  `--experimental-strip-types`, the shape base_sdk's own tests take):
  `LMS_APPS` lifted out and read under node - the shown ids are exactly
  `android` and `desktop`, `ios` is present with `shown: false` and no
  surface names it, every href is https, the labels and icons are the
  ones above; the header menu, hero, footer and prompt read
  `LMS_SHOWN_APPS` and never `LMS_APPS`; the lesson route renders the
  prompt and imports no player while the flagged playback file still does;
  `home.url` is under `/handson/` (the gated prefix); manifest version,
  CHANGELOG head and `LMS_LANDING_VERSION` agree; the manifest notes name
  the 1.18.0 floor. `LMS_LANDING_VERSION` is 1.12.0 (it had drifted to
  1.9.0).

## 1.11.0

* The social card shows a still from the tour. Ray, 2026-09-09: the link
  preview shows a still from the tour, not only the wordmark - and base_sdk
  1.16.0 gave `SiteMetadataCopy` the two fields for it: `still`, a portrait
  screenshot the generated 1200x630 preview draws 372px wide inside a phone
  bezel on the card's right half, and `stillAnchor`, where that phone hangs
  from (`"bottom"`, the default, sets the bezel 72px under the top edge and
  lets the phone bleed off the bottom so the screen's header shows; `"top"`
  hangs it from the top edge for a bottom-sheet screen).
  * `components/custom/landing/lms-site-metadata.ts` adds both fields to its
    own `LmsSiteMetadata` shape (still no import from base's file, for the
    reason 1.10.0 gives) and registers `still: "/brand/social-still.png"`
    with `stillAnchor: "bottom"`. Against base_sdk 1.15.0 the registry has
    neither field and lays the rest over the default unchanged, so the
    base_sdk floor stays 1.14.0; the still itself needs >= 1.16.0.
  * `templates/public/brand/social-still.png` (shipped by the existing
    `templates/public/brand -> public/brand` install, served at
    `/brand/social-still.png`) is ONE chapter of the app's guided tour -
    `marketing/tour/screenshots/06-schedule.png` in RokctAI/supacharge, the
    "Today, sorted" schedule screen, header-first, hence `"bottom"` -
    downscaled from the RAW 1080x1920 frame to 744x1323 (2x of the drawn
    width) as a lossless BOX resample, 162,213 bytes, smaller than the
    source. The canonical copy is `lms/team/marketing/tour/renders/
    social-still.png`; its README names the source chapter.
  * The chapter is ONE value: `STILL_CHAPTER` at the top of the `sync` job in
    `.github/workflows/sync_team_assets.yml` (default `06-schedule`). A new
    step there runs `lms/team/scripts/tour_still.py`, which pulls that
    chapter from RokctAI/supacharge main (public today; the MONOREPO_PAT the
    other cross-repo workflows use is read when present, else the built-in
    token, no new secret) and writes both copies ahead of the persona sync,
    and the commit step stages them alongside the synced trees. The still
    lives under `lms/team/marketing/` deliberately: `sync_team_assets.dart`
    excludes that root, so a web social-card still never lands in the
    Flutter bundle the persona sync also feeds, which is why the script
    writes the shipped copy itself rather than leaning on the sync. Flipping
    to `02-auth_login` is that one value plus `stillAnchor: "top"` in
    lms-site-metadata.ts, as the README and the script's docstring say.

## 1.10.0

* The testimonials are rokct.ai's auto-scrolling row. Ray, 2026-09-09:
  Supacharge is to inherit rokct.ai's auto-scrolling testimonials - and
  base_sdk 1.14.0 made that one component every shell can render,
  `components/custom/landing/testimonials-marquee.tsx` (the marquee that
  pauses under the pointer and stands still under prefers-reduced-motion,
  importing base's `app/styles/rokct-marquee.css` itself so the host edits
  nothing).
  * `components/custom/lms-testimonials-section.tsx` keeps its frame and
    heading and renders `TestimonialsMarquee` over
    `LMS_LANDING_CONFIG.testimonials` in place of the card grid. The card is
    re-themed through the marquee's `cardClassName` prop - `sc-card` for the
    surface, border and radius, the same `p-6`, plus the `w-[350px] shrink-0
    h-full` the track needs so one third of it is exactly one copy of the
    quotes - and the edge fades through `fadeClassName`
    (`from-[var(--sc-card-alt)]`, the section's own ground).
  * The words inside the card are the marquee's and painted zinc with no
    prop to change them, so `components/custom/landing/lms-theme.css`
    re-paints them from outside through the `sc-marquee` / `sc-marquee-card`
    classes the section adds - the quote, author and role in the card's ink,
    the avatar disc and the rule above it in the card's stroke - exactly the
    way the hero frame has been re-painted through `#hero` since 1.2.0.
  * A `[[TOKEN]]` quote is still shown bare, never wrapped in quotation
    marks and dressed up as somebody's words; what it loses is the
    monospace/star styling of the old per-card branch, because the marquee
    styles every card alike. All five items are still the PLACEHOLDER
    stand-ins 1.8.0 describes.
  * The `.sc-row` swipe row is gone from this one section: the marquee is a
    single horizontal row at every width, so nothing is stacked below 640px
    and there is nothing to swipe. Every other section keeps its row.
* The new/soon pill `components/custom/lms-floating-nav.tsx` draws beside a
  badged entry is now base's ONE `components/custom/menu-label.tsx`
  (`MenuLabel`: bg-primary with black text, Ray, 2026-09-09: "use primary
  color and text in black") instead of this file's own `--sc-primary` span.
  The header is base's since 1.14.0 and renders `lms-header-menu.ts` inside
  it with that same label, so the nav and the header can no longer show two
  different pills; on Supacharge the shell's `--primary` is the same orange.
* `components/custom/landing/lms-header-menu.ts` says why `testimonials` is
  still not in the header in words that are true: the section stopped
  rendering `[[TESTIMONIAL_n_QUOTE]]` tokens in 1.8.0, but its five quotes
  are stand-ins rather than real customers, and the header points only at
  sections whose words are. No entry was added. Its opening comment also
  notes that since base_sdk 1.14.0 the menu renders inside the header, not
  as a row under the shell's own.
* New `components/custom/landing/lms-site-metadata.ts`: Supacharge's site
  metadata - siteName, url, `<title>`, tagline, description, keywords,
  `en_ZA`, and the wordmark as the logo base draws into its generated
  Open Graph / Twitter preview image - default-exported for base_sdk
  1.15.0's site-metadata registry and registered with one integrations line
  at `// @rokct-sdk-site-metadata-start` in
  `components/custom/landing/site-metadata.ts`.
  * That registry is OPTIONAL in this release's base floor. Against
    base_sdk 1.14.0 the target file does not exist and
    `sdk_installer_base.py update_integrations()` prints "Integration
    target not found" and skips the line (the composer's missing-target
    rule), so the module installs and sits unused.
  * For the same reason the module declares the shape it fills
    (`LmsSiteMetadata`, the `SiteMetadataCopy` fields) instead of
    importing base's type: an `import type` of a file that is not on disk
    is a compile error, and a shell on 1.14.0 must still build. The
    registry's own `load` signature checks the default export structurally
    when base 1.15.0 is present.
* base_sdk floor: >= 1.14.0 (was 1.13.0). The header that renders the
  registered menu, `menu-label.tsx` and the marquee ship together there;
  `requires` lists `components/custom/menu-label.tsx`,
  `components/custom/landing/testimonials-marquee.tsx` and
  `components/custom/landing/site-metadata.ts` (the last one optional, as
  above), and the manifest's per-file notes say which base version carries
  each.

## 1.9.0

* The landing page now says it is for IEB students as well as CAPS students.
  Ray, 2026-09-09: "its joining it. though i havent added tutors and
  assistants of IEB but since ieb extends caps i can use same team" - IEB
  joins CAPS rather than sitting beside it, and the same team serves both.
* What makes that true is the curriculum, and only the curriculum. IEB schools
  sit the National Senior Certificate on the same DBE CAPS curriculum
  (`factory/lessons/curriculum/IEB/README.md`: "the IEB teaches the same CAPS
  content"); what differs is how the IEB assesses it - its own Subject
  Assessment Guidelines, its own papers, its own pacing. So every line here
  claims shared CONTENT and nothing about assessment.
  * `subjects.eyebrow`: "Subjects built on CAPS" -> "Built for CAPS and IEB".
  * `subjects.blurb` and the "What is Supacharge?" FAQ answer keep the CAPS
    teaching plan they already named and add, in the same breath, that it is
    the curriculum IEB schools teach too. Neither drops CAPS: the annual
    teaching plan is a CAPS document, and pretending otherwise would trade one
    inaccuracy for another.
  * The Subjects feature card loses one word - "Browse every CAPS-aligned
    subject you take" -> "Browse every subject you take". A card that only
    lists what the student takes never needed to name a curriculum, and the
    shortest honest line is the one that claims nothing.
* One new FAQ item, "Does this work for IEB?", carries the whole answer rather
  than stretching the other lines to imply it: the shared curriculum, then
  "We don't include IEB past papers."
  * That last sentence is not a caveat to be tidied away later. It is what
    keeps the rest of the section true, because there is no IEB assessment
    layer in the product to point at: the published lesson indexes carry zero
    IEB rows, the index builders read the CAPS root, and `lms_course` has no
    curriculum field, so a student who picks IEB today gets CAPS lessons under
    an IEB badge.
  * It says the papers are NOT INCLUDED, not "not yet". Ray, 2026-09-09: "we
    cant do practice as we dont have permission for past papers for IEB". The
    block is permission the company does not hold, so a line that hinted at a
    future would be its own untruth - a different one from the one this change
    removes.
* Deliberately absent, and each one for a reason: no "IEB-aligned", no "built
  for the IEB exam", no IEB past papers offered, no IEB mark, weighting or
  paper-structure figure, and nothing implying a selectable IEB lesson set.
  The repository contradicts all of them today, and IEB assessment material
  additionally cannot be reproduced commercially without written permission
  (`factory/lessons/curriculum/IEB/SOURCES.md`).
* The team is untouched. `lms/team/**/CAPS/` and `public/team/**/CAPS/` are
  identifiers, not copy - read by `sync_team_assets.dart`,
  `build_tutor_catalog.py`, the manifests, CI and the live `/team/...` image
  URLs - and Ray has confirmed the CAPS team serves IEB, so renaming them
  would break served assets for nothing a visitor can see.
* The Dart half moves with this one. `lms/dart/templates/tour/lms.tour.yaml`
  carried two of these strings verbatim on the `courses` step; both are
  reworded to the web's new wording (Dart manifest 1.16.7 -> 1.16.8) so the
  guided tour, its stills and the site do not drift apart. Step key and route
  are unchanged.
* Version-only side effects: `manifest.json` 1.8.0 -> 1.9.0 and
  `LMS_LANDING_VERSION` in `lms-footer-chrome.ts` follows it, as it must. No
  new `base_sdk` seam and no new floor - the highest this SDK already requires
  is base_sdk >= 1.13.0 (the header-menu registry), which core `main` carries.

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
