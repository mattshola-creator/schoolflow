import { AuthCard, buttonClass, fieldClass } from "@/components/auth-card";
import { requestReset } from "./actions";
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthCard
      title="Reset your password"
      description="We will send a secure recovery link if the account exists."
    >
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form action={requestReset} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className={fieldClass}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <button className={buttonClass}>Send recovery link</button>
      </form>
    </AuthCard>
  );
}
