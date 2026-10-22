import { notFound } from "next/navigation";
import { requireBrandingContext } from "@/features/branding/context";
import { BrandingStudio } from "@/features/branding/studio";
import "@/features/showroom/visualizations.css";
export default async function BrandingPage() {
  if (
    process.env.SCHOOLFLOW_SHELL_REVIEW !== "true" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !==
      "https://afqykqlxecpzspjoyegc.supabase.co"
  )
    notFound();
  const context = await requireBrandingContext();
  return <BrandingStudio schoolName={context.schoolName} plan={context.plan} />;
}
