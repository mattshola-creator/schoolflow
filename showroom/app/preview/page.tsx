import { Suspense } from "react";
import { DashboardPreview } from "../../../src/features/showroom/preview";

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <p className="sf-preview-loading">
          Preparing your fictional dashboard…
        </p>
      }
    >
      <DashboardPreview />
    </Suspense>
  );
}
