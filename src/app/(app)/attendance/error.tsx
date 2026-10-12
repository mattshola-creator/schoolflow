"use client";

import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";

export default function AttendanceError({ reset }: { reset: () => void }) {
  return (
    <StatePanel
      kind="error"
      title="Attendance could not be loaded"
      description="Your access has not changed. Confirm the active school and date, then try the register again."
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
