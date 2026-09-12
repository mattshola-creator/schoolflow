import Link from "next/link";
import { AuthCard, buttonClass, fieldClass } from "@/components/auth-card";
import { signUp } from "./actions";
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthCard
      title="Create your account"
      description="Start a secure SchoolFlow workspace for your organization."
    >
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      <form action={signUp} className="space-y-5">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input
            className={fieldClass}
            name="fullName"
            autoComplete="name"
            required
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <button className={buttonClass}>Create account</button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        Already registered?{" "}
        <Link className="text-emerald-800 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
