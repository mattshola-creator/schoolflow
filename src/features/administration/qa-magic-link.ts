export function readQaMagicLinkTokenHash(fragment: string): string | null {
  const parameters = new URLSearchParams(
    fragment.startsWith("#") ? fragment.slice(1) : fragment,
  );
  if (parameters.get("type") !== "magiclink") return null;
  const tokenHash = parameters.get("token_hash");
  return tokenHash && tokenHash.length <= 2048 ? tokenHash : null;
}
