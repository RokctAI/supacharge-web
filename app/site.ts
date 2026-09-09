/**
 * Single source of truth for this shell's public origin.
 *
 * Production is https://supacharge.app. Vercel preview and local runs can
 * override it by setting NEXT_PUBLIC_SITE_URL — do NOT hardcode the domain
 * anywhere else; metadata, robots.txt, the sitemap and the web app manifest
 * all derive from here.
 *
 * No product copy lives here: the title, description and tagline are the
 * home SDK's, registered in components/custom/landing/site-metadata.ts and
 * read through loadSiteMetadata() / buildSiteMetadata().
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://supacharge.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Supacharge";

/** Where the Flutter app's builds are published. */
export const APP_RELEASES_URL =
  "https://github.com/RokctAI/supacharge/releases/latest";
