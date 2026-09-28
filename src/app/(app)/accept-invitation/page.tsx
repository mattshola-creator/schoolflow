import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { acceptInvitation } from "./actions";
export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <main className="py-10 sm:py-16">
      <section className="max-w-xl min-w-0 rounded-xl border bg-white p-5 sm:p-7">
        <PageHeader
          eyebrow="Secure membership"
          title="Accept invitation"
          description="Membership and role access are granted only after the invitation is validated for your signed-in email."
        />
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm break-words text-red-800"
          >
            {error}
          </p>
        )}
        {token ? (
          <form action={acceptInvitation} className="mt-7">
            <input type="hidden" name="token" value={token} />
            <Button className="w-full" type="submit" size="large">
              Accept invitation
            </Button>
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
