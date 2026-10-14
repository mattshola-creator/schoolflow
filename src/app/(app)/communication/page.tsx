import { PageHeader } from "@/components/ui/page-header";
import { StatusNotice } from "@/components/ui/status-notice";
import { CommunicationNoticeList } from "@/components/communication-notice-list";
import { loadCommunicationWorkspace } from "@/features/communication/service";
import { publishNotice } from "./actions";

export const dynamic = "force-dynamic";

export default async function CommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const [{ notices }, { message }] = await Promise.all([
    loadCommunicationWorkspace(),
    searchParams,
  ]);
  return (
    <div className="space-y-6 py-8">
      <PageHeader
        eyebrow="Communication"
        title="Information center"
        description="Publish targeted, auditable school communication without exposing personal contact details."
      />
      {message === "published" ? (
        <StatusNotice tone="success">
          Notice published successfully.
        </StatusNotice>
      ) : null}
      <section
        className="rounded-xl border bg-white p-4 sm:p-6"
        aria-labelledby="publish-heading"
      >
        <h2 id="publish-heading" className="text-lg font-semibold">
          Publish a notice
        </h2>
        <form action={publishNotice} className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Title
            <input
              required
              minLength={3}
              maxLength={180}
              name="title"
              className="min-h-11 rounded-lg border px-3"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Message
            <textarea
              required
              maxLength={10000}
              rows={5}
              name="body"
              className="rounded-lg border px-3 py-2"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              Priority
              <select
                name="priority"
                className="min-h-11 rounded-lg border px-3"
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Audience
              <select
                name="audienceKind"
                className="min-h-11 rounded-lg border px-3"
              >
                <option value="school">Entire school</option>
                <option value="guardians">Parents and guardians</option>
                <option value="students">Students</option>
              </select>
            </label>
          </div>
          <button className="min-h-11 justify-self-start rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
            Publish notice
          </button>
        </form>
      </section>
      <CommunicationNoticeList notices={notices} />
    </div>
  );
}
