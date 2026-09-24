import type { HTMLAttributes } from "react";

type StatusTone = "neutral" | "success" | "warning";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function StatusBadge({
  className,
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  const tones: Record<StatusTone, string> = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-brand-soft text-brand-strong",
    warning: "bg-amber-50 text-amber-800",
  };

  return (
    <span
      className={[
        "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
