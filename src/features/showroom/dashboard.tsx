"use client";

import { useRef, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  resolveShowroomTheme,
  showroomRoles,
  type ShowroomRole,
  type ShowroomTheme,
} from "./catalog";
import {
  CompositionChart,
  ProgressCard,
  Sparkline,
  StageChart,
  TrendChart,
} from "./charts";
import {
  admissionsStages,
  attendanceTrend,
  demoMetrics,
  demoPeriod,
  demoQueue,
  personalTrend,
  receiptMethods,
  receiptsTrend,
  teacherTrend,
} from "./demo-data";

export function themeStyle(theme: ShowroomTheme): CSSProperties {
  return {
    "--sf-canvas": theme.canvas,
    "--sf-surface": theme.surface,
    "--sf-ink": theme.ink,
    "--sf-muted": theme.muted,
    "--sf-nav": theme.nav,
    "--sf-primary": theme.primary,
    "--sf-on-primary": theme.onPrimary,
    "--sf-accent": theme.accent,
    "--sf-border": theme.border,
    "--sf-series-1": theme.series[0],
    "--sf-series-2": theme.series[1],
    "--sf-series-3": theme.series[2],
    "--sf-radius": `${theme.radius}px`,
  } as CSSProperties;
}

export function DemoDashboard({
  themeId,
  roleId,
}: {
  themeId: string;
  roleId: ShowroomRole;
}) {
  const theme = resolveShowroomTheme(themeId);
  const role =
    showroomRoles.find((item) => item.id === roleId) ?? showroomRoles[0];
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const note = useRef<HTMLDialogElement>(null);
  const metrics = demoMetrics(role.id);
  const family = role.id === "guardian" || role.id === "student";
  const trend = family
    ? personalTrend
    : role.id === "teacher"
      ? teacherTrend
      : attendanceTrend;
  function navigation() {
    return (
      <nav aria-label="Demonstration workspace navigation">
        {role.navigation.map((label, index) => (
          <button
            key={label}
            type="button"
            className={index === 0 ? "sf-nav-active" : ""}
            onClick={() => {
              drawer.current?.close();
              note.current?.showModal();
            }}
          >
            <LayoutDashboard size={16} aria-hidden="true" />
            {label}
            {index === 0 && <ArrowUpRight size={14} aria-hidden="true" />}
          </button>
        ))}
      </nav>
    );
  }
  return (
    <div
      className="sf-dashboard"
      data-layout={theme.layout}
      data-texture={theme.texture}
      data-theme={theme.id}
      style={themeStyle(theme)}
    >
      <aside className="sf-workspace-nav">
        <div className="sf-workspace-brand">
          <span>S</span>SchoolFlow
        </div>
        <p className="sf-workspace-role">{role.name}</p>
        {navigation()}
        <div className="sf-workspace-bottom">
          <ShieldCheck size={17} aria-hidden="true" />
          <span>
            Fictional workspace
            <br />
            No customer records
          </span>
        </div>
      </aside>
      <div className="sf-workspace-body">
        <header className="sf-context">
          <button
            ref={trigger}
            className="sf-drawer-trigger"
            type="button"
            aria-label="Open demonstration navigation"
            aria-haspopup="dialog"
            onClick={() => drawer.current?.showModal()}
          >
            <Menu size={20} />
          </button>
          <div>
            <strong>
              {role.id === "platform"
                ? "Platform planning · Concept"
                : "Riverside Academy · Demo school"}
            </strong>
            <small>{role.scope} · 2026/27 · First Term</small>
          </div>
          <span className="sf-context-period">
            October 2026 <ChevronDown size={14} aria-hidden="true" />
          </span>
          <span
            className="sf-demo-account"
            aria-label="Fictional demonstration account"
          >
            DS
          </span>
        </header>
        <main className="sf-workspace-main">
          <section className="sf-welcome">
            <div>
              <p className="sf-kicker">
                {role.name} / {theme.name}
              </p>
              <h1>{role.title}</h1>
              <p>
                {role.id === "platform"
                  ? "Visual concept only. No privileged platform data or authority is connected."
                  : "The right information. The next clear action. One beautifully connected school day."}
              </p>
            </div>
            <span className="sf-welcome-icon" aria-hidden="true">
              <Bell size={22} />
            </span>
          </section>
          <p className="sf-fiction-label">
            <span /> FICTIONAL SHOWROOM DATA · no live school records
          </p>
          <section
            className="sf-metric-grid"
            aria-label="Fictional dashboard metrics"
          >
            {metrics.map((metric) => (
              <article className="sf-metric-card" key={metric.label}>
                <div className="sf-metric-top">
                  <span>{metric.label}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </div>
                <strong className="sf-metric-value">{metric.value}</strong>
                <div className="sf-metric-bottom">
                  <p>{metric.definition}</p>
                  <Sparkline
                    values={metric.trend}
                    label={`${metric.label}, four illustrative observations`}
                  />
                </div>
              </article>
            ))}
          </section>
          <div className="sf-dashboard-board">
            <div className="sf-dashboard-insight">
              {role.id === "platform" ? (
                <section className="sf-platform-placeholder">
                  <ShieldCheck size={38} />
                  <h2>A separate platform milestone</h2>
                  <p>
                    Registration, subscription and security analytics require
                    their own authorized services. Appearance never grants
                    platform access.
                  </p>
                  <span>
                    Planning preview · values intentionally unavailable
                  </span>
                </section>
              ) : role.id === "admissions" ? (
                <StageChart
                  title="Applications, at a glance"
                  description="84 applications in disjoint current statuses. This is a snapshot, not a cohort conversion funnel."
                  period="21 October 2026 · fictional snapshot"
                  points={admissionsStages}
                />
              ) : role.id === "finance" ? (
                <TrendChart
                  title="Verified school receipts"
                  description="Weekly verified receipts, in NGN. Integer minor-unit inputs; no unverified amounts or allocations are counted."
                  period={demoPeriod}
                  points={receiptsTrend}
                  unit="NGN"
                />
              ) : (
                <TrendChart
                  title={
                    family
                      ? "Your recorded attendance"
                      : role.id === "teacher"
                        ? "Assigned-class attendance"
                        : "Attendance, with context"
                  }
                  description={
                    family
                      ? "Present plus late / personal recorded marks. Four weeks, each with 20 recorded entries."
                      : role.id === "teacher"
                        ? "Present plus late / assigned-class recorded marks. Each week has 50 entries."
                        : "Present plus late / recorded marks. Each illustrative week has 1,000 recorded entries; this is not enrollment coverage."
                  }
                  period={demoPeriod}
                  points={trend}
                />
              )}
            </div>
            <section className="sf-work-queue">
              <div className="sf-queue-heading">
                <p className="sf-kicker">The next clear action</p>
                <span>{demoQueue(role.id).length} items</span>
              </div>
              <h2>{family ? "Your school updates" : "Needs your attention"}</h2>
              {demoQueue(role.id).map((item, index) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => note.current?.showModal()}
                >
                  <span className="sf-queue-index">{index + 1}</span>
                  <span>{item}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              ))}
              <p>
                Demonstration destinations only. Live access depends on school
                context and individual permissions.
              </p>
            </section>
            <div className="sf-dashboard-detail">
              {role.id === "finance" ? (
                <CompositionChart
                  title="Where verified receipts came from"
                  description="Cash and bank transfer are disjoint payment methods. Total ₦4,820,000.00. SaaS subscription billing is separate."
                  period={demoPeriod}
                  points={receiptMethods}
                />
              ) : role.id === "platform" ? (
                <section className="sf-platform-note">
                  <h2>Identity before insight.</h2>
                  <p>
                    No platform principals, grants, subscription controls or
                    customer data are created by this showroom.
                  </p>
                </section>
              ) : (
                <ProgressCard
                  title={family ? "Recorded-mark rate" : "Latest demo week"}
                  description="A defined numerator and denominator. Missing records are not treated as absences."
                  period={family ? demoPeriod : "Week 4 · fictional window"}
                  numerator={family ? 76 : role.id === "teacher" ? 48 : 948}
                  denominator={family ? 80 : role.id === "teacher" ? 50 : 1000}
                  gauge={
                    theme.layout === "analytic" || theme.texture === "luxe"
                  }
                />
              )}
            </div>
          </div>
          <p className="sf-workspace-footnote">
            {role.id === "owner"
              ? "Selected school only. Live multi-school metrics require separate per-school authorization and comparable academic periods."
              : family
                ? "Only linked or personal records would appear in a real authorized session. No peer rankings or unpublished results."
                : "This layout illustrates existing school workflows. It does not modify permissions, scores, payments or approvals."}
          </p>
        </main>
      </div>
      <dialog
        className="sf-nav-dialog"
        ref={drawer}
        onClose={() => trigger.current?.focus()}
        aria-label="Demonstration mobile navigation"
      >
        <div>
          <strong>SchoolFlow</strong>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => drawer.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {navigation()}
      </dialog>
      <dialog
        className="sf-destination-dialog"
        ref={note}
        aria-label="Demonstration destination"
      >
        <span className="sf-kicker">Showroom interaction</span>
        <h2>Your existing workflow would open here.</h2>
        <p>
          This is a fictional design preview. In SchoolFlow, the destination
          independently checks the signed-in identity, school, permissions and
          feature availability.
        </p>
        <button type="button" onClick={() => note.current?.close()}>
          Return to preview
        </button>
      </dialog>
    </div>
  );
}
