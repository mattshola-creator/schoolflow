import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { OnboardingPrototype } from "@/components/onboarding-prototype";

export const metadata: Metadata = {
  title: "Explore onboarding | SchoolFlow",
  description: "A synthetic, non-persistent SchoolFlow onboarding prototype.",
};
export default function GetStartedPage() {
  return (
    <MarketingShell>
      <OnboardingPrototype />
    </MarketingShell>
  );
}
