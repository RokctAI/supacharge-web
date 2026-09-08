// Tailwind and the shared token set for every route in this shell.
// base_sdk's landing pulls its own extra sheets on top (the platform
// scrollbar, lms_sdk's theme); this is the one the root layout owns.
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/app/site";
import { SessionProvider } from "@/components/custom/session-provider";
import { ThemeProvider } from "@/components/custom/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — the super app for everyday money`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — the super app for everyday money`,
    description: SITE_DESCRIPTION,
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — the super app for everyday money`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  // Dark first, but light is reachable through the header's theme toggle, so
  // the UA must not be told this page is dark-only.
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: next-themes writes the theme class onto <html>
    // in a blocking script before hydration, so the server markup and the
    // first client render differ here by design.
    <html lang="en" suppressHydrationWarning>
      <body
        // The ground is painted by globals.css's `body { @apply bg-background
        // text-foreground }` — NOT by an inline colour. The inline
        // `background: #0B0B0F` that used to live here won over every
        // `bg-background` beneath it, which is why the composed auth card
        // rendered its light palette on a permanently black page.
        style={{
          margin: 0,
          minHeight: "100dvh",
          // System font stack only: no webfont is fetched at build or run time,
          // so this page has no external dependency to fail on.
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
