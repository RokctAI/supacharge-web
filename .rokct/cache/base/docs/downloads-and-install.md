# Downloads, the install offer and the suffix in primary

Three generic seams base_sdk 1.41.0 adds to the shell's chrome. Base
declares NO entry, NO site name and NO colour for any of them: a home SDK
hands the data in, and a shell whose home SDK declares nothing renders
exactly what it rendered before.

## The site name's suffix in the primary colour

Ray, 2026-09-11 07:34:03Z: "also site name the .school get primary color
in nextjs".

The header's stem wordmark (`components/custom/header.tsx`,
`BrandStemWordmark`) shows a dotted platform name as its capitalised stem
followed by the rest of the name - the dot and the suffix. Since 1.41.0
that suffix span carries `text-primary`, the theme token every shell
already defines, and its own hook:

```tsx
<span data-brand-wordmark="tld" className="min-w-0 overflow-hidden text-primary">
  {suffix}
</span>
```

The stem span before it keeps `text-foreground`; the country-code span
beside the stem and the wordmark's own class list are untouched; the
slide the suffix makes when the header collapses is unchanged. A home SDK
that wants the suffix in another colour, weight or face styles
`[data-brand-wordmark="tld"]` with one rule, the way it styles
`[data-brand-wordmark="stem"]`.

The hero has the matching mode. `HeroConfig.brand` accepts `"stem-tld"`
beside `"name"` and `"stem"`:

| `brand`      | The hero's wordmark slot                                            |
| ------------ | ------------------------------------------------------------------- |
| `"name"`     | The host's own `Branding` component (the default).                  |
| `"stem"`     | The capitalised stem as text; the full name on aria-label and title. |
| `"stem-tld"` | The same stem, then the suffix in `text-primary` with the `tld` hook. |

A home SDK's hero copy declares `brand: "stem-tld"` the way it declares
`brand: "stem"` today; nothing else changes on its side.

`resolveHeroWordmark(brand, name)` (`landing/landing-page.ts`) answers
`{ text, name, suffix }` for `"stem-tld"` - the suffix is the trimmed
name after the stem, in its own case - and `{ text, name }` for `"stem"`
or for a name with no dot; `HeroWordmarkSlot` (`hero-view.tsx`) draws the
suffix after the stem inside the same span, so it shares the face and
the size, which is now computed over the stem and the suffix together.

## Footer downloads: one icon button per platform

Ray, 2026-09-11 07:34:37Z: "footer has  download links let them be
platform icons buttons".

`FooterChromeConfig` (`landing/footer-chrome-config.ts`) gains
`downloads?: DownloadEntry[]`:

```ts
export type DownloadPlatform =
  | "ios" | "android" | "huawei" | "macos" | "windows" | "linux" | "web";

export interface DownloadEntry {
  id: string;
  platform: DownloadPlatform;
  label: string;        // "Android app": the button's aria-label
  href: string;         // https URL, or a route of the shell's own
  external?: boolean;   // target _blank, rel noreferrer
  title?: string;       // the button's title when not the label
  mark?: BrandMarkId;   // googlePlay | appGallery | appStore | windows | chromeWebStore
}
```

`FooterChromeRow` (`components/custom/footer-chrome.tsx`) draws the
entries as `<nav aria-label="Downloads">` beside the link groups, above
the copyright line: one `<a>` per entry, 40px round, the theme's border,
transparent and tinted on hover
(`h-10 w-10 rounded-full border border-border bg-transparent hover:bg-muted flex items-center justify-center`),
the label as `aria-label` and `title`, the platform on
`data-download-platform`. Inside it: the mark the entry names, from
`BRAND_MARKS` through `next/image` with `markImageClass` (so the two
monochrome marks invert on the dark shell, as everywhere else), or - with
no mark named - a neutral glyph from `landing/platform-glyphs.tsx`: a
phone (ios, android, huawei), a laptop (macos, windows), a terminal
(linux) or a globe (web), stroked in `currentColor`. No third-party mark
is ever drawn by hand.

`landing/download-platform.ts` holds the pure rules: `DOWNLOAD_PLATFORMS`,
`isDownloadPlatform`, `isDownloadHref` (`https:` with a host, or a path
with one leading slash), `isDownloadEntry`, `normaliseDownloads` (the
drawable entries in declared order, the first of two with the same `id`)
and `downloadTitle`. Nothing declared, or nothing drawable, draws no nav.

`FooterChromeLabels.downloads` ("Downloads") is the nav's accessible
name; override it with the other words.

## The install offer: the app for the visitor's platform

Ray, 2026-09-11 07:37:17Z: "this nextjs has install, it does show on
mobile though i havent seen it in desktop i think it installs as pwa but
i think it should check the platform and offer app of that platform".

`components/custom/install-offer.tsx` (`"use client"`) exports
`InstallOffer({ downloads, labels?, platform?, className? })`:

1. It renders NOTHING on the server and on the first client render.
2. After mount it reads `matchMedia("(display-mode: standalone)")` - an
   installed page gets no offer - and the visitor's platform
   (`landing/install-offer.ts` `detectPlatform()`:
   `navigator.userAgentData.platform` first, then the user-agent string:
   iPhone/iPad to `ios`, HarmonyOS/HUAWEI to `huawei`, Android to
   `android`, Windows to `windows`, Mac to `macos`, Linux/X11 to
   `linux`; nothing recognised is `null`).
3. `pickDownload(downloads, platform)` takes the first entry for the
   platform, with `android` falling back to `huawei` and `huawei` to
   `android` (`DOWNLOAD_FALLBACKS`); the desktops and iOS take only their
   own; `web` and `null` take none.
4. With an entry it draws one icon button and "Get the <label>" (the
   entry's label; `labels.get` overrides the prefix) linking there.
5. With none it listens for the browser's `beforeinstallprompt`, keeps
   the event, and draws "Install" (`labels.install`), which shows that
   prompt.
6. With neither it draws nothing.

`platform` forces the platform for a preview or a test. `FooterChromeRow`
mounts the offer FIRST in the Downloads nav (`installOffer` prop, default
`true`); a home SDK that wants it in a header slot imports it from
`@/components/custom/install-offer` with the same `downloads` and passes
`installOffer={false}` to the row. Base changes no header by default.

## Declaring the entries

A home SDK spreads the entries into the config its footer hands the row:

```ts
import { FooterChromeRow } from "@/components/custom/footer-chrome";
import { FOOTER_CHROME_CONFIG } from "@/components/custom/landing/footer-chrome-config";

<FooterChromeRow
  config={{
    ...FOOTER_CHROME_CONFIG,
    downloads: [
      { id: "android", platform: "android", label: "Android app", href: "/get/android", mark: "googlePlay" },
      { id: "web", platform: "web", label: "Web app", href: "/app" },
    ],
  }}
/>
```

Every word, link and mark there is the home SDK's; the hrefs above are
routes so this page names no host.

## Tests

`tests/download-platform.test.mts` and `tests/install-offer.test.mts`
(node) execute the rules; `tests/test_manifest.py` holds the header's
suffix span, the hero mode, the seam's shape, the row's nav and button,
the component's contract and the installs.
