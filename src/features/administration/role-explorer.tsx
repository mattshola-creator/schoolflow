"use client";
import { useState } from "react";
import { DemoDashboard } from "@/features/showroom/dashboard";
import { showroomRoles, type ShowroomRole } from "@/features/showroom/catalog";
export function RoleExplorer() {
  const [role, setRole] = useState<ShowroomRole>("owner");
  return (
    <section className="min-w-0 space-y-5">
      <h1 className="text-2xl font-bold">QA role experience explorer</h1>
      <p role="note">
        Fictional design data only. Selecting a role does not change your
        identity, permissions or school. Live workflow tests require a
        separately authorized account. Platform Owner is a planning concept.
      </p>
      <label className="block font-semibold">
        Preview audience
        <select
          className="mt-2 block min-h-11 w-full max-w-md rounded-lg border bg-white p-2 text-slate-950"
          value={role}
          onChange={(e) => {
            if (showroomRoles.some((r) => r.id === e.target.value))
              setRole(e.target.value as ShowroomRole);
          }}
        >
          {showroomRoles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <div className="min-w-0 overflow-x-auto">
        <DemoDashboard themeId="emerald" roleId={role} />
      </div>
    </section>
  );
}
