/**
 * Canonical site origin for OAuth (redirectTo) and /auth/callback redirects.
 * IDE “simple browser” / tunnel ports (e.g. 10000) are not real app URLs.
 */

const IDE_PREVIEW_PORTS = new Set(["10000", "10001", "10002"]);

export function isIdePreviewOrigin(originOrUrl: string): boolean {
  try {
    const u = new URL(
      originOrUrl.includes("://") ? originOrUrl : `https://${originOrUrl}`,
    );
    const host = u.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") return false;
    const port = u.port || (u.protocol === "https:" ? "443" : "80");
    return IDE_PREVIEW_PORTS.has(port);
  } catch {
    return false;
  }
}

/**
 * Prefer explicit app URL, then Render’s public URL. Skips NEXT_PUBLIC_APP_URL
 * when it mistakenly points at an IDE preview origin so production OAuth still works.
 */
export function publicSiteOrigin(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit && !isIdePreviewOrigin(explicit)) return explicit;
  const render = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
  if (render) return render;
  if (explicit) return explicit;
  return undefined;
}

/** Prefer canonical env origin; avoids redirecting to IDE preview hosts when request URL is wrong. */
export function safeRedirectOrigin(requestUrl: string): string {
  const canonical = publicSiteOrigin();
  if (canonical) return canonical;
  return new URL(requestUrl).origin;
}
