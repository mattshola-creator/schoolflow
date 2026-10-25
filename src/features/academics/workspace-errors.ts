import { AuthorizationError } from "@/lib/authorization";

/** Expected denials may render an unavailable section. Source failures must reach the error boundary. */
export function unavailableOnAuthorizationDenial(error: unknown): null {
  if (error instanceof AuthorizationError) return null;
  throw error;
}
