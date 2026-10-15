import { randomUUID } from "node:crypto";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusNotice } from "@/components/ui/status-notice";
import { loadPortalMessages } from "@/features/communication/service";
import { replyToPortalMessage } from "./actions";

export const dynamic = "force-dynamic";

export default async function PortalMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [data, params] = await Promise.all([
    loadPortalMessages(),
    searchParams,
  ]);
  return (
    <main className="space-y-6 py-8">
      <PageHeader
        eyebrow="Family and student portal"
        title="Messages"
        description="Controlled school conversations for your linked learners. Access follows your active portal relationships and message participation."
        actions={
          <Link
            href="/portal"
            className="inline-flex min-h-11 items-center rounded-lg border bg-white px-4 py-2 text-sm font-medium"
          >
            Back to portal
          </Link>
        }
      />
      {params.sent === "1" ? (
        <StatusNotice tone="success">Your message was sent.</StatusNotice>
      ) : null}
      {params.error === "send" ? (
        <StatusNotice tone="error">
          The reply was not sent. Confirm that the conversation is open and try
          again.
        </StatusNotice>
      ) : null}
      {data.threads.length === 0 ? (
        <StatusNotice tone="success">
          No messages are available for your linked learners.
        </StatusNotice>
      ) : (
        <section className="grid gap-4" aria-label="Message inbox">
          {data.threads.map((thread) => (
            <article
              className="min-w-0 rounded-xl border bg-white p-4 sm:p-6"
              key={thread.threadId}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold break-words">
                    {thread.subject}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {thread.status === "open"
                      ? "Open conversation"
                      : "Closed conversation"}
                    {" · "}
                    Updated{" "}
                    {new Date(thread.updatedAt).toLocaleDateString("en-NG")}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 capitalize">
                  {thread.status}
                </span>
              </div>
              {thread.messages.length ? (
                <ol
                  className="mt-4 grid gap-3"
                  aria-label={`Messages in ${thread.subject}`}
                >
                  {thread.messages.map((message) => (
                    <li
                      key={message.id}
                      className="min-w-0 rounded-lg bg-slate-50 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                          {message.senderUserId === data.userId
                            ? "You"
                            : "School"}
                        </span>
                        <time dateTime={message.sentAt}>
                          {new Date(message.sentAt).toLocaleString("en-NG")}
                        </time>
                      </div>
                      <p className="mt-2 text-sm break-words whitespace-pre-wrap text-slate-800">
                        {message.status === "withdrawn"
                          ? "Message withdrawn"
                          : message.body}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  No messages have been sent in this conversation.
                </p>
              )}
              {thread.status === "open" ? (
                <form action={replyToPortalMessage} className="mt-4 grid gap-3">
                  <input
                    type="hidden"
                    name="threadId"
                    value={thread.threadId}
                  />
                  <input type="hidden" name="requestId" value={randomUUID()} />
                  <label className="grid gap-1 text-sm font-medium">
                    Reply
                    <textarea
                      name="body"
                      required
                      minLength={1}
                      maxLength={5000}
                      rows={3}
                      className="min-h-24 rounded-lg border px-3 py-2"
                      aria-label={`Reply to ${thread.subject}`}
                    />
                  </label>
                  <button className="min-h-11 w-full rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:w-auto sm:justify-self-end">
                    Send reply
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </section>
      )}
      <p className="text-xs text-slate-500">
        Replies are limited to open, participant-authorized school
        conversations. Delivery uses the existing in-app notification contract.
      </p>
    </main>
  );
}
