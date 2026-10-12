export function hasValidConversionOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null) return false;

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return true;

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost ?? request.headers.get("host");
  if (!host) return false;

  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);

  return origin === `${protocol}://${host}`;
}
