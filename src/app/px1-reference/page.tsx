import { ApplicationShell } from "@/components/application-shell";
import { ContextRibbon } from "@/components/context-ribbon";
import { SkipLink } from "@/components/ui/skip-link";
import ExperiencePreviewPage from "@/app/(app)/experience-preview/page";

const referenceNavigation = [
  { href: "/px1-reference#people", label: "Students", group: "People" },
  { href: "/px1-reference#academics", label: "Academics", group: "Academics" },
  { href: "/px1-reference#operations", label: "Finance", group: "Operations" },
  {
    href: "/px1-reference#communication",
    label: "Communication",
    group: "Communication",
  },
  { href: "/px1-reference#insights", label: "Insights", group: "Insights" },
  {
    href: "/px1-reference#administration",
    label: "Administration",
    group: "Administration",
  },
];

export default function Px1ReferencePage() {
  const active = {
    organizationId: "synthetic-organization",
    organizationName: "Cedarbridge Learning Group",
    schoolId: "synthetic-school",
    schoolName: "Cedarbridge Primary School",
  };
  return (
    <>
      <SkipLink />
      <ApplicationShell
        items={referenceNavigation}
        unavailableItems={[
          {
            label: "Platform Console",
            reason: "Separate platform-operator authorization required",
          },
        ]}
        userEmail="founder.preview@schoolflow.example"
        helpHref="/px1-reference#guidance"
        homeHref="/px1-reference"
        contextRibbon={
          <ContextRibbon
            active={active}
            options={[active]}
            academic={{
              sessionId: "synthetic-session",
              sessionName: "2026/2027",
              periodId: "synthetic-period",
              periodName: "First Term",
              available: true,
            }}
          />
        }
      >
        <ExperiencePreviewPage />
      </ApplicationShell>
    </>
  );
}
