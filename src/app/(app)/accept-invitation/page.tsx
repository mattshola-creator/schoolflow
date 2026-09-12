import { buttonClass } from "@/components/auth-card";
import { acceptInvitation } from "./actions";
export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <section className="rounded-xl border bg-white p-7">
        <h1 className="text-2xl font-semibold">Accept invitation</h1>
        <p className="mt-2 text-slate-600">
          Membership and role access are granted only after the invitation is
          validated for your signed-in email.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        {token ? (
          <form action={acceptInvitation} className="mt-7">
            <input type="hidden" name="token" value={token} />
            <button className={buttonClass}>Accept invitation</button>
          </form>
        ) : (
          <p role="alert" className="mt-5 text-sm text-red-700">
            The invitation token is missing.
          </p>
        )}
      </section>
    </main>
  );
}
