import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/site";

// The public pages a visitor can land on without signing in. `/` is not
// listed: it only redirects (to /landing, or to the learner's home when
// signed in), and a sitemap lists the address a page is actually served at.
const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "/landing", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/team", priority: 0.6 },
  { path: "/legal", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
