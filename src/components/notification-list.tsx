export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const unreadCount = notifications.filter((item) => !item.read_at).length;
  return (
    <section aria-labelledby="notifications-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="notifications-heading" className="text-xl font-semibold">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {unreadCount === 0
              ? "No unread notifications"
              : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
      {notifications.length === 0 ? (
        <p className="mt-3 rounded-xl border bg-white p-6 text-sm text-slate-600">
          You are up to date. New school notifications will appear here.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`min-w-0 rounded-xl border bg-white p-4 ${notification.read_at ? "" : "border-emerald-300"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 font-medium break-words">
                  {notification.title}
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${notification.read_at ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-900"}`}
                >
                  {notification.read_at ? "Read" : "Unread"}
                </span>
              </div>
              {notification.body ? (
                <p className="mt-2 text-sm break-words text-slate-600">
                  {notification.body}
                </p>
              ) : null}
              <time
                className="mt-3 block text-xs text-slate-500"
                dateTime={notification.created_at}
              >
                {new Date(notification.created_at).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
