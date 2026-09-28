import {
  createApprovalPolicy,
  createTask,
  decideApproval,
  submitApprovalRequest,
  updateTaskStatus,
} from "../shared-services/actions";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusNotice } from "@/components/ui/status-notice";
import { loadActionCenter } from "@/features/shared-services/service";

const panel = "min-w-0 rounded-xl border bg-white p-5 sm:p-6";

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
      <PageHeader
        eyebrow="Shared operations"
        title="Action Center"
        description="Own tasks, approvals and operational follow-up in the active school."
      />
      {message && <StatusNotice tone="success">{message}</StatusNotice>}
      {error && <StatusNotice tone="error">{error}</StatusNotice>}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className={panel}>
          <h2 className="font-semibold">New task</h2>
          <form action={createTask} className="mt-4 grid gap-3">
            <input
              name="title"
              required
              minLength={3}
              maxLength={160}
              aria-label="Task title"
              placeholder="Task title"
              className={fieldClass}
            />
            <textarea
              name="description"
              maxLength={2000}
              aria-label="Task details"
              placeholder="Details (optional)"
              className={`${fieldClass} min-h-24 py-3`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                name="priority"
                defaultValue="normal"
                aria-label="Task priority"
                className={fieldClass}
              >
                <option value="low">Low priority</option>
                <option value="normal">Normal priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                name="dueAt"
                type="datetime-local"
                className={fieldClass}
                aria-label="Due date"
              />
            </div>
            <Button className="w-full" type="submit">
              Add task
            </Button>
          </form>
        </div>
        <div className={panel}>
          <h2 className="font-semibold">New approval policy</h2>
          <form action={createApprovalPolicy} className="mt-4 grid gap-3">
            <input
              name="name"
              required
              aria-label="Policy name"
              placeholder="Policy name"
              className={fieldClass}
            />
            <input
              name="key"
              required
              aria-label="Policy key"
              placeholder="admissions.offer"
              className={fieldClass}
            />
            <input
              name="description"
              aria-label="Policy purpose"
              placeholder="Purpose (optional)"
              className={fieldClass}
            />
            <select
              name="approverRoleId"
              required
              aria-label="First-step approver role"
              className={fieldClass}
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
            <Button className="w-full" type="submit" variant="secondary">
              Create policy
            </Button>
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
                className="flex min-w-0 flex-col items-stretch gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words">{task.title}</p>
                  <p className="text-sm break-words text-slate-500">
                    {task.priority} · {task.status}
                    {task.due_at
                      ? ` · due ${new Date(task.due_at).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <form
                  action={updateTaskStatus}
                  className="grid min-w-0 gap-2 sm:flex sm:shrink-0"
                >
                  <input type="hidden" name="taskId" value={task.id} />
                  <select
                    name="status"
                    defaultValue={task.status}
                    aria-label={`Status for ${task.title}`}
                    className={`${fieldClass} mt-0 sm:w-auto`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button className="w-full sm:w-auto" type="submit">
                    Save
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className={panel}>
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
                aria-label="Approval policy"
                className={fieldClass}
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
                aria-label="Request title"
                placeholder="Request title"
                className={fieldClass}
              />
              <input
                name="subjectType"
                required
                aria-label="Request subject type"
                placeholder="Subject type, e.g. application"
                className={fieldClass}
              />
              <input
                name="subjectId"
                required
                aria-label="Request subject identifier"
                placeholder="Subject UUID"
                className={fieldClass}
              />
              <Button className="w-full" type="submit">
                Submit request
              </Button>
            </form>
          )}
        </div>
        <div className={panel}>
          <h2 className="font-semibold">Approval inbox</h2>
          {data.requests.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No approval requests.</p>
          ) : (
            data.requests.map((request) => (
              <div
                key={request.id}
                className="mt-4 border-t pt-4 first:border-t-0 first:pt-0"
              >
                <p className="font-medium break-words">{request.title}</p>
                <p className="text-sm text-slate-500">
                  {request.status} · step {request.current_step}
                </p>
                {request.status === "pending" && (
                  <form
                    action={decideApproval}
                    className="mt-3 grid min-w-0 gap-2 sm:grid-cols-3"
                  >
                    <input type="hidden" name="requestId" value={request.id} />
                    <input
                      name="comment"
                      aria-label={`Comment for ${request.title}`}
                      placeholder="Comment"
                      className={`${fieldClass} mt-0 sm:col-span-3`}
                    />
                    <Button
                      name="decision"
                      value="approved"
                      className="w-full"
                      type="submit"
                    >
                      Approve
                    </Button>
                    <Button
                      name="decision"
                      value="returned"
                      className="w-full"
                      type="submit"
                      variant="secondary"
                    >
                      Return
                    </Button>
                    <Button
                      name="decision"
                      value="rejected"
                      className="w-full bg-red-700 hover:bg-red-800"
                      type="submit"
                    >
                      Reject
                    </Button>
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
                <p className="font-medium break-words">{notification.title}</p>
                {notification.body && (
                  <p className="mt-1 text-sm break-words text-slate-600">
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
