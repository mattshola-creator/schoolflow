/** Non-secret build marker, never an authorization decision. */
export function isShellReviewBuild(
  context: string | undefined,
  projectUrl: string | undefined,
) {
  return (
    context === "deploy-preview" &&
    projectUrl === "https://afqykqlxecpzspjoyegc.supabase.co"
  );
}
