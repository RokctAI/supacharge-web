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

// Which file of the latest Supacharge release a platform downloads (1.15.0;
// Ray, 2026-09-09: "there is no way we can resolve to get the direct
// download link?").
//
// The release lane (RokctAI/supacharge .github/workflows/release.yml) names
// every asset for its version - app-v1.2.9.apk, app-windows-v1.2.9.zip - so
// GitHub's stable releases/latest/download/<asset> form, which needs a
// version-less name, never resolves. What does resolve is the public
// releases API: the latest release lists its assets, and each platform's
// file is the one whose name matches that platform's pattern. This module
// is the pure half of that: given the API's JSON, which URL to send the
// visitor to. It imports nothing and reads no environment, so
// tests/test_download_route.py runs it under node as it is; the fetch, the
// cache and the redirect are ./route.ts's.

/** The releases page, where every fallback goes. */
export const LMS_RELEASES_PAGE =
  "https://github.com/RokctAI/supacharge/releases/latest";

/** The public API for the latest release (no token: the repository is public). */
export const LMS_RELEASES_API =
  "https://api.github.com/repos/RokctAI/supacharge/releases/latest";

/**
 * The platforms the route serves, by the name in the URL
 * (/download/<platform>), each with the patterns its release asset's name
 * matches, in order of preference: the first pattern with a match wins.
 * Anchored to the lane's naming: the Android build is app-v<version>.apk
 * (NOT app-debug-v<version>.apk, the debug build beside it, and not the
 * .aab the Play lane takes). The Windows build is the single installer
 * <app>-windows-setup-v<version>.exe once the release lane ships it (Ray,
 * 2026-09-09: one installer instead of the zip), and until then - and for
 * any release that still carries only the archive - app-windows-v<version>.zip
 * (not update_package.zip, the in-app updater's bundle). iOS is absent on
 * purpose: no lane builds it and no listing exists, so there is nothing
 * to resolve and the route answers 404 rather than inventing a
 * destination.
 */
export const LMS_DOWNLOAD_PLATFORMS = {
  android: { name: "Android", assets: [/^app-v\d[\w.-]*\.apk$/i] },
  windows: {
    name: "Windows",
    assets: [
      /^[\w.-]*-windows-setup-v\d[\w.-]*\.exe$/i,
      /^app-windows-v\d[\w.-]*\.zip$/i,
    ],
  },
} as const;

export type DownloadPlatform = keyof typeof LMS_DOWNLOAD_PLATFORMS;

/** Whether a URL segment names a platform the route serves. */
export function isDownloadPlatform(value: string): value is DownloadPlatform {
  return Object.prototype.hasOwnProperty.call(LMS_DOWNLOAD_PLATFORMS, value);
}

/** The fields of the API's release object this module reads. */
export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface Release {
  tag_name?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
  assets?: ReleaseAsset[];
}

function isHttpsUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("https://");
}

/**
 * The direct download URL for a platform in a release, or null when the
 * release is not a published one, is not shaped like the API's, or carries
 * no asset matching any of the platform's patterns. The patterns are tried
 * in order, so the installer wins over the archive whatever order the API
 * lists them in. The JSON arrives from the network, so every field is
 * checked before it is trusted.
 */
export function pickAssetUrl(
  release: unknown,
  platform: DownloadPlatform,
): string | null {
  if (!release || typeof release !== "object") return null;
  const { draft, prerelease, assets } = release as Release;
  if (draft === true || prerelease === true) return null;
  if (!Array.isArray(assets)) return null;
  for (const pattern of LMS_DOWNLOAD_PLATFORMS[platform].assets) {
    for (const asset of assets) {
      if (!asset || typeof asset !== "object") continue;
      const { name, browser_download_url } = asset as ReleaseAsset;
      if (typeof name !== "string" || !pattern.test(name)) continue;
      if (!isHttpsUrl(browser_download_url)) continue;
      return browser_download_url;
    }
  }
  return null;
}

export interface DownloadTarget {
  /** Where to send the visitor. */
  url: string;
  /** True when url is the asset itself; false when it is the releases page. */
  direct: boolean;
}

/**
 * Where /download/<platform> sends the visitor: the platform's asset in
 * the latest release when the API answered with one, otherwise the
 * releases page (its own html_url when the API gave one, else the fixed
 * page) - never a 404 and never an invented URL.
 */
export function resolveDownload(
  release: unknown,
  platform: DownloadPlatform,
): DownloadTarget {
  const asset = pickAssetUrl(release, platform);
  if (asset) return { url: asset, direct: true };
  const page =
    release && typeof release === "object"
      ? (release as Release).html_url
      : undefined;
  return { url: isHttpsUrl(page) ? page : LMS_RELEASES_PAGE, direct: false };
}
