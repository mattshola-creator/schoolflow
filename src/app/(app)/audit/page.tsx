import { loadAuditEvents } from "@/features/shared-services/service";

export default async function AuditPage() {
  const data = await loadAuditEvents();
  return (
    <main className="space-y-8 py-8">
      <div>
        <p className="text-sm font-semibold text-emerald-800">
          Security and operations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Audit history</h1>
        <p className="mt-2 text-slate-600">
          Protected, append-only activity for the active school.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
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
