"use client";

import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";

export default function TeachingError({ reset }: { reset: () => void }) {
  return (
    <StatePanel
      kind="error"
      title="Teaching workspace could not be loaded"
      description="Your access has not changed. Confirm the active school context, then try again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
