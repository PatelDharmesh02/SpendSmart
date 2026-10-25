const LOOPBACK = /^(https?|wss?):\/\/(127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$)/i;

function configuredApiUrl(): string | undefined {
  const production = process.env.NEXT_PUBLIC_APP_ENV === "production";
  const value = production
    ? process.env.NEXT_PUBLIC_API_URL_PROD
    : process.env.NEXT_PUBLIC_API_URL_DEV;
  const trimmed = value?.trim().replace(/\/$/, "");
  return trimmed || undefined;
}

/**
 * Browser-facing API root, including the /api/v1 prefix.
 * Always same-origin. spend-smart-frontend and spend-smart-backend are
 * different sites (vercel.app is a public suffix), so a cookie set by the
 * API host is never sent on the later /auth/me call. The app route proxies
 * /api/v1 to the API and the session cookie stays on the frontend host.
 */
export function apiBaseUrl(): string {
  return "/api/v1";
}

/** Origin the /api/v1 route forwards to. */
export function apiProxyTarget(): string {
  const configured = configuredApiUrl();
  if (configured && !configured.startsWith("/")) {
    try {
      return new URL(configured).origin;
    } catch {
      /* Fall through to the explicit proxy target. */
    }
  }
  return process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";
}

export function wsBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_WS_URL?.trim().replace(/\/$/, "");
  const production = process.env.NEXT_PUBLIC_APP_ENV === "production";
  if (configured && (!production || !LOOPBACK.test(configured))) {
    return configured;
  }
  const api = (production ? process.env.NEXT_PUBLIC_API_URL_PROD : configuredApiUrl())?.trim();
  if (api && !api.startsWith("/")) {
    try {
      const url = new URL(api);
      const protocol = url.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${url.host}`;
    } catch {
      /* Fall through to the configured socket URL. */
    }
  }
  return configured || "ws://127.0.0.1:8000";
}
