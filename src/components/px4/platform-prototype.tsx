"use client";

import { useMemo, useState } from "react";
import { Activity, KeyRound, RadioTower, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { platformPersonas, tenants, type PlatformPersona } from "./fixtures";
import {
  MetricCard,
  PackNavigation,
  PrototypeNotice,
  PrototypeRibbon,
  Px4Shell,
  SectionHeading,
} from "./shared";

type PlatformView =
  "dashboard" | "organizations" | "tenant" | "catalog" | "rollout" | "audit";
const lifecycleHelp = {
  Active: "Normal authorized operation.",
  Restricted: "Selected operations limited while records remain preserved.",
  Suspended: "Access paused non-destructively; no data deletion.",
  Reactivated: "Access restored after a reviewed lifecycle event.",
} as const;

export function PlatformPrototype() {
  const [persona, setPersona] = useState<PlatformPersona>("super");
  const [view, setView] = useState<PlatformView>("dashboard");
  const [tenantId, setTenantId] = useState("cedarbridge");
  const [query, setQuery] = useState("");
  const role = platformPersonas[persona];
  const tenant = tenants.find((item) => item.id === tenantId) ?? tenants[0];
  const visibleTenants = useMemo(
    () =>
      tenants.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const supportOnly = persona === "support";
  const availableViews: Array<[PlatformView, string]> = [
    ["dashboard", "Dashboard"],
    ["organizations", "Organizations"],
    ["tenant", "Tenant 360"],
    ...(supportOnly
      ? []
      : ([
          ["catalog", "Plans & modules"],
          ["rollout", "Feature rollout"],
        ] as Array<[PlatformView, string]>)),
    ...(persona === "super"
      ? ([["audit", "Platform audit"]] as Array<[PlatformView, string]>)
      : []),
  ];

  return (
    <Px4Shell
      homeHref="/px4-platform"
      email={`${persona}.preview@platform.example.test`}
      ribbon={
        <PrototypeRibbon
          primary="SchoolFlow Platform"
          secondary={role.label}
          tertiary="Fictional tenant estate"
        />
      }
    >
      <PrototypeNotice>
        All tenants and operator personas are fictional. High-impact controls
        are read-only and disabled; no production privilege is granted.
      </PrototypeNotice>
      <PackNavigation current="platform" />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Pack D · SaaS Platform
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Organization Owner is not a Platform Operator.
          </p>
        </div>
        <label className="text-sm font-semibold text-slate-700">
          Synthetic operator persona
          <select
            aria-label="Platform operator persona"
            value={persona}
            onChange={(event) => {
              setPersona(event.target.value as PlatformPersona);
              setView("dashboard");
            }}
            className="border-border mt-1 block min-h-11 w-full rounded-lg border bg-white px-3 font-medium"
          >
            <option value="super">Platform Super Admin</option>
            <option value="operations">Platform Operations Admin</option>
            <option value="support">Platform Support Viewer</option>
          </select>
        </label>
      </div>
      <nav
        aria-label="Platform workspace"
        className="my-6 flex max-w-full gap-2 overflow-x-auto pb-2"
      >
        {availableViews.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`focus-visible:outline-focus-ring min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 ${view === id ? "bg-brand text-white" : "border-border border bg-white text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {view === "dashboard" ? (
        <div className="space-y-6">
          <SectionHeading
            eyebrow={role.label}
            title="Platform operations overview"
            description={role.summary}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Organizations"
              value="4"
              detail="10 fictional schools"
            />
            <MetricCard
              label="Lifecycle attention"
              value="2"
              detail="One restricted · one suspended"
              warning
            />
            <MetricCard
              label="Module adoption"
              value="8.5"
              detail="Average enabled modules"
            />
            <MetricCard
              label="Support attention"
              value={supportOnly ? "6" : "3"}
              detail={
                supportOnly
                  ? "Authorized read-only cases"
                  : "Escalated platform cases"
              }
              warning
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
            <SurfaceCard eyebrow="Role priorities" title={role.label}>
              <div className="space-y-3">
                {role.priorities.map((priority, index) => (
                  <article
                    key={priority}
                    className="border-border flex items-center gap-3 rounded-xl border p-4"
                  >
                    <StatusBadge tone={index === 0 ? "warning" : "neutral"}>
                      {index === 0 ? "Priority" : "Queue"}
                    </StatusBadge>
                    <p className="font-semibold">{priority}</p>
                  </article>
                ))}
              </div>
            </SurfaceCard>
            <SurfaceCard
              eyebrow="Authority boundary"
              title="Visible responsibility"
            >
              <ul className="space-y-2 text-sm text-slate-600">
                {role.navigation.map((item) => (
                  <li key={item} className="flex gap-2">
                    <ShieldCheck
                      aria-hidden="true"
                      className="text-brand size-4 shrink-0"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {supportOnly ? (
                <p className="mt-4 text-sm font-semibold text-amber-800">
                  Read-only: no lifecycle, entitlement or rollout controls.
                </p>
              ) : null}
            </SurfaceCard>
          </div>
        </div>
      ) : null}
      {view === "organizations" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Organization directory"
            title="Fictional tenants"
            description="Search and lifecycle filters never query real Supabase tenant records."
          />
          <label className="block max-w-xl text-sm font-semibold">
            Search organizations
            <input
              aria-label="Search fictional organizations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by organization name"
              className="border-border mt-1 min-h-11 w-full rounded-lg border px-3"
            />
          </label>
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleTenants.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setTenantId(item.id);
                  setView("tenant");
                }}
                className="border-border focus-visible:outline-focus-ring min-h-28 rounded-2xl border bg-white p-4 text-left shadow-sm focus-visible:outline-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.schools} schools · {item.plan}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      item.status === "Active" || item.status === "Reactivated"
                        ? "success"
                        : "warning"
                    }
                  >
                    {item.status}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {lifecycleHelp[item.status]}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {view === "tenant" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Tenant 360"
            title={tenant.name}
            description="Subscription, modules, lifecycle, support, audit and safe diagnostics in one fictional reference view."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Schools"
              value={`${tenant.schools}`}
              detail="Fictional directory"
            />
            <MetricCard
              label="Enabled modules"
              value={`${tenant.modules}`}
              detail={tenant.plan}
            />
            <MetricCard
              label="Lifecycle"
              value={tenant.status}
              detail={lifecycleHelp[tenant.status]}
              warning={
                tenant.status === "Restricted" || tenant.status === "Suspended"
              }
            />
            <MetricCard
              label="Rollout"
              value={tenant.rollout}
              detail="Impact preview only"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard title="Safe diagnostics">
              <Activity aria-hidden="true" className="text-brand size-5" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Health indicators and support history contain no credentials,
                tokens or privileged logs.
              </p>
            </SurfaceCard>
            <SurfaceCard title="Entitlements">
              <KeyRound aria-hidden="true" className="text-brand size-5" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Read-only catalog summary. Save and apply remain disabled.
              </p>
            </SurfaceCard>
            <SurfaceCard title="Audit timeline">
              <RadioTower aria-hidden="true" className="text-brand size-5" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Actor, target, reason, timestamp and resulting state are
                required.
              </p>
            </SurfaceCard>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Restrict tenant</Button>
            <Button disabled variant="secondary">
              Reactivate tenant
            </Button>
            <Button disabled variant="secondary">
              Apply entitlement changes
            </Button>
          </div>
          <StatePanel
            kind="disabled"
            title="Prototype only — action disabled"
            description="No production tenant status, subscription, entitlement or data will change."
          />
        </div>
      ) : null}
      {view === "catalog" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Plans and modules"
            title="Catalog and entitlement concepts"
            description="Reference plan names are non-binding and contain no approved commercial prices."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Core reference",
              "Growth reference",
              "Multi-school reference",
            ].map((plan, index) => (
              <SurfaceCard key={plan} title={plan}>
                <p className="text-sm leading-6 text-slate-600">
                  {5 + index * 3} module concepts · organization and school
                  scope rules
                </p>
                <Button disabled className="mt-4 w-full">
                  Apply plan
                </Button>
              </SurfaceCard>
            ))}
          </div>
          <StatePanel
            kind="disabled"
            title="Entitlement editor is read-only"
            description="The prototype may explain changes and impact but cannot save, apply or publish them."
          />
        </div>
      ) : null}
      {view === "rollout" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Controlled rollout"
            title="Preview eligible tenants and impact"
            description="Partial rollout is tenant-scoped and every mutation remains disabled."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <SurfaceCard title="Reporting workspace">
              <p className="text-sm text-slate-600">
                Eligible: 3 tenants · selected: Cedarbridge only
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="bg-brand h-full w-1/3" />
              </div>
            </SurfaceCard>
            <SurfaceCard title="Impact preview">
              <ul className="space-y-2 text-sm text-slate-600">
                <li>1 organization affected</li>
                <li>2 schools within selected tenant</li>
                <li>Audit reason required</li>
                <li>Rollback plan required</li>
              </ul>
            </SurfaceCard>
          </div>
          <Button disabled>Start feature rollout</Button>
          <StatePanel
            kind="disabled"
            title="Prototype only — action disabled"
            description="Keyboard, pointer and alternate interactions cannot activate rollout."
          />
        </div>
      ) : null}
      {view === "audit" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Privileged traceability"
            title="Platform audit"
            description="Super Admin reference visibility with fictional actors and targets."
          />
          <SurfaceCard title="Recent privileged events">
            <div className="space-y-3">
              {[
                [
                  "Lifecycle reviewed",
                  "Brightpath Schools",
                  "Risk review completed",
                ],
                [
                  "Rollout previewed",
                  "Cedarbridge Learning Group",
                  "No change applied",
                ],
                [
                  "Support escalated",
                  "Northstar College",
                  "Credential-free diagnostics",
                ],
              ].map(([action, target, reason]) => (
                <article
                  key={action}
                  className="border-border rounded-xl border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{action}</p>
                    <StatusBadge>Recorded</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {target} · {reason}
                  </p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </div>
      ) : null}
      <section id="guidance" className="mt-6">
        <StatePanel
          kind="unauthorized"
          title="Organization Owner denied"
          description="School-facing ownership never implies Platform Console access. Synthetic persona selection does not alter production authorization."
        />
      </section>
      <div id="notifications" className="sr-only">
        Platform notification reference region
      </div>
    </Px4Shell>
  );
}
