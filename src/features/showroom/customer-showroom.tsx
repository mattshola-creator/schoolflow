"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CirclePlay,
  Layers3,
  LockKeyhole,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  demoThemeAvailable,
  resolveShowroomTheme,
  showroomRoles,
  showroomThemes,
  type ShowroomPlan,
  type ThemeTier,
} from "./catalog";
import {
  AttendanceHeatmap,
  ComparisonBars,
  CompositionChart,
  ProgressCard,
  SchoolComparison,
  StageChart,
  TrendChart,
} from "./charts";
import type { DataState } from "./chart-model";
import {
  admissionsStages,
  assessmentStages,
  attendanceDays,
  attendanceTrend,
  demoPeriod,
  demoSchools,
  enrollmentComparison,
  receiptMethods,
} from "./demo-data";
import { themeStyle } from "./dashboard";

const tierName: Record<ThemeTier, string> = {
  core: "Core design",
  composition: "Premium composition",
  collection: "Decorative collection",
};
const chartChoices = [
  "Trends & area",
  "Comparison bars",
  "Finance mix",
  "Progress & gauge",
  "Attendance calendar",
  "Admissions stages",
  "Assessment workflow",
  "Multi-school",
] as const;

export function MiniDashboard({ id }: { id: string }) {
  const theme = resolveShowroomTheme(id);
  return (
    <div
      className="sf-mini"
      data-layout={theme.layout}
      data-texture={theme.texture}
      style={themeStyle(theme)}
      aria-hidden="true"
    >
      <div className="sf-mini-nav">
        <span>S</span>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="sf-mini-body">
        <div className="sf-mini-header">
          <span />
          <b />
        </div>
        <div className="sf-mini-kpis">
          <i />
          <i />
          <i />
        </div>
        <div className="sf-mini-board">
          <div className="sf-mini-graph">
            <svg viewBox="0 0 160 65">
              <path
                d="M0 60H160M0 30H160"
                stroke="var(--sf-border)"
                strokeWidth=".5"
              />
              <path
                d="m0 50 25-14 24 6 30-26 25 9 28-18 28 5v53H0Z"
                fill="var(--sf-primary)"
                opacity=".12"
              />
              <path
                d="m0 50 25-14 24 6 30-26 25 9 28-18 28 5"
                fill="none"
                stroke="var(--sf-primary)"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <div className="sf-mini-list">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerShowroom() {
  const [selected, setSelected] = useState("emerald");
  const [filter, setFilter] = useState<"all" | ThemeTier>("all");
  const [role, setRole] = useState("owner");
  const [width, setWidth] = useState("fit");
  const [plan, setPlan] = useState<ShowroomPlan>("starter");
  const [draft, setDraft] = useState<string | null>(null);
  const [versions, setVersions] = useState(["emerald"]);
  const [status, setStatus] = useState(
    "Your demo starts with Emerald Executive. Nothing is saved to a school.",
  );
  const [chart, setChart] = useState<(typeof chartChoices)[number]>(
    chartChoices[0],
  );
  const [area, setArea] = useState(true);
  const [stacked, setStacked] = useState(false);
  const [dataState, setDataState] = useState<DataState>("ready");
  const about = useRef<HTMLDialogElement>(null);
  const theme = resolveShowroomTheme(selected);
  const chosenRole =
    showroomRoles.find((item) => item.id === role) ?? showroomRoles[0];
  const eligible = demoThemeAvailable(theme.tier, plan);
  const cards = showroomThemes.filter(
    (item) => filter === "all" || item.tier === filter,
  );

  function pickTheme(id: string) {
    setSelected(id);
    setStatus(
      `${resolveShowroomTheme(id).name} preview opened. Choose a demo draft when you are ready.`,
    );
  }
  function publish() {
    if (!draft || !demoThemeAvailable(resolveShowroomTheme(draft).tier, plan))
      return;
    setVersions((current) => [...current, draft]);
    setDraft(null);
    setStatus(
      `Demo version ${versions.length + 1}: ${resolveShowroomTheme(draft).name}. This changed only the demonstration history.`,
    );
  }
  function restore(id: string) {
    if (!demoThemeAvailable(resolveShowroomTheme(id).tier, plan)) {
      setStatus(
        "That demo version is not available under the selected plan. Its preview remains available.",
      );
      return;
    }
    setVersions((current) => [...current, id]);
    setSelected(id);
    setDraft(null);
    setStatus(
      `Restored ${resolveShowroomTheme(id).name} as a new demo version. Earlier versions are retained.`,
    );
  }
  function changePlan(next: ShowroomPlan) {
    setPlan(next);
    if (draft && !demoThemeAvailable(resolveShowroomTheme(draft).tier, next))
      setDraft(null);
    setStatus(
      "Plan simulation updated. This does not change a real subscription or price.",
    );
  }

  return (
    <div className="sf-showroom">
      <a className="sf-skip-link" href="#main-content">
        Skip to showroom
      </a>
      <header className="sf-site-header">
        <a className="sf-brand" href="#">
          <span>S</span>SchoolFlow<span className="sf-brand-divider">/</span>
          <small>Experience Studio</small>
        </a>
        <nav aria-label="Showroom navigation">
          <a href="#themes">The gallery</a>
          <a href="#insights">Intelligent insights</a>
          <a href="#studio">Your school’s look</a>
        </nav>
        <a
          className="sf-header-cta"
          href="https://schoolflow-app.netlify.app/"
          target="_blank"
          rel="noreferrer"
        >
          Explore SchoolFlow <ArrowUpRight size={16} />
        </a>
      </header>
      <main id="main-content">
        <section className="sf-site-hero">
          <div className="sf-hero-copy">
            <p className="sf-eyebrow">
              <span /> Thoughtful technology. Distinctly your school.
            </p>
            <h1>
              A school day,
              <br />
              <em>beautifully</em>
              <br />
              connected.
            </h1>
            <p className="sf-hero-description">
              Bring your people, operations and insights into focus. Discover a
              SchoolFlow workspace that looks as considered as the school you’re
              building.
            </p>
            <div className="sf-hero-actions">
              <a href="#themes" className="sf-button sf-button-gold">
                Find your SchoolFlow <ArrowRight size={18} />
              </a>
              <a href="#workspace" className="sf-hero-play">
                <CirclePlay size={24} /> Take a closer look
              </a>
            </div>
            <p className="sf-hero-assurance">
              <ShieldCheck size={16} /> One application. School context.
              Individual permissions.
            </p>
          </div>
          <div className="sf-hero-visual">
            <div className="sf-hero-orbit" aria-hidden="true" />
            <div className="sf-hero-sample">
              <div className="sf-hero-sample-top">
                <div>
                  <span className="sf-tiny-label">A fictional school day</span>
                  <h2>Clarity looks good on you.</h2>
                </div>
                <span className="sf-live-badge">Demo overview</span>
              </div>
              <div className="sf-hero-sample-metrics">
                <div>
                  <small>Active enrollments</small>
                  <strong>1,248</strong>
                  <span>Demo school · session</span>
                </div>
                <div>
                  <small>Recorded attendance</small>
                  <strong>
                    94.8<span>%</span>
                  </strong>
                  <span>948 / 1,000 demo marks</span>
                </div>
              </div>
              <svg
                className="sf-hero-chart"
                viewBox="0 0 470 165"
                role="img"
                aria-label="Decorative illustration of a fictional attendance trend; real chart demonstrations appear below."
              >
                <defs>
                  <linearGradient id="sf-hero-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#16A36B" stopOpacity=".3" />
                    <stop offset="1" stopColor="#16A36B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 135H460M10 85H460M10 35H460"
                  stroke="#d0ded6"
                  strokeDasharray="3 6"
                />
                <path
                  d="M10 126C55 126 58 83 105 89s60 22 100-15 55 2 98-31 81 4 157-25v140H10Z"
                  fill="url(#sf-hero-fill)"
                />
                <path
                  d="M10 126C55 126 58 83 105 89s60 22 100-15 55 2 98-31 81 4 157-25"
                  fill="none"
                  stroke="#087C57"
                  strokeWidth="4"
                />
                <circle
                  cx="303"
                  cy="43"
                  r="6"
                  fill="#fff"
                  stroke="#087C57"
                  strokeWidth="3"
                />
              </svg>
              <div className="sf-hero-sample-bottom">
                <span>12 curated directions</span>
                <div>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <span>One trusted foundation</span>
              </div>
            </div>
            <div className="sf-floating-note">
              <span>
                <CheckCircle2 size={18} />
              </span>
              <div>
                <strong>The next clear action.</strong>
                <small>From insight to everyday schoolwork.</small>
              </div>
            </div>
          </div>
        </section>
        <section className="sf-proof-strip" aria-label="Showroom highlights">
          <p>
            <Layers3 size={20} />
            <strong>12</strong> curated designs
          </p>
          <p>
            <Palette size={20} />
            <strong>8</strong> audience previews
          </p>
          <p>
            <Moon size={20} />
            <strong>Dark appearance</strong> included in core
          </p>
          <p>
            <ShieldCheck size={20} />
            <strong>Fictional data</strong> throughout
          </p>
        </section>
        <section className="sf-section sf-gallery-section" id="themes">
          <div className="sf-section-heading">
            <div>
              <p className="sf-eyebrow">The SchoolFlow collection</p>
              <h2>
                Not just a different color.
                <br />
                <em>A different point of view.</em>
              </h2>
            </div>
            <p>
              From composed executive workspaces to textured seasonal editions,
              each direction brings its own rhythm, hierarchy and character.
            </p>
          </div>
          <div
            className="sf-gallery-filter"
            aria-label="Filter design collection"
          >
            {(
              [
                ["all", "All twelve"],
                ["core", "Core · 6"],
                ["composition", "Premium compositions · 2"],
                ["collection", "Decorative collections · 4"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="sf-theme-grid">
            {cards.map((item) => (
              <button
                type="button"
                className={`sf-theme-card ${selected === item.id ? "sf-theme-selected" : ""}`}
                key={item.id}
                aria-pressed={selected === item.id}
                onClick={() => pickTheme(item.id)}
              >
                <div className="sf-theme-card-visual">
                  <MiniDashboard id={item.id} />
                  <span className="sf-theme-preview-action">
                    Preview design <ArrowUpRight size={14} />
                  </span>
                  {selected === item.id && (
                    <span className="sf-theme-check">
                      <Check size={15} />
                      <span className="sf-visually-hidden">Selected</span>
                    </span>
                  )}
                </div>
                <span className="sf-theme-card-meta">
                  <span>
                    <small>{tierName[item.tier]}</small>
                    <strong>{item.name}</strong>
                  </span>
                  <span
                    className="sf-theme-dot"
                    style={{ background: item.primary }}
                  />
                </span>
                <span className="sf-theme-mood">{item.mood}</span>
              </button>
            ))}
          </div>
          <p className="sf-collection-note">
            <Sparkles size={16} /> All collections are available to preview.
            Selecting a paid design is simulated; no subscription is changed.
          </p>
        </section>
        <section className="sf-section sf-workspace-section" id="workspace">
          <div className="sf-section-heading">
            <div>
              <p className="sf-eyebrow">Make it your perspective</p>
              <h2>
                A better view.
                <br />
                <em>For every role.</em>
              </h2>
            </div>
            <p>
              Explore the same school foundation through different
              responsibilities. These fictional layouts demonstrate
              presentation, not a signed-in role or live access.
            </p>
          </div>
          <div className="sf-preview-controls">
            <div className="sf-selected-theme">
              <span
                className="sf-theme-dot"
                style={{ background: theme.primary }}
              />
              <div>
                <small>Now exploring</small>
                <strong>{theme.name}</strong>
              </div>
              <ChevronDown size={16} />
            </div>
            <label>
              Dashboard audience
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {showroomRoles.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Screen preview</legend>
              {(
                [
                  ["fit", "Fit"],
                  ["320", "320"],
                  ["360", "360"],
                  ["768", "Tablet"],
                  ["1440", "Desktop"],
                ] as const
              ).map(([value, label]) => (
                <button
                  type="button"
                  aria-pressed={width === value}
                  key={value}
                  onClick={() => setWidth(value)}
                >
                  {label}
                </button>
              ))}
            </fieldset>
          </div>
          <div className="sf-preview-tray">
            <div className="sf-preview-chrome">
              <span>
                <i />
                <i />
                <i />
              </span>
              <p>
                {theme.name} · {chosenRole.name} ·{" "}
                {width === "fit" ? "responsive panel" : `${width}px frame`}
              </p>
              <span className="sf-preview-fixture">Fictional school</span>
            </div>
            <iframe
              title={`${theme.name} ${chosenRole.name} fictional dashboard`}
              src={`/preview/?theme=${encodeURIComponent(selected)}&role=${encodeURIComponent(role)}`}
              className="sf-dashboard-frame"
              style={{ width: width === "fit" ? "100%" : `${width}px` }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <p className="sf-preview-caption">
            {theme.description}{" "}
            <span>
              Preview widths control an actual browser frame. This is not
              authenticated application QA.
            </span>
          </p>
        </section>
        <section className="sf-section sf-insights-section" id="insights">
          <div className="sf-section-heading">
            <div>
              <p className="sf-eyebrow">Insight with integrity</p>
              <h2>
                Beautiful charts.
                <br />
                <em>Clear meaning.</em>
              </h2>
            </div>
            <p>
              Know what a number means before acting on it. Explore the chart,
              focus a point, open the data table or try an empty state.
            </p>
          </div>
          <div className="sf-insight-controls">
            <div
              className="sf-chart-tabs"
              aria-label="Visualization demonstrations"
            >
              {chartChoices.map((choice) => (
                <button
                  type="button"
                  key={choice}
                  aria-pressed={chart === choice}
                  onClick={() => setChart(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
            <label>
              Example data state
              <select
                value={dataState}
                onChange={(event) =>
                  setDataState(event.target.value as DataState)
                }
              >
                <option value="ready">Populated</option>
                <option value="empty">Empty</option>
                <option value="error">Error</option>
              </select>
            </label>
          </div>
          <div
            className="sf-visualization-stage"
            data-texture={theme.texture}
            style={themeStyle(theme)}
          >
            {chart === "Trends & area" && (
              <>
                <div className="sf-chart-options">
                  <button
                    type="button"
                    aria-pressed={area}
                    onClick={() => setArea((current) => !current)}
                  >
                    Area fill {area ? "on" : "off"}
                  </button>
                </div>
                <TrendChart
                  title="School attendance trend"
                  description="Present plus late / recorded marks. Four illustrative weeks, 1,000 recorded marks per week. Zero to 100 percent scale."
                  period={demoPeriod}
                  points={attendanceTrend}
                  area={area}
                  state={dataState}
                />
              </>
            )}
            {chart === "Comparison bars" && (
              <>
                <div className="sf-chart-options">
                  <button
                    type="button"
                    aria-pressed={stacked}
                    onClick={() => setStacked((current) => !current)}
                  >
                    {stacked ? "Stacked" : "Grouped"} bars · switch view
                  </button>
                </div>
                <ComparisonBars
                  title="Active enrollment records by level"
                  description="Two disjoint class-arm groups. These are enrollment rows, not unique learners. Current-session snapshot."
                  period="2026/27 session · fictional snapshot"
                  points={enrollmentComparison}
                  labels={["Class-arm group A", "Class-arm group B"]}
                  stacked={stacked}
                  state={dataState}
                />
              </>
            )}
            {chart === "Finance mix" && (
              <CompositionChart
                title="Verified receipts, by method"
                description="NGN only. Cash and bank transfers are disjoint methods. Recorded or unverified payments and allocations are excluded."
                period={demoPeriod}
                points={receiptMethods}
                state={dataState}
              />
            )}{" "}
            {chart === "Progress & gauge" && (
              <div className="sf-gauge-pair">
                <ProgressCard
                  title="Recorded-mark attendance"
                  description="948 present or late entries / 1,000 recorded entries. Not enrollment coverage."
                  period="Latest fictional week"
                  numerator={948}
                  denominator={1000}
                  state={dataState}
                />
                <ProgressCard
                  title="The same rate, another view"
                  description="The same defined denominator and a 0–100 percent gauge. Zero denominators remain unavailable."
                  period="Latest fictional week"
                  numerator={dataState === "empty" ? 0 : 948}
                  denominator={dataState === "empty" ? 0 : 1000}
                  gauge
                  state={dataState}
                />
              </div>
            )}
            {chart === "Attendance calendar" && (
              <AttendanceHeatmap
                title="A month of recorded attendance"
                description="School-day aggregates with explicit recorded-mark denominators. Symbols supplement color; weekends are excluded."
                period={demoPeriod}
                days={attendanceDays}
                state={dataState}
              />
            )}{" "}
            {chart === "Admissions stages" && (
              <StageChart
                title="Application status snapshot"
                description="84 current applications across disjoint statuses. These are not cohort conversion rates."
                period="21 October 2026 · fictional snapshot"
                points={admissionsStages}
                state={dataState}
              />
            )}{" "}
            {chart === "Assessment workflow" && (
              <StageChart
                title="Assessment work and publication"
                description="Batch-row status counts in a fictional academic scope. Current publication summaries use latest published snapshots, preserving history."
                period="First Term 2026/27 · fictional snapshot"
                points={assessmentStages}
                assessment
                state={dataState}
              />
            )}{" "}
            {chart === "Multi-school" && (
              <SchoolComparison
                title="Comparable school attendance"
                description="Fictional, pre-scoped school DTOs with one calendar window. Live comparison requires server filtering for each school and domain; this component grants no authority."
                period={demoPeriod}
                schools={demoSchools}
                state={dataState}
              />
            )}
          </div>
        </section>
        <section className="sf-section sf-studio-section" id="studio">
          <div className="sf-studio-copy">
            <p className="sf-eyebrow">Experience Studio · demonstration</p>
            <h2>
              Make a choice.
              <br />
              <em>See it before it’s shared.</em>
            </h2>
            <p>
              Browse a collection, preview a role and try a draft. This Studio
              simulation keeps appearance choices separate from school data and
              permissions.
            </p>
            <div className="sf-studio-steps">
              <span>Browse</span>
              <ArrowRight size={14} />
              <span>Preview</span>
              <ArrowRight size={14} />
              <span>Draft</span>
              <ArrowRight size={14} />
              <span>Publish</span>
              <ArrowRight size={14} />
              <span>Revert</span>
            </div>
            <p className="sf-studio-note">
              <ShieldCheck size={18} /> Demo choices stay in memory. Reload
              resets the history. No real branding, plan, publishing authority
              or school settings are connected.
            </p>
          </div>
          <div className="sf-studio-panel">
            <div className="sf-studio-panel-header">
              <Palette size={21} />
              <span>Your demonstration canvas</span>
              <span className="sf-demo-tag">Demo only</span>
            </div>
            <label>
              Simulate plan availability
              <select
                value={plan}
                onChange={(event) =>
                  changePlan(event.target.value as ShowroomPlan)
                }
              >
                <option value="starter">
                  Starter / standard trial · 6 core designs
                </option>
                <option value="growth">Growth · 8 designs</option>
                <option value="professional">Professional · 12 designs</option>
                <option value="enterprise">Enterprise · 12 designs</option>
              </select>
            </label>
            <div className="sf-studio-choice">
              <MiniDashboard id={selected} />
              <div>
                <small>{tierName[theme.tier]}</small>
                <h3>{theme.name}</h3>
                <p>
                  {eligible
                    ? "Available in this plan simulation."
                    : "Preview freely; select a higher simulated plan to try a draft."}
                </p>
              </div>
            </div>
            <div className="sf-studio-actions">
              <button
                type="button"
                className="sf-button sf-button-forest"
                disabled={!eligible}
                onClick={() => {
                  if (eligible) {
                    setDraft(selected);
                    setStatus(
                      `${theme.name} saved as a demo draft. The demo published version has not changed.`,
                    );
                  }
                }}
              >
                {eligible ? <Palette size={16} /> : <LockKeyhole size={16} />}{" "}
                Choose demo draft
              </button>
              <button
                type="button"
                className="sf-button sf-button-outline"
                disabled={!draft}
                onClick={publish}
              >
                Publish demo draft
              </button>
            </div>
            <p className="sf-studio-status" role="status">
              {status}
            </p>
            <div className="sf-demo-history">
              <h4>In-memory version history</h4>
              {versions.map((id, index) => (
                <div key={`${id}-${index}`}>
                  <span>
                    <b>v{index + 1}</b> {resolveShowroomTheme(id).name}
                  </span>
                  {index === versions.length - 1 ? (
                    <small>Demo published</small>
                  ) : (
                    <button type="button" onClick={() => restore(id)}>
                      Restore as new
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="sf-section sf-packaging">
          <p className="sf-eyebrow">Appearance, thoughtfully packaged</p>
          <h2>
            A strong foundation.
            <br />
            <em>Room to make it yours.</em>
          </h2>
          <p>
            Initial showroom availability proposal. Actual commercial plans,
            prices and subscription controls are unchanged.
          </p>
          <div className="sf-package-grid">
            {[
              {
                name: "Starter / standard trial",
                count: "6",
                note: "Six core designs, including Midnight Command. Basic dark appearance stays free.",
              },
              {
                name: "Growth",
                count: "8",
                note: "All core designs, plus Obsidian Gold and Aurora Insights compositions.",
              },
              {
                name: "Professional / Enterprise",
                count: "12",
                note: "All eight designs plus four original decorative collections.",
              },
            ].map((item) => (
              <article key={item.name}>
                <small>{item.name}</small>
                <h3>
                  {item.count} <span>design directions</span>
                </h3>
                <p>{item.note}</p>
                <span>
                  <CheckCircle2 size={16} /> Premium previews visible to
                  everyone
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="sf-closing">
          <div>
            <p className="sf-eyebrow">Designed around the work of a school</p>
            <h2>
              One school day.
              <br />A clearer way forward.
            </h2>
            <p>
              Discover SchoolFlow’s existing admissions, school operations,
              Finance, Assessment and communication foundations.
            </p>
            <a
              className="sf-button sf-button-gold"
              href="https://schoolflow-app.netlify.app/modules"
              target="_blank"
              rel="noreferrer"
            >
              Explore the platform <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="sf-closing-pattern" aria-hidden="true">
            <span>S</span>
          </div>
        </section>
      </main>
      <footer className="sf-site-footer">
        <a className="sf-brand" href="#">
          <span>S</span>SchoolFlow
        </a>
        <p>A customer showroom candidate. All school data is fictional.</p>
        <button type="button" onClick={() => about.current?.showModal()}>
          About this demonstration <ArrowUpRight size={14} />
        </button>
      </footer>
      <dialog
        ref={about}
        className="sf-about-dialog"
        aria-label="About the SchoolFlow showroom"
      >
        <button
          type="button"
          aria-label="Close demonstration information"
          onClick={() => about.current?.close()}
        >
          <X size={20} />
        </button>
        <p className="sf-eyebrow">A safe place to explore</p>
        <h2>
          Real components.
          <br />
          Fictional school data.
        </h2>
        <p>
          This showroom demonstrates designs and reusable visualizations. It
          does not sign in as a role, access a school, accept payments, change
          subscriptions or publish real branding. Live dashboard integration
          requires independent authorization and testing.
        </p>
        <p>
          Decorative graphics are original local SVG assets. No vendor artwork
          or external runtime images are used.
        </p>
      </dialog>
    </div>
  );
}
