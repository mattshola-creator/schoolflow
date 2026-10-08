import type { InputHTMLAttributes, ReactNode } from "react";

export const inputClassName =
  "border-border-strong bg-surface min-h-11 w-full rounded-lg border px-3.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-focus-ring focus:outline-none focus:ring-3 focus:ring-brand-soft disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

type FormFieldProps = {
  children: ReactNode;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function FormField({
  children,
  description,
  error,
  htmlFor,
  label,
  required,
}: FormFieldProps) {
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="text-status-danger"> *</span> : null}
      </label>
      {description ? (
        <p id={descriptionId} className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-status-danger mt-1.5 text-xs font-medium"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[inputClassName, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
