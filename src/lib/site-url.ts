export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL;

  if (!value) {
    if (process.env.NODE_ENV === "production")
      throw new Error("Application URL must be configured in production.");
    return "http://localhost:3000";
  }

  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost")
    throw new Error("Application URL must use HTTPS.");
  return url.origin;
}

export function getPasswordRecoveryRedirectUrl() {
  return `${getSiteUrl()}/auth/callback?next=/update-password`;
}
