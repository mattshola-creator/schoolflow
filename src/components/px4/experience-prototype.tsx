"use client";

import { useMemo, useState } from "react";
import { Bell, HelpCircle, LoaderCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  brandLayers,
  effectiveBrand,
  searchRecords,
  type BrandLayer,
} from "./fixtures";
import {
  PackNavigation,
  PrototypeNotice,
  PrototypeRibbon,
  Px4Shell,
  SectionHeading,
  WorkspaceNavigation,
} from "./shared";

type ExperienceView =
  "system" | "branding" | "search" | "notifications" | "states";

export function ExperiencePrototype() {
  const [view, setView] = useState<ExperienceView>("system");
  const [layer, setLayer] = useState<BrandLayer>("school");
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(true);
  const [notificationScope, setNotificationScope] = useState<
    "school" | "organization" | "platform"
  >("school");
  const brand = effectiveBrand(layer);
  const results = useMemo(
    () =>
      query
        ? searchRecords.filter((record) =>
            record.label.toLowerCase().includes(query.toLowerCase()),
          )
        : searchRecords,
    [query],
  );
  const views: Array<[ExperienceView, string]> = [
    ["system", "Design system"],
    ["branding", "Branding Studio"],
    ["search", "Search & commands"],
    ["notifications", "Notifications & help"],
    ["states", "Application states"],
  ];
  return (
    <Px4Shell
      homeHref="/px4-experience"
      email="experience.preview@schoolflow.example.test"
      ribbon={
        <PrototypeRibbon
          primary="Platform defaults"
          secondary={
            layer === "platform"
              ? "No organization override"
              : "Cedarbridge Learning Group"
          }
          tertiary={brand.name}
        />
      }
    >
      <PrototypeNotice>
        Branding, search, notifications and application states are synthetic and
        nonpersistent. Security-critical colors and authorization remain
        authoritative.
      </PrototypeNotice>
      <PackNavigation current="experience" />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Pack E · Experience System
        </p>
        <p className="mt-1 text-sm text-slate-600">
          One coherent interaction language across SchoolFlow.
        </p>
      </div>
      <WorkspaceNavigation
        label="Experience system workspace"
        items={views}
        active={view}
        onChange={(next) => setView(next as ExperienceView)}
      />
      {view === "system" ? (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Design System v2"
            title="Calm, trustworthy and human"
            description="PX1 tokens and primitives remain the foundation for typography, spacing, surfaces, focus, motion and responsive behavior."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard title="Typography">
              <p className="text-3xl font-semibold tracking-tight">
                Clear hierarchy
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Readable line length, consistent labels and plain language.
              </p>
            </SurfaceCard>
            <SurfaceCard title="Actions">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="quiet">Quiet</Button>
              </div>
            </SurfaceCard>
            <SurfaceCard title="Semantic status">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Complete</StatusBadge>
                <StatusBadge tone="warning">Attention</StatusBadge>
                <StatusBadge>Informational</StatusBadge>
              </div>
            </SurfaceCard>
          </div>
          <SurfaceCard title="Responsive register pattern">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3">Record</th>
                    <th className="p-3">Context</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-semibold">SFA-2048</td>
                    <td className="p-3">Cedarbridge Academy</td>
                    <td className="p-3">Verified</td>
                    <td className="p-3">View receipt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
      {view === "branding" ? (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Branding Studio concept"
            title="Platform → organization → school"
            description="The most specific approved layer becomes effective without weakening contrast, warnings or access states."
          />
          <label className="block max-w-lg text-sm font-semibold">
            Preview inheritance layer
            <select
              aria-label="Brand inheritance layer"
              value={layer}
              onChange={(event) => setLayer(event.target.value as BrandLayer)}
              className="border-border mt-1 min-h-11 w-full rounded-lg border bg-white px-3"
            >
              {Object.entries(brandLayers).map(([id, item]) => (
                <option key={id} value={id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <SurfaceCard title="Effective brand">
              <div className="flex items-center gap-4">
                <span
                  className="size-14 rounded-2xl shadow-sm"
                  style={{ backgroundColor: brand.accent }}
                />
                <div>
                  <p className="font-semibold text-slate-950">{brand.name}</p>
                  <p className="text-sm text-slate-500">{brand.source}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Draft state</dt>
                  <dd className="font-semibold">Unpublished</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Contrast</dt>
                  <dd className="font-semibold text-emerald-700">
                    AA reference passed
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Effective accent</dt>
                  <dd className="font-mono">{brand.accent}</dd>
                </div>
              </dl>
            </SurfaceCard>
            <SurfaceCard title="Desktop and mobile preview">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div
                  className="h-3 w-24 rounded-full"
                  style={{ backgroundColor: brand.accent }}
                />
                <h2 className="mt-5 text-xl font-semibold">{brand.name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Neutral content surfaces preserve readability while selected
                  controls use the approved accent.
                </p>
                <button
                  type="button"
                  className="mt-4 min-h-11 rounded-lg px-4 font-semibold text-white"
                  style={{ backgroundColor: brand.accent }}
                >
                  Preview action
                </button>
              </div>
            </SurfaceCard>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Publish branding</Button>
            <Button disabled variant="secondary">
              Rollback published version
            </Button>
          </div>
          <StatePanel
            kind="disabled"
            title="Prototype publish and rollback only"
            description="No production brand settings, files or tenant configuration are written."
          />
          <StatePanel
            kind="error"
            title="Security states cannot inherit tenant colors"
            description="Errors, denials and high-risk warnings keep fixed semantic contrast and meaning."
          />
        </div>
      ) : null}
      {view === "search" ? (
        <div id="search" className="space-y-6">
          <SectionHeading
            eyebrow="Search and Command Center"
            title="Find what your scope permits"
            description="Seeing a result never grants permission to open a record or execute its command."
          />
          <label className="relative block max-w-2xl">
            <span className="sr-only">Search synthetic records</span>
            <Search
              aria-hidden="true"
              className="absolute top-3.5 left-3 size-5 text-slate-400"
            />
            <input
              aria-label="Search synthetic records"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search learners, receipts or commands"
              className="border-border min-h-12 w-full rounded-xl border bg-white pr-4 pl-11"
            />
          </label>
          <SurfaceCard title="Grouped results">
            <div className="space-y-3">
              {results.length ? (
                results.map((record) => (
                  <article
                    key={record.label}
                    className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{record.label}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {record.group} · {record.scope}
                      </p>
                    </div>
                    {record.allowed ? (
                      <Button variant="secondary">Open reference</Button>
                    ) : (
                      <StatusBadge tone="warning">
                        Restricted result
                      </StatusBadge>
                    )}
                  </article>
                ))
              ) : (
                <StatePanel
                  kind="empty"
                  title="No matching results"
                  description="Try a learner name or receipt reference within the current synthetic context."
                />
              )}
            </div>
          </SurfaceCard>
          <StatePanel
            kind="unauthorized"
            title="Commands are independently authorized"
            description="Restricted results explain their boundary; search visibility does not authorize an action."
          />
        </div>
      ) : null}
      {view === "notifications" ? (
        <div id="notifications" className="space-y-6">
          <SectionHeading
            eyebrow="Notifications and help"
            title="Relevant, scoped and actionable"
            description="Priorities reflect responsibility and school context without exposing message bodies unnecessarily."
          />
          <label className="block max-w-lg text-sm font-semibold">
            Notification scope preview
            <select
              aria-label="Notification scope preview"
              value={notificationScope}
              onChange={(event) => {
                setNotificationScope(
                  event.target.value as "school" | "organization" | "platform",
                );
                setUnread(true);
              }}
              className="border-border mt-1 min-h-11 w-full rounded-lg border bg-white px-3"
            >
              <option value="school">School-specific</option>
              <option value="organization">Organization-wide</option>
              <option value="platform">Platform</option>
            </select>
          </label>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <SurfaceCard title="Notification drawer reference">
              <article className="border-border rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <Bell aria-hidden="true" className="text-brand size-5" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {notificationScope === "school"
                          ? "Attendance follow-up"
                          : notificationScope === "organization"
                            ? "Group policy review"
                            : "Planned service maintenance"}
                      </p>
                      {unread ? (
                        <StatusBadge tone="warning">Unread</StatusBadge>
                      ) : (
                        <StatusBadge>Read</StatusBadge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {notificationScope === "school"
                        ? "Scope: Cedarbridge Academy · Teacher responsibility"
                        : notificationScope === "organization"
                          ? "Scope: Cedarbridge Learning Group · Origin: Cedarbridge Primary School"
                          : "Scope: SchoolFlow Platform · Service information"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setUnread(false)}
                >
                  Mark as read
                </Button>
              </article>
            </SurfaceCard>
            <SurfaceCard title="Contextual help">
              <HelpCircle aria-hidden="true" className="text-brand size-6" />
              <h2 className="mt-3 font-semibold">Understand this workspace</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Plain guidance, escalation paths and safe next steps without
                fabricated support contacts.
              </p>
            </SurfaceCard>
          </div>
        </div>
      ) : null}
      {view === "states" ? (
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Application states"
            title="Every state explains what happened"
            description="Permission, entitlement, feature and setup states remain distinct and accessible."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <StatePanel
                kind="empty"
                title="Nothing here yet"
                description="Create or import records when authorized."
              />
              <StatePanel
                kind="unauthorized"
                title="Permission denied"
                description="Your current role cannot access this record."
              />
              <StatePanel
                kind="unentitled"
                title="Module unavailable"
                description="This organization has not activated the module."
              />
              <StatePanel
                kind="disabled"
                title="Feature disabled"
                description="The capability is intentionally unavailable in this context."
              />
            </div>
            <div className="space-y-4">
              <StatePanel
                kind="setup"
                title="Setup incomplete"
                description="Complete the required academic context first."
              />
              <StatePanel
                kind="invalid-context"
                title="Context needs attention"
                description="Choose an authorized school, session and term."
              />
              <StatePanel
                kind="error"
                title="Recoverable connection problem"
                description="Your work is preserved. Try again when the connection returns."
              />
              <SurfaceCard title="Loading and slow connection">
                <div className="flex items-center gap-3">
                  <LoaderCircle
                    aria-hidden="true"
                    className="text-brand size-5 animate-spin motion-reduce:animate-none"
                  />
                  <p className="text-sm text-slate-600">
                    Loading authorized records…
                  </p>
                </div>
              </SurfaceCard>
            </div>
          </div>
        </div>
      ) : null}
      <section id="guidance" className="mt-6">
        <StatePanel
          kind="setup"
          title="Accessibility contract"
          description="Keyboard operation, visible focus, reduced motion, semantic labels, contrast-safe accents and contained scrolling apply across all PX4 packs."
        />
      </section>
    </Px4Shell>
  );
}
