"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <section
      className="border-border bg-surface my-6 rounded-2xl border p-6"
      role="alert"
    >
      <h1 className="text-xl font-semibold text-slate-950">
        The operational overview could not be loaded
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Your context and access have not changed. Try loading this view again.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        Try again
      </Button>
    </section>
  );
}
