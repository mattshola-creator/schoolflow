export function CommunicationNoticeList({ notices }: { notices: unknown[] }) {
  return (
    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="mb-3 text-lg font-semibold">
        Recent notices
      </h2>
      {notices.length === 0 ? (
        <p className="rounded-xl border bg-white p-5 text-sm text-slate-600">
          No notices have been published for this school yet.
        </p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => {
            const item = notice as Record<string, unknown>;
            return (
              <article
                key={String(item.id)}
                className="min-w-0 rounded-xl border bg-white p-4"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="min-w-0 font-semibold break-words">
                    {String(item.title)}
                  </h3>
                  <span className="text-xs text-slate-500 uppercase">
                    {String(item.status)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm break-words text-slate-600">
                  {String(item.body)}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
