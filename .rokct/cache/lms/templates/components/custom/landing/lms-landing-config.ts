/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Copy for Supacharge's landing page sections (this SDK's lms-floating-nav,
// lms-sessions-section, lms-subjects-section, lms-tutors-section,
// lms-features-section, lms-partners-section, lms-pricing,
// lms-faq-section, lms-testimonials-section and lms-footer-section
// templates), which register themselves into base_sdk's generic landing
// host through components/custom/landing/page-sections.ts.
//
// Ray, 2026-09-03: each home SDK holds its own landing page, the way a Dart
// home SDK holds its profile screens. lms_sdk is Supacharge's home SDK
// (core/utils/flutter/composer/supacharge.json flags it home_sdk: true), so
// the words, links and prices on those sections live here, and base_sdk's
// components/custom/landing/landing-config.ts keeps only the generic values
// (auth URLs, the nav's ends, the plans query). A section whose block is
// `null` is not rendered at all. The hero's copy stays in base_sdk's
// hero-config.ts.
//
// Portraits: each tutor/assistant entry carries the persona `slug` of its
// folder under lms/team; the flip cards (lms-tutor-card.tsx) resolve the
// image through the generated team-assets.ts manifest, which
// lms/dart/tool/sync_team_assets.dart writes next to this file.
//
// Every claim below is taken from what already exists: the Flutter app's
// guided-tour feature guide (supacharge/marketing/tour/feature-guide.md),
// its UI strings (lms/dart/manifest.json tr_keys), the tutor roster
// (lms/team/tutor_catalog.json), the CAPS lesson pipeline
// (factory/lessons/README.md) and the product/business docs
// (replay/docs/supacharge-product.md, supacharge-business.md). A fact the
// sources do not carry - a price, a quote, a store link - is a
// `[[PLACEHOLDER]]` token, never a guess: `LMS_LANDING_PLACEHOLDERS` lists
// them so a host can find every one.

import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  Library,
  Trophy,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";

import type { HeaderMenuIcon } from "@/components/custom/landing/header-menu";
import type { LandingNavBadge } from "@/components/custom/landing/landing-config";

/** A link rendered as a call to action. */
export interface LandingLink {
  label: string;
  href: string;
  /** Open in a new tab. */
  external?: boolean;
}

/**
 * One downloadable build of the Supacharge app, as the landing offers it:
 * a header card (lms-header-menu.ts), a hero call to action
 * (lms-hero-form.tsx) and a footer link (lms-footer-section.tsx) all read
 * the same entry, so the label, the blurb and the destination are said
 * once.
 */
export interface LandingApp extends LandingLink {
  /** Stable key, unique among the apps. */
  id: "android" | "desktop" | "ios" | "huawei";
  /**
   * The platform's own name - "Android", "Windows" - the descriptions
   * name (1.15.0; Ray, 2026-09-09: the buttons must not say "APK", they
   * say the platform). Never a file format.
   */
  platform: string;
  /**
   * The hero badge's two lines (1.16.0; Ray, 2026-09-09: "but eventually
   * we getting in those stores except windows"): the store's own badge
   * wording where the app is, or will be, listed - "GET IT ON" over
   * "Google Play", "Download on the" over "App Store", "EXPLORE IT ON"
   * over "AppGallery" - over that store's mark; and "Download for" over
   * "Windows" for the one platform that has no store.
   */
  badge: { eyebrow: string; label: string };
  /**
   * The app's listing in the store its badge names. Empty until the
   * listing exists. Once set, every surface links to it in place of
   * `href` (LMS_SHOWN_APPS resolves that), and a store-only entry that is
   * `shown: false` appears - so one line flips a store on. Never a
   * hard-coded store URL before the listing exists.
   */
  storeUrl: string;
  /** One line under the label - what the download is. */
  description: string;
  /**
   * The header card's glyph, from the closed set base_sdk's header
   * bundles (HeaderMenuIcon, base_sdk >= 1.18.0).
   */
  icon: HeaderMenuIcon;
  /**
   * Whether the landing shows this app today, on its direct download.
   * `false` keeps the entry in code - its words, its mark and its
   * destination - with no surface rendering it, so a demoted platform is
   * one flag away from coming back rather than a rewrite; a store-only
   * entry also comes back the moment its `storeUrl` is set. Every
   * consumer reads LMS_SHOWN_APPS, never this list raw.
   */
  shown: boolean;
}

export interface HomeConfig {
  /** Where app/page.tsx sends a signed-in visitor: the lms surface that is the Next.js counterpart of the Flutter home (the schedule). */
  url: string;
}

export interface SessionStep {
  /** Who speaks in this part of the session. */
  who: string;
  /** How long the part runs, as the product doc states it. */
  length: string;
  text: string;
}

export interface SessionsConfig {
  eyebrow: string;
  heading: string;
  blurb: string;
  /** The parts of one lesson, in order. */
  steps: SessionStep[];
  /** Short facts about how a session behaves, from the app's own strings. */
  facts: { title: string; text: string }[];
}

export interface Subject {
  name: string;
  /** Tutor duo per subject: the expert and the simplifier (lms/team/tutors/CAPS/roster.json). */
  tutors: [string, string];
}

/**
 * One curriculum the lessons are built for. `badge` is base_sdk's
 * new/soon vocabulary (LandingNavBadge): a curriculum marked "soon" is
 * named in the line with the MenuLabel pill after it (1.25.0; Ray,
 * 2026-09-10: "add soon label in curriculum for cambridge"). The names
 * are spelled as the backend's CURRICULA tuple spells them
 * (lms/frappe/src/tenant/rlms/api/student.py).
 */
export interface Curriculum {
  name: string;
  badge?: LandingNavBadge;
}

export interface SubjectsConfig {
  /** The lead of the eyebrow; the curricula follow it: "Built for CAPS, IEB and Cambridge". */
  eyebrow: string;
  /** The curricula, in the order the line names them (landing/lms-curricula.tsx renders it). */
  curricula: Curriculum[];
  heading: string;
  blurb: string;
  grades: string;
  subjects: Subject[];
}

export interface Tutor {
  name: string;
  title: string;
  subject: string;
  bio: string;
  /**
   * The persona folder under lms/team (`tutor_001`): the key the generated
   * team-assets.ts resolves the portrait by. Absent, the card shows initials.
   */
  slug?: string;
  /** How they teach, as the roster's style_tag puts it (the card back's "Style" fact). */
  style?: string;
  /** The grades they teach, as the roster lists them (the front's corner badge and the back's fact). */
  grades?: number[];
  /**
   * Only when a real number exists. The Flutter demo catalogue seeds one
   * (4.8, 4.9, ...) as launch demo data; no source carries a measured rating
   * yet, so the entries below leave it out and the card omits the fact -
   * never a fabricated number.
   */
  rating?: number;
}

export interface Assistant {
  name: string;
  role: string;
  /** The persona folder under lms/team (`assistant_001`), for the portrait. */
  slug?: string;
  /**
   * What this assistant does in a session, in the card's own words.
   * lms-tutor-card.tsx already reads `bio` off either persona and renders
   * it - clamped to three lines on the front, in full on the back - so an
   * assistant without one simply showed a name and a role. All three do the
   * same job for their own grade (the lms/team/assistants persona folders
   * are identical: intro, timekeeping, break handover, signoff), so each
   * bio names that job rather than inventing a personality per assistant.
   */
  bio?: string;
}

/** The words on the flip cards (lms-tutor-card.tsx, lms-plan-card.tsx). */
export interface CardLabels {
  /** Front CTA on a tutor card, before the name: "Know Sifiso Zulu". Flips the card. */
  know: string;
  /** Back CTA on a tutor card, before the name: "Start with Sifiso Zulu". */
  startWith: string;
  /** Corner badge on a tutor card. */
  tutor: string;
  /** Corner badge on an assistant card. */
  assistant: string;
  /** Grade badge, before the range: "Grade 10-12". */
  grade: string;
  style: string;
  rating: string;
  /** Accessible name of the flip control. */
  flip: string;
  flipBack: string;
}

/**
 * The words the swipeable deck needs (landing/lms-card-deck.tsx). One
 * block per row, because a deck names what it holds: "Next tutor" on the
 * tutor row reads as nonsense over the assistants'.
 */
export interface DeckLabels {
  /** Accessible name of the row itself. */
  label: string;
  /** Accessible name of the back control. */
  previous: string;
  /** Accessible name of the forward control. */
  next: string;
  /** The caption under the row; empty prints none. */
  hint: string;
}

export interface TutorsConfig {
  eyebrow: string;
  heading: string;
  blurb: string;
  tutors: Tutor[];
  assistantsHeading: string;
  assistants: Assistant[];
  cards: CardLabels;
  /** The tutor row, which is one deck rather than a grid that wraps. */
  deck: DeckLabels;
  /** The assistants' row, the same deck. */
  assistantsDeck: DeckLabels;
}

/**
 * How lms-features-section.tsx draws a feature card. One per card, and no
 * two neighbours - beside or above each other, at any width - the same
 * (tests/test_landing_apps.py lays the cards out and checks).
 *
 *   glow      the icon over a soft radial accent
 *   numeral   `figure` drawn large; a figure the card's own copy states
 *   list      `lines` under the text, a two-line mini list
 *   gradient  a diagonal wash from the primary tint into the card
 *   outlined  a transparent card with a primary-leaning stroke
 */
export type FeatureTreatment = "glow" | "numeral" | "list" | "gradient" | "outlined";

export interface Feature {
  name: string;
  text: string;
  icon: LucideIcon;
  treatment: FeatureTreatment;
  /** Two columns from 640px up, and first in the flow below 1024px; exactly two cards. */
  wide?: boolean;
  /** `numeral` only: the figure drawn large. Decorative - it repeats what `text` says. */
  figure?: string;
  /**
   * `list` only: lead with the curriculum line the subjects section's
   * eyebrow carries (subjects.curricula through landing/lms-curricula.tsx,
   * pill included), before `lines`.
   */
  curricula?: boolean;
  /** `list` only: the lines under the text, every one copy the page already carries. */
  lines?: string[];
}

export interface FeaturesConfig {
  heading: string;
  blurb: string;
  items: Feature[];
}

export interface PartnersConfig {
  eyebrow: string;
  heading: string;
  blurb: string;
  /** Who a student can add, as the app lists them. */
  who: string[];
  /** What the weekly report carries. */
  weeklyHeading: string;
  weekly: string[];
  alertsHeading: string;
  alerts: string[];
  boundary: string;
  sponsors: { heading: string; text: string };
  cta: { label: string; sub: string };
}

export interface PricingConfig {
  heading: string;
  blurb: string;
  /** The partner-linked price against the standard one: R299 -> R249, a R50/month saving. */
  partnerNote: string;
  labels: {
    joinFree: string;
    daysFree: (days: number) => string;
    select: (plan: string) => string;
    perMonth: string;
    perYear: string;
    perUserMonth: string;
    perUserYear: string;
    /** The period on a one-off plan (the Holiday Programme), as the app's plan card puts it: "R449 . once off". */
    onceOff: string;
    /** Front CTA on a plan card; flips it to the features. */
    seeIncluded: string;
    /** Heading over the feature list on the back. */
    included: string;
    /** Badge on the plan most students land on (the middle one), as the app's plan deck marks it. */
    mostPopular: string;
    flip: string;
    flipBack: string;
  };
}

export interface FaqConfig {
  heading: string;
  blurb: string;
  items: { question: string; answer: string }[];
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface TestimonialsConfig {
  heading: string;
  items: Testimonial[];
}

export interface FooterConfig {
  motto: string;
  /** Links other than the auth ones (the page hands those in). */
  links: LandingLink[];
  legal: string;
}

export interface LmsLandingConfig {
  home: HomeConfig;
  /**
   * Where "Get the app" goes: the app's own releases, not a store listing.
   *
   * FLAGGED, not removed (1.12.0): since the apps below carry their own
   * destinations no surface renders this entry any more - the header,
   * the hero and the footer all read `apps` - but it is the releases page
   * every one of them points at today, and a shell that linked the single
   * "Get the app" still resolves it. Remove only once nothing outside this
   * SDK reads it.
   */
  app: LandingLink;
  /**
   * The app's downloadable builds, one entry per platform; `shown` says
   * which the landing offers (Ray, 2026-09-09: "supacharge need to show
   * these apps, ios is demoted for now. apk and desktop app").
   */
  apps: LandingApp[];
  sessions: SessionsConfig | null;
  subjects: SubjectsConfig | null;
  tutors: TutorsConfig | null;
  features: FeaturesConfig | null;
  partners: PartnersConfig | null;
  pricing: PricingConfig | null;
  faq: FaqConfig | null;
  testimonials: TestimonialsConfig | null;
  footer: FooterConfig | null;
}

/**
 * The facts this copy needs and the sources do not carry. Each token
 * appears verbatim in the config below; replace the token, not the copy.
 */
export const LMS_LANDING_PLACEHOLDERS: { token: string; needed: string }[] = [
  {
    token: "testimonials.items (was [[TESTIMONIAL_n_QUOTE]] / _NAME / _ROLE)",
    needed:
      "Five real student, parent or teacher quotes with names and roles - none exist in any source yet. ALL FIVE entries on the page now (Naledi, Shireen, Sipho, Lerato, Yusuf) are PLACEHOLDER stand-ins written to make the section read as finished, not real customers - the last two were added after the first three and are no more real than they are: replace all five, then delete this row. They deliberately carry no marks, percentages or measured outcomes, and no surnames, schools or employers, so keep any replacement free of result claims the product cannot evidence.",
  },
];

const SIGNUP_LABEL = "Start with Supacharge";

/**
 * The releases page: where the weekly release lane (RokctAI/supacharge
 * .github/workflows/release.yml, `build_android: true` and
 * `build_windows: true`) attaches each build, and where the single flagged
 * `app` link and the demoted iOS entry still point.
 *
 * Since 1.15.0 the SHOWN apps no longer point here. The lane names every
 * asset for its version (`app-v1.2.9.apk`, `app-windows-v1.2.9.zip`), so
 * no `releases/latest/download/<asset>` link resolves and a hard-coded
 * one would 404 on the next release - the reason 1.4.1 sent visitors to
 * the page. The shown entries instead go through this SDK's own
 * app/download/[platform]/route.ts, which asks the public GitHub releases
 * API for the latest release, finds that platform's asset by its name
 * pattern and 302s to it, falling back to this page when the API is
 * unreachable or the asset is missing (Ray, 2026-09-09: "there is no way
 * we can resolve to get the direct download link?").
 */
const RELEASES_URL = "https://github.com/RokctAI/supacharge/releases/latest";

/**
 * Every build of the app the landing knows about, shown or not.
 *
 * Ray, 2026-09-09: "supacharge need to show these apps, ios is demoted for
 * now. apk and desktop app". The two shown entries are the two the release
 * lane actually publishes - an Android build (`app-v<version>.apk`, beside
 * the `.aab` the Play lane takes) and a Windows desktop build
 * (`app-windows-v<version>.zip`); there is no macOS or Linux build and no
 * store listing, so "Desktop app" means the Windows build. The words on
 * every surface name the PLATFORM, never the file format (Ray, 2026-09-09:
 * "its saying apk which it should not"). Their hrefs are the site's own
 * download route (app/download/[platform]/route.ts), which redirects to the
 * latest release's asset for that platform - see RELEASES_URL above.
 *
 * Kept as a plain literal (no references) so tests/test_landing_apps.py can
 * lift it out and read it under node without a bundler.
 */
export const LMS_APPS: LandingApp[] = [
  {
    id: "android",
    label: "Android app",
    platform: "Android",
    // Google Play's own badge wording over the Play mark (Ray, 2026-09-09:
    // "we use what these platforms use for familiarity"); the link is the
    // direct download until the listing exists.
    badge: { eyebrow: "GET IT ON", label: "Google Play" },
    storeUrl: "",
    href: "/download/android",
    external: true,
    description: "Direct download for Android from the latest release",
    icon: "smartphone",
    shown: true,
  },
  {
    // Shown now (Ray, 2026-09-09: "yes though we havent built for huawei
    // yet though we have hms sdk"): AppGallery's own badge wording over the
    // Huawei mark, on the same direct Android download until the
    // AppGallery listing exists - set storeUrl to it then.
    id: "huawei",
    label: "Huawei app",
    platform: "Huawei",
    badge: { eyebrow: "EXPLORE IT ON", label: "AppGallery" },
    storeUrl: "",
    href: "/download/android",
    external: true,
    description: "Direct download for Huawei devices from the latest release",
    icon: "smartphone",
    shown: true,
  },
  {
    id: "desktop",
    label: "Desktop app",
    platform: "Windows",
    // No store, ever (Ray, 2026-09-09: "except windows"): the platform's
    // name over the Windows mark, and storeUrl stays empty.
    badge: { eyebrow: "Download for", label: "Windows" },
    storeUrl: "",
    href: "/download/windows",
    external: true,
    description: "Direct download for Windows from the latest release",
    // base_sdk's header bundles seven glyphs and none of them is a monitor;
    // "box" (a product) is the nearest. A "monitor" glyph is a base_sdk
    // change, not this SDK's.
    icon: "box",
    shown: true,
  },
  {
    // demoted for now (Ray, 2026-09-09: "ios is demoted for now")
    id: "ios",
    label: "iOS app",
    platform: "iOS",
    badge: { eyebrow: "Download on the", label: "App Store" },
    // Set to the App Store listing when it exists: that one line shows
    // the badge and links every surface to it.
    storeUrl: "",
    // No iOS build lane exists in RokctAI/supacharge and there is no App
    // Store listing, so there is nothing for the download route to resolve:
    // this points at the releases page rather than at a URL nothing
    // publishes.
    href: "https://github.com/RokctAI/supacharge/releases/latest",
    external: true,
    description: "Not published yet",
    icon: "smartphone",
    shown: false,
  },
];

/**
 * The apps the landing offers, in the order the header, hero and footer
 * show them: every entry shown on its direct download, plus every entry
 * whose store listing exists - linked to that listing in place of its
 * direct download, so setting `storeUrl` is the whole change.
 */
export const LMS_SHOWN_APPS: LandingApp[] = LMS_APPS.filter((app) => app.shown || app.storeUrl !== "").map((app) => (app.storeUrl ? { ...app, href: app.storeUrl } : app));

export const LMS_LANDING_CONFIG: LmsLandingConfig = {
  home: {
    url: "/handson/all/lms",
  },

  app: {
    label: "Get the app",
    href: RELEASES_URL,
    external: true,
  },

  apps: LMS_APPS,

  sessions: {
    eyebrow: "How a session works",
    heading: "One lesson. Two teaching styles.",
    blurb:
      "Every lesson is one learning event in two parts: the subject's expert teaches it the way examiners mark it, then the simplifier teaches the same topic from first principles. A session assistant opens the room and bridges the break.",
    steps: [
      {
        who: "Part 1 - the expert",
        length: "30 minutes",
        text: "Three subtopics, each taught in about six minutes with a quick multiple-choice check after it.",
      },
      {
        who: "Break - the assistant",
        length: "about 5 minutes",
        text: "Thandi, Bianca or Mandy keeps time, reads out the questions you would rather not ask out loud for your tutor to answer, and hands over to the next tutor.",
      },
      {
        who: "Part 2 - the simplifier",
        length: "30 minutes",
        text: "The same topic again, from real things you can hold - so the formula makes sense before you memorise it.",
      },
    ],
    facts: [
      {
        title: "Doors open, doors close",
        text: "Sessions run on a schedule. Join before the doors lock; if you miss one, the recording lands in your library tomorrow.",
      },
      {
        title: "Skip only if you can prove it",
        text: "Tap Skip and a quick check follows. Score well and you skip freely; score poorly and you see exactly why the session is worth attending.",
      },
      {
        title: "Audio and whiteboard, not video",
        text: "A session is a voice track and a whiteboard animation drawn in real time, so it stays light on data.",
      },
    ],
  },

  subjects: {
    eyebrow: "Built for",
    curricula: [{ name: "CAPS" }, { name: "IEB" }, { name: "Cambridge", badge: "soon" }],
    heading: "Every subject, term by term.",
    blurb:
      "Lessons follow the CAPS annual teaching plan — the same national curriculum IEB schools teach — subject by subject and term by term, so what you learn tonight is what your teacher marks this term.",
    grades: "Grades 10, 11 and 12",
    subjects: [
      { name: "Mathematics", tutors: ["Sifiso Zulu", "John Petersen"] },
      { name: "Physical Sciences", tutors: ["Lindiwe Dlamini", "Rudzani Mudau"] },
      { name: "Accounting", tutors: ["Anand Naicker", "Grace Mofokeng"] },
      { name: "Economics", tutors: ["Nomsa Mahlangu", "Rhulani Chauke"] },
      { name: "Geography", tutors: ["Kagiso Molefe", "Pieter van Zyl"] },
      { name: "Mathematical Literacy", tutors: ["Priya Pillay", "Joe September"] },
    ],
  },

  tutors: {
    eyebrow: "Meet the tutors",
    heading: "Find the one whose style clicks with you.",
    blurb:
      "Two tutors per subject across every grade: one teaches the way the exam is marked, the other from the ground up. Same topic, same example, two ways in.",
    tutors: [
      {
        slug: "tutor_001",
        name: "Sifiso Zulu",
        style: "formal",
        grades: [10, 11, 12],
        title: "The Algebra Grandmaster",
        subject: "Mathematics",
        bio: "Mr Zulu teaches Maths the way examiners mark it - precise, fast, and distinction-focused. If you want to top the class, this is your coach.",
      },
      {
        slug: "tutor_002",
        name: "John Petersen",
        style: "plain-language, intuition-first",
        grades: [10, 11, 12],
        title: "The Simplifier",
        subject: "Mathematics",
        bio: "Mr Petersen teaches Maths from first principles, in words you already use - then in the notation the exam marks.",
      },
      {
        slug: "tutor_003",
        name: "Lindiwe Dlamini",
        style: "formal",
        grades: [10, 11, 12],
        title: "Science Queen",
        subject: "Physical Sciences",
        bio: "Ms Dlamini teaches Physical Sciences with data-sheet precision - every formula, every unit, every mark accounted for.",
      },
      {
        slug: "tutor_004",
        name: "Rudzani Mudau",
        style: "plain-language, intuition-first",
        grades: [10, 11, 12],
        title: "The Backyard Scientist",
        subject: "Physical Sciences",
        bio: "Mr Mudau starts from things you can hold - a wheelbarrow, a kettle, a garden hose - so the formula makes sense before you memorise it.",
      },
      {
        slug: "tutor_005",
        name: "Anand Naicker",
        style: "formal",
        grades: [10, 11, 12],
        title: "Numbers Never Lie",
        subject: "Accounting",
        bio: "Accounting taught in the exact formats the exam marks - ledgers that balance and statements that make sense.",
      },
      {
        slug: "tutor_006",
        name: "Grace Mofokeng",
        style: "plain-language, intuition-first",
        grades: [10, 11, 12],
        title: "The Spaza Bookkeeper",
        subject: "Accounting",
        bio: "Mrs Mofokeng starts from money you can watch move - a till, a cash book, a month's takings - and lands on the formats the exam marks.",
      },
      {
        slug: "tutor_007",
        name: "Nomsa Mahlangu",
        style: "formal",
        grades: [10, 11, 12],
        title: "The Market Queen",
        subject: "Economics",
        bio: "Ms Mahlangu teaches Economics the way markets actually move - precise graphs, sharp mechanisms, exam-ready answers.",
      },
      {
        slug: "tutor_008",
        name: "Rhulani Chauke",
        style: "plain-language, intuition-first",
        grades: [10, 11, 12],
        title: "The Taxi Rank Economist",
        subject: "Economics",
        bio: "Mr Chauke teaches Economics from the fare board up - petrol, queues, month-end prices - and lands on the answers the memorandum expects.",
      },
      {
        slug: "tutor_009",
        name: "Kagiso Molefe",
        style: "formal",
        grades: [10, 11, 12],
        title: "The Map Master",
        subject: "Geography",
        bio: "Mr Molefe reads landscapes like examiners read answer sheets - every contour, every calculation, in the format that scores.",
      },
      {
        slug: "tutor_010",
        name: "Pieter van Zyl",
        style: "plain-language, intuition-first",
        grades: [10, 11, 12],
        title: "The Weather Walker",
        subject: "Geography",
        bio: "Mr van Zyl teaches Geography from ground he has walked - weather, slopes, rivers - then straight into the map calculations the exam requires.",
      },
      {
        slug: "tutor_011",
        name: "Priya Pillay",
        style: "formal",
        grades: [10, 11, 12],
        title: "The Money Coach",
        subject: "Mathematical Literacy",
        bio: "Mrs Pillay turns bills, bank statements and building plans into marks - real-world maths, exam-ready answers.",
      },
      {
        slug: "tutor_012",
        name: "Joe September",
        style: "plain-language, intuition-first",
        grades: [10, 11, 12],
        title: "The Till Slip Teacher",
        subject: "Mathematical Literacy",
        bio: "Mr September teaches on the documents you already handle - till slips, fares, tuck-shop change - and shows every answer in the context the exam requires.",
      },
    ],
    assistantsHeading: "And in your corner, every session",
    assistants: [
      {
        slug: "assistant_001",
        name: "Thandi",
        role: "Grade 10 session assistant",
        bio: "Thandi opens every Grade 10 session, calls the halfway mark and the last five minutes, and holds the break so nobody drifts off between the two teachers.",
      },
      {
        slug: "assistant_002",
        name: "Bianca",
        role: "Grade 11 session assistant",
        bio: "Bianca runs the Grade 11 room. The break is hers - questions asked privately, so you can say what did not land without saying it to the class.",
      },
      {
        slug: "assistant_003",
        name: "Mandy",
        role: "Grade 12 session assistant",
        bio: "Mandy takes Grade 12 from the intro to the sign-off, and uses the break to clear up what part one left behind before the simplifier picks the topic up again.",
      },
    ],
    cards: {
      know: "Know",
      startWith: "Start with",
      tutor: "Tutor",
      assistant: "Assistant",
      grade: "Grade",
      style: "Style",
      rating: "Rating",
      flip: "Turn the card over",
      flipBack: "Back to the photo",
    },
    deck: {
      label: "Tutors, as a deck you can swipe",
      previous: "Previous tutor",
      next: "Next tutor",
      hint: "Swipe for the rest of the roster",
    },
    assistantsDeck: {
      label: "Session assistants, as a deck you can swipe",
      previous: "Previous assistant",
      next: "Next assistant",
      hint: "",
    },
  },

  // The cards are a bento (lms-features-section.tsx): the two `wide` ones
  // are the screens the page is about - the schedule the heading names and
  // the two-tutor format the sessions section sells - and each card's
  // `treatment` is assigned so that no two neighbours share one at any
  // width. `figure` and `lines` are copy this file already carries: the
  // "2" is the Tutors card's own "Two tutors per subject", the two lines
  // under Subjects are the subjects section's eyebrow (`curricula`: the
  // curriculum line with its pill, from subjects.curricula) and its grades
  // line.
  features: {
    heading: "Your day, sorted.",
    blurb: "Everything in the app, in the order you use it.",
    items: [
      {
        name: "Schedule",
        text: "Your day at a glance, with the next live session front and centre.",
        icon: CalendarClock,
        treatment: "glow",
        wide: true,
      },
      {
        name: "Subjects",
        text: "Browse every subject you take, term by term.",
        icon: BookOpenCheck,
        treatment: "list",
        curricula: true,
        lines: ["Grades 10, 11 and 12"],
      },
      {
        name: "Tutors",
        text: "Two tutors per subject - find the one whose style clicks with you.",
        icon: Users,
        treatment: "numeral",
        wide: true,
        figure: "2",
      },
      {
        name: "Library",
        text: "Rewatch past lessons and dip into knowledge bites whenever you like.",
        icon: Library,
        treatment: "gradient",
      },
      {
        name: "Practice",
        text: "Sharpen your skills with practice built around your subjects.",
        icon: ClipboardCheck,
        treatment: "outlined",
      },
      {
        name: "League",
        text: "Earn points as you learn and see how you stack up this week.",
        icon: Trophy,
        treatment: "glow",
      },
      {
        name: "My plan",
        text: "See exactly what your plan includes - no surprises.",
        icon: WalletCards,
        treatment: "gradient",
      },
      {
        name: "Profile",
        text: "Your grade, subjects and progress in one place.",
        icon: UserRound,
        treatment: "outlined",
      },
    ],
  },

  partners: {
    eyebrow: "Accountability partners",
    heading: "Someone in your corner sees the whole week.",
    blurb:
      "Link a parent, guardian, older sibling, teacher or mentor. They get their own login and a reporting dashboard - every linked student's week: sessions, streaks and alerts.",
    who: ["Parent", "Guardian", "Older sibling", "Teacher", "Mentor"],
    weeklyHeading: "Every Sunday, a weekly report",
    weekly: [
      "Sessions scheduled, attended and skipped - with or without the quick check",
      "Performance per topic, and the change since last week",
      "Engagement rate - questions answered versus skipped",
      "Data used this month",
    ],
    alertsHeading: "Instant alerts",
    alerts: [
      "A session was skipped",
      "The app locked after unanswered questions",
      "A score dropped significantly",
      "A milestone was reached",
    ],
    boundary:
      "A partner can see everything and control nothing. No locking, no forcing sessions - the student stays in charge of their own learning.",
    sponsors: {
      heading: "Reports built for sponsors",
      text: "Sponsors get cohort-level outcomes - attendance, progress and impact in one report.",
    },
    cta: {
      label: "Link a student in seconds",
      sub: "Students share a six-digit pairing code; the partner enters it and they are linked.",
    },
  },

  pricing: {
    heading: "One clear plan.",
    blurb: "See exactly what your plan includes - no surprises.",
    partnerNote: "Link an accountability partner and pay R249 a month instead of R299.",
    labels: {
      joinFree: "Join for free",
      daysFree: (days) => `${days} days free`,
      select: (plan) => `Choose ${plan}`,
      perMonth: "/month",
      perYear: "/year",
      perUserMonth: "/student/month",
      perUserYear: "/student/year",
      onceOff: "· once off",
      seeIncluded: "See what's included",
      included: "What's included",
      mostPopular: "Most popular",
      flip: "Turn the card over",
      flipBack: "Back to the price",
    },
  },

  faq: {
    heading: "Questions, answered.",
    blurb: "The things students and parents ask first.",
    items: [
      {
        question: "What is Supacharge?",
        answer:
          "Live tutoring that fits around school. Sessions run on a schedule, follow the CAPS teaching plan for your grade — the curriculum CAPS and IEB schools share — and every one is taught twice - once the way the exam marks it, once from the ground up.",
      },
      {
        question: "Which subjects and grades?",
        answer:
          "Mathematics, Physical Sciences, Accounting, Economics, Geography and Mathematical Literacy, for Grades 10, 11 and 12.",
      },
      {
        question: "Does this work for IEB?",
        answer:
          "Yes. IEB schools teach the same national curriculum as CAPS schools — what differs is how the IEB assesses it. Our lessons cover that shared content, so IEB students are on the right material. We don't include IEB past papers.",
      },
      {
        question: "What happens if I miss a session?",
        answer:
          "The doors close once a session starts. The recording lands in your library the following day, and you can set a reminder for when it arrives.",
      },
      {
        question: "Can I skip a session I already understand?",
        answer:
          "Yes. Tap Skip and a quick check follows. Score well and you skip freely; score poorly and the app shows you exactly why the session is worth attending. Either way, your accountability partner can see what you chose.",
      },
      {
        question: "What does an accountability partner see?",
        answer:
          "A weekly report every Sunday - sessions attended and skipped, performance per topic, engagement and data used - plus instant alerts. They can see everything and control nothing.",
      },
      {
        question: "Is it video? What about data?",
        answer:
          "No. A session is a voice track and a whiteboard animation drawn in real time, which keeps it far lighter than streaming video.",
      },
      {
        question: "Where do I get it?",
        answer:
          "Supacharge is a mobile app. Create your account, pick your grade and subjects, and your schedule is ready.",
      },
    ],
  },

  // PLACEHOLDER CONTENT - these three are stand-ins, not real customers.
  // Ray asked for the section to read as finished ahead of launch and will
  // replace them with genuine quotes; LMS_LANDING_PLACEHOLDERS still carries
  // the row, because the need for real ones is real and unmet. All FIVE are
  // stand-ins - Ray asked for two more than the original three (2026-09-09:
  // "i need you to add 2 more so when i replace i will replace all. right
  // now is about the design") so the row's layout can be judged at its real
  // length, so there is no genuine quote among them to tell apart. Written to
  // the same rule the rest of this file follows: they describe experience
  // of things the product actually does - the break, the partner's weekly
  // report, the two-teacher format, tomorrow's recording of a missed
  // session - and carry no marks, no percentages and no measured outcome,
  // so nothing here is a result claim the product would have to stand
  // behind. First names only, with no surname, school or employer, so none
  // of them reads as a traceable person. Swap all five items, not the
  // shape, and delete the registry row when the real ones land.
  testimonials: {
    heading: "From students, parents and teachers",
    items: [
      {
        quote:
          "The break is the part I did not expect to need. I can ask what I missed without the whole class hearing me, and then the second teacher explains it another way anyway.",
        author: "Naledi",
        role: "Grade 11 learner",
      },
      {
        quote:
          "The weekly report tells me what she actually attended, not just what she tells me. That alone has taken the arguing out of our evenings.",
        author: "Shireen",
        role: "Parent of a Grade 10 learner",
      },
      {
        quote:
          "My learners arrive having already seen the topic twice, taught two different ways. That turns my period into a discussion instead of a first explanation.",
        author: "Sipho",
        role: "Physical Sciences teacher",
      },
      {
        quote:
          "When I miss a session the recording is in my library the next day, so I am not starting the next one already behind.",
        author: "Lerato",
        role: "Grade 12 learner",
      },
      {
        quote:
          "Two teachers on the same topic is what sold me. He hears it the way the examiners mark it, then again from first principles, and it is the second telling he repeats back to me.",
        author: "Yusuf",
        role: "Parent of a Grade 9 learner",
      },
    ],
  },

  footer: {
    motto: "To the next level",
    links: [
      { label: "Sessions", href: "#sessions" },
      { label: "Subjects", href: "#subjects" },
      { label: "Tutors", href: "#tutors" },
      { label: "Partners", href: "#partners" },
      { label: "FAQ", href: "#faq" },
    ],
    legal: `© ${new Date().getFullYear()} ROKCT INTELLIGENCE (PTY) LTD`,
  },
};

/** The label every sign-up call to action on the page uses. */
export const LMS_SIGNUP_LABEL = SIGNUP_LABEL;
