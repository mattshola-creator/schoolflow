"use client";

import { StatePanel } from "@/components/ui/state-panel";

export default function AdmissionsError({ reset }: { reset: () => void }) {
  return (
    <div className="py-10">
      <StatePanel
        kind="error"
        title="Admissions could not be loaded"
        description="Try again. If the problem continues, confirm that the active school is authorized and Admissions is available."
        action={
          <button
            type="button"
            onClick={reset}
            className="bg-brand focus-visible:outline-focus-ring min-h-11 rounded-lg px-4 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Try again
          </button>
        }
      />
    </div>
  );
}
