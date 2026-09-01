/**
 * PLACEHOLDER — this is a holding page, not v0 of the Supacharge web product.
 *
 * It exists so that https://supacharge.app serves something correct and
 * branded the moment the domain is pointed at this Vercel project. It
 * deliberately decides nothing about what the real web product becomes:
 * no API calls, no dependencies, no UI library, no fetched fonts.
 *
 * The real build is tracked by the "Build v0" issue on this repo
 * (https://github.com/RokctAI/supacharge-web/issues/1). Replace this file
 * wholesale when that lands — do not grow a product out of it.
 */
import type { Metadata } from "next";
import { APP_RELEASES_URL, SITE_DESCRIPTION, SITE_NAME } from "@/app/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem 1.5rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(2.5rem, 9vw, 4.5rem)",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          fontWeight: 700,
        }}
      >
        {SITE_NAME}
      </h1>

      <p
        style={{
          margin: 0,
          maxWidth: "34rem",
          fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          lineHeight: 1.6,
          color: "#A9A9B3",
        }}
      >
        {SITE_DESCRIPTION}
      </p>

      <a
        href={APP_RELEASES_URL}
        style={{
          display: "inline-block",
          padding: "0.85rem 1.75rem",
          borderRadius: "999px",
          background: "#F5F5F7",
          color: "#0B0B0F",
          fontWeight: 600,
          fontSize: "1rem",
          textDecoration: "none",
        }}
      >
        Get the app
      </a>

      <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6E6E78" }}>
        The web experience is still being built.
      </p>
    </main>
  );
}
