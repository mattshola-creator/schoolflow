import { ApplicationShell } from "@/components/application-shell";
import { ContextRibbon } from "@/components/context-ribbon";
import { OperationsPrototype } from "@/components/px3/operations-prototype";
import { SkipLink } from "@/components/ui/skip-link";

const items = [
  { href: "/px3-operations", label: "Home", group: "Home" },
  { href: "/px3-operations#students", label: "Students", group: "People" },
  {
    href: "/px3-operations#assessment",
    label: "Assessment",
    group: "Academics",
  },
  { href: "/px3-operations#teaching", label: "Teaching", group: "Academics" },
  { href: "/px3-operations#finance", label: "Finance", group: "Operations" },
  {
    href: "/px3-operations#admin",
    label: "Administration",
    group: "Administration",
  },
];

export default function Px3OperationsPage() {
  const primary = {
    organizationId: "synthetic-cedarbridge",
    organizationName: "Cedarbridge Learning Group",
    schoolId: "synthetic-primary",
    schoolName: "Cedarbridge Primary School",
  };
  return (
    <>
      <SkipLink />
      <ApplicationShell
        items={items}
        unavailableItems={[
          { label: "Northgate School", reason: "No membership in this school" },
          {
            label: "Platform Console",
            reason: "Separate platform-operator authorization required",
          },
        ]}
        userEmail="operations.preview@schoolflow.example"
        homeHref="/px3-operations"
        notificationHref="/px3-operations#day"
        helpHref="/px3-operations#guidance"
        contextRibbon={
          <ContextRibbon
            active={primary}
            options={[
              primary,
              {
                ...primary,
                schoolId: "synthetic-academy",
                schoolName: "Cedarbridge Academy",
              },
            ]}
            academic={{
              sessionId: "synthetic-2026",
              sessionName: "2026/2027",
              periodId: "synthetic-term-1",
              periodName: "First Term",
              available: true,
            }}
          />
        }
      >
        <OperationsPrototype />
      </ApplicationShell>
    </>
  );
}
