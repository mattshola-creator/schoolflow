import { AuthCard, buttonClass, fieldClass } from "@/components/auth-card";
import { updatePassword } from "./actions";
export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthCard
      title="Choose a new password"
      description="Use at least 10 characters."
    >
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form action={updatePassword} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">
          New password
          <input
            className={fieldClass}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Confirm password
          <input
            className={fieldClass}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </label>
        <button className={buttonClass}>Update password</button>
      </form>
    </AuthCard>
  );
}
