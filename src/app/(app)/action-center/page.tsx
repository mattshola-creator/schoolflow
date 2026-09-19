import {
  createApprovalPolicy,
  createTask,
  decideApproval,
  submitApprovalRequest,
  updateTaskStatus,
} from "../shared-services/actions";
import { loadActionCenter } from "@/features/shared-services/service";

export default async function ActionCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ message, error }, data] = await Promise.all([
    searchParams,
    loadActionCenter(),
  ]);
  return (
    <main className="space-y-8 py-8">
      <div>
        <p className="text-sm font-semibold text-emerald-800">
          Shared operations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Action Center</h1>
        <p className="mt-2 text-slate-600">
          Own tasks, approvals and operational follow-up in the active school.
        </p>
      </div>
      {message && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>
      )}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">New task</h2>
          <form action={createTask} className="mt-4 grid gap-3">
            <input
              name="title"
              required
              minLength={3}
              maxLength={160}
              placeholder="Task title"
              className="rounded-lg border px-3 py-2"
            />
            <textarea
              name="description"
              maxLength={2000}
              placeholder="Details (optional)"
              className="rounded-lg border px-3 py-2"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                name="priority"
                defaultValue="normal"
                className="rounded-lg border px-3 py-2"
              >
                <option value="low">Low priority</option>
                <option value="normal">Normal priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                name="dueAt"
                type="datetime-local"
                className="rounded-lg border px-3 py-2"
                aria-label="Due date"
              />
            </div>
            <button className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white">
              Add task
            </button>
          </form>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">New approval policy</h2>
          <form action={createApprovalPolicy} className="mt-4 grid gap-3">
            <input
              name="name"
              required
              placeholder="Policy name"
              className="rounded-lg border px-3 py-2"
            />
            <input
              name="key"
              required
              placeholder="admissions.offer"
              className="rounded-lg border px-3 py-2"
            />
            <input
              name="description"
              placeholder="Purpose (optional)"
              className="rounded-lg border px-3 py-2"
            />
            <select
              name="approverRoleId"
              required
              className="rounded-lg border px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>
                Choose first-step approver role
              </option>
              {data.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <button className="rounded-lg border border-emerald-800 px-4 py-2 font-medium text-emerald-900">
              Create policy
            </button>
          </form>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Open work</h2>
        <div className="mt-3 overflow-hidden rounded-xl border bg-white">
          {data.tasks.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No tasks need attention.
            </p>
          ) : (
            data.tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b p-4 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-slate-500">
                    {task.priority} · {task.status}
                    {task.due_at
                      ? ` · due ${new Date(task.due_at).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <form action={updateTaskStatus} className="flex gap-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <select
                    name="status"
                    defaultValue={task.status}
                    className="rounded-lg border px-2 py-1 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white">
                    Save
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Submit approval</h2>
          {data.policies.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Create a policy first.
            </p>
          ) : (
            <form action={submitApprovalRequest} className="mt-4 grid gap-3">
              <select
                name="policyId"
                required
                className="rounded-lg border px-3 py-2"
              >
                {data.policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                name="title"
                required
                placeholder="Request title"
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="subjectType"
                required
                placeholder="Subject type, e.g. application"
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="subjectId"
                required
                placeholder="Subject UUID"
                className="rounded-lg border px-3 py-2"
              />
              <button className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white">
                Submit request
              </button>
            </form>
          )}
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Approval inbox</h2>
          {data.requests.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No approval requests.</p>
          ) : (
            data.requests.map((request) => (
              <div
                key={request.id}
                className="mt-4 border-t pt-4 first:border-t-0 first:pt-0"
              >
                <p className="font-medium">{request.title}</p>
                <p className="text-sm text-slate-500">
                  {request.status} · step {request.current_step}
                </p>
                {request.status === "pending" && (
                  <form
                    action={decideApproval}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    <input type="hidden" name="requestId" value={request.id} />
                    <input
                      name="comment"
                      placeholder="Comment"
                      className="min-w-48 rounded-lg border px-2 py-1 text-sm"
                    />
                    <button
                      name="decision"
                      value="approved"
                      className="rounded-lg bg-emerald-800 px-3 py-1 text-sm text-white"
                    >
                      Approve
                    </button>
                    <button
                      name="decision"
                      value="returned"
                      className="rounded-lg border px-3 py-1 text-sm"
                    >
                      Return
                    </button>
                    <button
                      name="decision"
                      value="rejected"
                      className="rounded-lg bg-red-700 px-3 py-1 text-sm text-white"
                    >
                      Reject
                    </button>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </section>
      {data.notifications.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl border bg-white p-4"
              >
                <p className="font-medium">{notification.title}</p>
                {notification.body && (
                  <p className="mt-1 text-sm text-slate-600">
                    {notification.body}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
