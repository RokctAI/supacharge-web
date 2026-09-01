/**
 * Single source of truth for this shell's public origin.
 *
 * Production is https://supacharge.app. Vercel preview and local runs can
 * override it by setting NEXT_PUBLIC_SITE_URL — do NOT hardcode the domain
 * anywhere else; metadata, robots.txt, the sitemap and the web app manifest
 * all derive from here.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supacharge.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Supacharge";

export const SITE_DESCRIPTION =
  "Supacharge is the Rokct super app for payments, wallet and everyday " +
  "commerce. The web experience is on its way — the mobile app is available now.";

/** Where the Flutter app's builds are published. */
export const APP_RELEASES_URL =
  "https://github.com/RokctAI/supacharge/releases/latest";
