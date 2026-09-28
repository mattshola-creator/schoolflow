import { PageHeader } from "@/components/ui/page-header";
import { loadAuditEvents } from "@/features/shared-services/service";

export default async function AuditPage() {
  const data = await loadAuditEvents();
  return (
    <main className="space-y-8 py-8">
      <PageHeader
        eyebrow="Security and operations"
        title="Audit history"
        description="Protected, append-only activity for the active school."
      />
      <div className="grid gap-3 sm:hidden">
        {data.events.map((event) => {
          const metadata = event.metadata as { changedColumns?: string[] };
          return (
            <article
              key={event.id}
              className="min-w-0 rounded-xl border bg-white p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <h2 className="min-w-0 font-semibold break-words">
                  {event.action}
                </h2>
                <time className="shrink-0 text-right text-xs text-slate-500">
                  {new Date(event.occurred_at).toLocaleString()}
                </time>
              </div>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Record</dt>
                  <dd className="mt-1 break-words text-slate-700">
                    {event.entity_type}
                    {event.entity_id
                      ? ` · ${event.entity_id.slice(0, 8)}…`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500">
                    Changed fields
                  </dt>
                  <dd className="mt-1 break-words text-slate-700">
                    {metadata.changedColumns?.join(", ") ?? "—"}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
        {data.events.length === 0 && (
          <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            No school-scoped audit events yet.
          </p>
        )}
      </div>
      <div className="hidden overflow-x-auto rounded-xl border bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Action</th>
              <th className="p-3">Record</th>
              <th className="p-3">Changed fields</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => {
              const metadata = event.metadata as { changedColumns?: string[] };
              return (
                <tr key={event.id} className="border-b last:border-0">
                  <td className="p-3 whitespace-nowrap">
                    {new Date(event.occurred_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium">{event.action}</td>
                  <td className="p-3 text-slate-600">
                    {event.entity_type}
                    {event.entity_id
                      ? ` · ${event.entity_id.slice(0, 8)}…`
                      : ""}
                  </td>
                  <td className="p-3 text-slate-600">
                    {metadata.changedColumns?.join(", ") ?? "—"}
                  </td>
                </tr>
              );
            })}
            {data.events.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-slate-500">
                  No school-scoped audit events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
