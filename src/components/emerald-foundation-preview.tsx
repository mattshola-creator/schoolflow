"use client";

import { useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  appearanceThemes,
  defaultAppearanceTheme,
  isAppearanceTheme,
} from "@/features/appearance/themes";
import "@/features/appearance/preview.css";

/** Contained design sample. No tenant queries, appearance persistence or writes. */
export function EmeraldFoundationPreview() {
  const [themeId, setThemeId] = useState(defaultAppearanceTheme);
  const [mobile, setMobile] = useState(false);
  const [feedback, setFeedback] = useState("");
  const theme = appearanceThemes[themeId];
  const tokens = Object.fromEntries(
    Object.entries(theme)
      .filter(([key]) => key !== "name")
      .map(([key, value]) => [`--sf-${key}`, value]),
  ) as CSSProperties;
  return (
    <section aria-label="Premium Emerald design preview" className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm font-semibold">
          Preview theme
          <select
            className="min-h-11 rounded-lg border bg-white px-3 text-base text-slate-900"
            value={themeId}
            onChange={(event) => {
              if (isAppearanceTheme(event.target.value))
                setThemeId(event.target.value);
            }}
          >
            {Object.entries(appearanceThemes).map(([id, item]) => (
              <option key={id} value={id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          aria-pressed={!mobile}
          onClick={() => setMobile(false)}
        >
          Desktop
        </Button>
        <Button
          variant="secondary"
          aria-pressed={mobile}
          onClick={() => setMobile(true)}
        >
          Mobile
        </Button>
        <p className="text-sm text-slate-600">
          Synthetic design sample · changes are not saved
        </p>
      </div>
      <div
        className={`sf-design ${mobile ? "sf-design-mobile" : ""}`}
        style={tokens}
        data-theme={themeId}
      >
        <header className="sf-design-top">
          <strong>SchoolFlow</strong>
          <span>Organization workspace</span>
          <span>Design preview</span>
        </header>
        <div className="sf-design-body">
          <aside className="sf-design-sidebar" aria-label="Sample navigation">
            <p>CEDARBRIDGE GROUP</p>
            {[
              "Overview",
              "Schools",
              "Management",
              "Action Center",
              "Finance",
              "Assessment",
            ].map((item, index) => (
              <button
                key={item}
                type="button"
                aria-current={index === 0 ? "page" : undefined}
                onClick={() =>
                  setFeedback(
                    `${item} is a sample destination. Live routes reauthorize every request.`,
                  )
                }
              >
                {item}
              </button>
            ))}
            <small>
              Clear decisions.
              <br />
              Confident school leadership.
            </small>
          </aside>
          <div className="sf-design-content">
            <div className="sf-design-scope">
              Cedarbridge Group · 3 illustrative schools{" "}
              <span>2026–2027 · First Term</span>
            </div>
            <div className="sf-design-hero">
              <div>
                <p>ORGANIZATION OWNER</p>
                <h2>Your schools, moving forward.</h2>
                <span>See what matters. Act where you are needed.</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFeedback(
                    "Sample comparison only. Live reports must use authorized school scope.",
                  )
                }
              >
                Compare schools
              </button>
            </div>
            <p className="sf-design-caption">
              Illustrative values · not live school records
            </p>
            <div className="sf-design-metrics">
              {[
                ["Active learners", "842", "Distinct learners · term"],
                ["Attendance", "94.6%", "719 / 760 marks · today"],
                ["Verified collections", "₦8.4m", "First Term · NGN"],
                ["Open escalations", "6", "Current requests"],
              ].map(([label, value, period]) => (
                <article key={label}>
                  <p>{label}</p>
                  <strong>{value}</strong>
                  <small>{period}</small>
                </article>
              ))}
            </div>
            <div className="sf-design-panels">
              <section className="sf-design-panel">
                <h3>Needs your attention</h3>
                {[
                  ["2 registers remain incomplete", "Attendance leads · today"],
                  ["3 result batches await approval", "First Term · reviewed"],
                  [
                    "Procurement request overdue",
                    "Assigned to you · high priority",
                  ],
                ].map(([title, detail]) => (
                  <button
                    type="button"
                    key={title}
                    onClick={() =>
                      setFeedback(
                        `${title}: sample only; actual actions depend on current capabilities.`,
                      )
                    }
                  >
                    <strong>{title}</strong>
                    <small>{detail}</small>
                    <span aria-hidden="true">→</span>
                  </button>
                ))}
              </section>
              <section className="sf-design-panel">
                <h3>School comparison</h3>
                <p className="sf-design-caption">Attendance · today</p>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">School</th>
                      <th scope="col">Present / marked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Primary", "296 / 310"],
                      ["Secondary", "350 / 370"],
                      ["Early Years", "73 / 80"],
                    ].map(([name, value]) => (
                      <tr key={name}>
                        <th scope="row">Cedarbridge {name}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="sf-design-caption">
                  Attendance rate differs from register coverage.
                </p>
              </section>
            </div>
            <div className="sf-design-panel sf-design-activity">
              <h3>Recent activity</h3>
              <p>
                Primary published approved results <span>07:45 · example</span>
              </p>
              <p>
                Secondary completed its registers{" "}
                <span>Yesterday · example</span>
              </p>
            </div>
            {feedback && (
              <p role="status" className="sf-design-feedback">
                {feedback}
              </p>
            )}
            <nav
              className="sf-design-bottom"
              aria-label="Sample mobile shortcuts"
            >
              {["Home", "Schools", "Actions", "More"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setFeedback(`${item}: sample navigation only.`)
                  }
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
