"use client";

import { StatePanel } from "@/components/ui/state-panel";
import { Button } from "@/components/ui/button";

export default function AdministrationError({ reset }: { reset: () => void }) {
  return (
    <StatePanel
      kind="error"
      title="Administration could not be loaded"
      description="Your access has not changed. Try loading the authorized context again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
