"use client";

import { useSearchParams } from "next/navigation";
import { DemoDashboard } from "./dashboard";
import { showroomRoles } from "./catalog";

export function DashboardPreview() {
  const params = useSearchParams();
  const role =
    showroomRoles.find((item) => item.id === params.get("role")) ??
    showroomRoles[0];
  return (
    <DemoDashboard
      themeId={params.get("theme") ?? "emerald"}
      roleId={role.id}
    />
  );
}
