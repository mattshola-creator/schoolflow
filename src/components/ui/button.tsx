import type { ButtonHTMLAttributes, ComponentProps } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "quiet";
type ButtonSize = "default" | "large";

type ButtonStyleOptions = {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function buttonClassName({
  className,
  size = "default",
  variant = "primary",
}: ButtonStyleOptions = {}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-brand text-white shadow-sm hover:bg-brand-strong disabled:bg-slate-300",
    secondary:
      "border border-border bg-surface text-slate-800 hover:bg-surface-subtle disabled:text-slate-400",
    quiet: "text-brand hover:bg-brand-soft disabled:text-slate-400",
  };
  const sizes: Record<ButtonSize, string> = {
    default: "min-h-11 px-4 py-2.5 text-sm",
    large: "min-h-12 px-5 py-3 text-base",
  };

  return [
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions;

export function Button({
  className,
  size,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ className, size, variant })}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleOptions;

export function ButtonLink({
  className,
  size,
  variant,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ className, size, variant })}
      {...props}
    />
  );
}
