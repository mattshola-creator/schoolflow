import Link from "next/link";
import { ArrowUpRight, ListChecks } from "lucide-react";

/** Receives only caller-authorized records. Does not load data or infer permissions. */
export function WorkQueue({
  title,
  description,
  items,
  emptyMessage = "No pending work returned for this scope.",
}: {
  title: string;
  description: string;
  items: readonly {
    key: string;
    title: string;
    href: string;
    status?: string;
    count?: number;
  }[];
  emptyMessage?: string;
}) {
  return (
    <section
      className="sf-work-queue rounded-2xl border p-5 sm:p-6"
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <ListChecks className="mt-1 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="sf-work-queue-description mt-2 text-sm leading-6">
            {description}
          </p>
        </div>
      </div>
      {items.length ? (
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="sf-work-queue-link flex min-h-14 items-center gap-3 rounded-xl border p-4"
              >
                <span className="min-w-0 flex-1 break-words">
                  <span className="font-semibold">{item.title}</span>
                  {item.status ? (
                    <span className="sf-work-queue-description mt-1 block text-sm">
                      {item.status}
                    </span>
                  ) : null}
                </span>
                {item.count !== undefined ? (
                  <span className="shrink-0 rounded-lg border px-3 py-1 font-semibold tabular-nums">
                    <span className="sr-only">Records: </span>
                    {item.count}
                  </span>
                ) : null}
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm">{emptyMessage}</p>
      )}
    </section>
  );
}
