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

/** A link rendered as a call to action. */
export interface LandingLink {
  label: string;
  href: string;
  /** Open in a new tab. */
  external?: boolean;
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

export interface SubjectsConfig {
  eyebrow: string;
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

export interface Feature {
  name: string;
  text: string;
  icon: LucideIcon;
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
  /** `[[PARTNER_DISCOUNT]]` until the host confirms the number. */
  partnerNote: string;
  labels: {
    joinFree: string;
    daysFree: (days: number) => string;
    select: (plan: string) => string;
    perMonth: string;
    perYear: string;
    perUserMonth: string;
    perUserYear: string;
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
  /** Where "Get the app" goes. */
  app: LandingLink;
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
    token: "[[PLAY_STORE_URL]]",
    needed: "The public store link for the Supacharge Android app (marketing/store/listing is still empty).",
  },
  {
    token: "[[PARTNER_DISCOUNT]]",
    needed:
      "The monthly saving once an accountability partner is linked. supacharge-business.md section 3 and the app string discountOnceLinked both say R299 -> R249; confirm before it goes on the page.",
  },
  {
    token: "[[TESTIMONIAL_n_QUOTE]] / [[TESTIMONIAL_n_NAME]] / [[TESTIMONIAL_n_ROLE]]",
    needed: "Three real student, parent or teacher quotes with names and roles - none exist in any source yet.",
  },
];

const SIGNUP_LABEL = "Start with Supacharge";

export const LMS_LANDING_CONFIG: LmsLandingConfig = {
  home: {
    url: "/handson/all/lms",
  },

  app: {
    label: "Get the app",
    href: "[[PLAY_STORE_URL]]",
    external: true,
  },

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
        text: "Thandi, Bianca or Mandy keeps time, answers the questions you would rather not ask out loud, and hands over.",
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
    eyebrow: "Subjects built on CAPS",
    heading: "Every subject, term by term.",
    blurb:
      "Lessons follow the CAPS annual teaching plan, subject by subject and term by term, so what you learn tonight is what your teacher marks this term.",
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
      { slug: "assistant_001", name: "Thandi", role: "Grade 10 session assistant" },
      { slug: "assistant_002", name: "Bianca", role: "Grade 11 session assistant" },
      { slug: "assistant_003", name: "Mandy", role: "Grade 12 session assistant" },
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

  features: {
    heading: "Your day, sorted.",
    blurb: "Everything in the app, in the order you use it.",
    items: [
      {
        name: "Schedule",
        text: "Your day at a glance, with the next live session front and centre.",
        icon: CalendarClock,
      },
      {
        name: "Subjects",
        text: "Browse every CAPS-aligned subject you take, term by term.",
        icon: BookOpenCheck,
      },
      {
        name: "Tutors",
        text: "Two tutors per subject - find the one whose style clicks with you.",
        icon: Users,
      },
      {
        name: "Library",
        text: "Rewatch past lessons and dip into knowledge bites whenever you like.",
        icon: Library,
      },
      {
        name: "Practice",
        text: "Sharpen your skills with practice built around your subjects.",
        icon: ClipboardCheck,
      },
      {
        name: "League",
        text: "Earn points as you learn and see how you stack up this week.",
        icon: Trophy,
      },
      {
        name: "My plan",
        text: "See exactly what your plan includes - no surprises.",
        icon: WalletCards,
      },
      {
        name: "Profile",
        text: "Your grade, subjects and progress in one place.",
        icon: UserRound,
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
    partnerNote: "Link an accountability partner and pay [[PARTNER_DISCOUNT]] less each month.",
    labels: {
      joinFree: "Join for free",
      daysFree: (days) => `${days} days free`,
      select: (plan) => `Choose ${plan}`,
      perMonth: "/month",
      perYear: "/year",
      perUserMonth: "/student/month",
      perUserYear: "/student/year",
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
          "Live tutoring that fits around school. Sessions run on a schedule, follow the CAPS teaching plan for your grade, and every one is taught twice - once the way the exam marks it, once from the ground up.",
      },
      {
        question: "Which subjects and grades?",
        answer:
          "Mathematics, Physical Sciences, Accounting, Economics, Geography and Mathematical Literacy, for Grades 10, 11 and 12.",
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

  testimonials: {
    heading: "From students, parents and teachers",
    items: [
      { quote: "[[TESTIMONIAL_1_QUOTE]]", author: "[[TESTIMONIAL_1_NAME]]", role: "[[TESTIMONIAL_1_ROLE]]" },
      { quote: "[[TESTIMONIAL_2_QUOTE]]", author: "[[TESTIMONIAL_2_NAME]]", role: "[[TESTIMONIAL_2_ROLE]]" },
      { quote: "[[TESTIMONIAL_3_QUOTE]]", author: "[[TESTIMONIAL_3_NAME]]", role: "[[TESTIMONIAL_3_ROLE]]" },
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
