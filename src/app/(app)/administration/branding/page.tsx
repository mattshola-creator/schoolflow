import { AuthorizationError } from "@/lib/authorization";
import { BrandingSubscriptionError } from "@/features/branding/context";
import { StatePanel } from "@/components/ui/state-panel";
import { notFound } from "next/navigation";
import { BrandingStudio } from "@/features/branding/studio";
import "@/features/showroom/visualizations.css";
import { brandingSession, loadBranding } from "@/features/branding/persistence";
export default async function BrandingPage() {
  if (
    process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://afqykqlxecpzspjoyegc.supabase.co"
  )
    notFound();
  const context = await brandingSession().catch((error: unknown) => {
    if (
      error instanceof AuthorizationError ||
      error instanceof BrandingSubscriptionError
    )
      return null;
    throw error;
  });
  if (!context)
    return (
      <StatePanel
        kind="unauthorized"
        title="Branding access unavailable"
        description="Choose an authorized school and an active subscription. School publishing requires effective Organization Owner authority."
      />
    );
  const snapshot = await loadBranding(context);
  return (
    <>
      <p role="status">
        Private Storage credential:{" "}
        {process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "present; operational verification pending"
          : "not configured"}
      </p>
      <BrandingStudio
        key={context.schoolId}
        schoolName={context.schoolName}
        plan={context.plan}
        initialSnapshot={snapshot}
      />
    </>
  );
}
