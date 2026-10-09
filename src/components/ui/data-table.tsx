import type { ReactNode } from "react";

export function DataTable({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-surface-subtle text-slate-600">{children}</thead>;
}

export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-bold tracking-wide uppercase">
      {children}
    </th>
  );
}

export function TableCell({ children }: { children: ReactNode }) {
  return (
    <td className="border-border border-t px-4 py-3 text-slate-700">
      {children}
    </td>
  );
}
