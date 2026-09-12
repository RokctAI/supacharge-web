import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/app/site";
import { GENERATED_BRAND_ICON } from "@/app/lib/site-metadata";
import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // The description is the home SDK's, from the site-metadata registry;
  // with nothing registered the manifest simply carries none.
  const { description } = await loadSiteMetadata();
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    ...(description ? { description } : {}),
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B0F",
    theme_color: "#0B0B0F",
    // Chrome's install offer needs a 192px and a 512px PNG in the manifest.
    // This shell ships no icon file, so these are base_sdk's generated tile
    // (app/brand-icon/route.tsx, `GET /brand-icon?s=<px>`, 16..512) - the
    // same route the tab and apple icons already resolve to through
    // buildSiteMetadata()'s generatedIcons(). A host icon file, once one
    // exists, replaces these entries.
    icons: [
      {
        src: `${GENERATED_BRAND_ICON}?s=192`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${GENERATED_BRAND_ICON}?s=512`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
