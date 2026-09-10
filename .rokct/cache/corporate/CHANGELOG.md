# Changelog

## 1.0.0

* The Next.js half of `corporate_sdk`, the legal pages. Ray, 2026-09-10:
  "supa has no terms pages or about page"; asked where they belong,
  "legal pages are not in corporate sdk?" and "you should look at the
  dart side if they are not there yet". On the Dart side
  `corporate/corporate/dart` (corporate_sdk 1.2.0) owns TermPage /
  PolicyPage at `/term` and `/policy` and every composition with
  auth_sdk includes it; this half mirrors that ownership for the web
  shells and reads the same "Terms and Conditions" documents.
  * `app/legal/page.tsx`: the index of the shell's published documents,
    one link each; nothing published lists nothing and still answers 200.
  * `app/legal/[id]/page.tsx`: one document, server-rendered; a missing
    or disabled document is a 404 (`notFound()`); `generateMetadata`
    takes the document's title through base_sdk's `buildPageMetadata`.
  * `components/custom/legal/legal-doc.tsx`: `LegalDoc`,
    `normaliseLegalDoc`, `LegalDocView` - the title and the body as text
    with whitespace kept, at prose width, the way rokct.ai's hand-rolled
    `app/legal/[id]/page.tsx` renders it.
  * `components/custom/legal/legal-frame.tsx`: the host's `PLATFORM_NAME`
    linking home, the content, and base_sdk's `FooterChromeRow` carrying
    the Legal link group built from the same documents.
  * `app/actions/corporate/legal.ts`: `getPublicTerm(name)`, the guest
    gateway read (`frappe.client.get`, mirroring rokct.ai's
    `TermsService.getSystemTerm`); `null` with no backend.
  * `components/custom/legal/load-legal-doc.ts`: `loadLegalDoc(slug)` and
    `loadLegalIndex()`, the ONE seam the pages read through. Ray,
    2026-09-10 22:14Z: corporate_sdk owns the company pages (legal, about,
    team) as renderers with content from the shell's `data/` folder on
    local / hybrid shells; 1.1.0 adds the about / team pages and the
    `data/` fallback inside these two functions once base 1.35.0 lands,
    without touching the pages.
* Floors: base_sdk >= 1.37.0 (`app/actions/base/legal.ts`,
  `components/custom/landing/legal-links.ts`, `FooterChromeConfig.links`).
  Never the home SDK. No dependencies or integrations of its own.
* Tests: `tests/test_manifest.py` - installs exist and are unique, requires
  are not installed, floors are declared, every entry module is
  directive-free, the document page 404s, the index lists through the
  seam, and nothing rendered carries placeholder words.
