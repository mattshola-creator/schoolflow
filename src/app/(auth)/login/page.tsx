import Link from "next/link";
import { AuthCard, buttonClass, fieldClass } from "@/components/auth-card";
import { loginWorkspaces } from "@/features/workspaces/entry";
import { login } from "./actions";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in with your SchoolFlow account."
    >
      {params.error && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {params.error}
        </p>
      )}
      {params.message && (
        <p className="mb-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          {params.message}
        </p>
      )}
      <form action={login} className="space-y-5">
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
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className={fieldClass}
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Open workspace
          <select name="workspace" className={fieldClass} defaultValue="auto">
            {loginWorkspaces.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-slate-600">
          One account, your granted access. Your school and permissions are
          checked after sign-in. Platform administration requires separate
          platform authority.
        </p>
        <button className={buttonClass}>Sign in securely</button>
      </form>
      <div className="mt-6 flex justify-between text-sm">
        <Link
          className="text-emerald-800 hover:underline"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
        <Link className="text-emerald-800 hover:underline" href="/sign-up">
          Create account
        </Link>
      </div>
    </AuthCard>
  );
}
