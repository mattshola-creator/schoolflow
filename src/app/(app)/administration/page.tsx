import { AdministrationWorkspace } from "@/components/administration-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { loadAdministrationWorkspace } from "@/features/administration/service";

export default async function AdministrationPage() {
  const workspace = await loadAdministrationWorkspace();

  return (
    <main className="space-y-8 py-3 sm:py-5">
      <PageHeader
        eyebrow="Administration center"
        title={`${workspace.active.schoolName ?? workspace.active.organizationName} administration`}
        description="Membership, effective access, organizational scope and module availability explained from live server-authorized records."
      />
      <AdministrationWorkspace workspace={workspace} />
    </main>
  );
}
