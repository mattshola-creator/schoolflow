"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import {
  chartMaximum,
  formatChartValue,
  lineCoordinates,
  rate,
  validValues,
  type ChartPoint,
  type ChartUnit,
  type ComparisonPoint,
  type DataState,
  type SchoolComparisonDatum,
} from "./chart-model";

type FrameProps = {
  title: string;
  description: string;
  period: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  children: ReactNode;
  state?: DataState;
  className?: string;
};

export function ChartFrame({
  title,
  description,
  period,
  columns,
  rows,
  children,
  state = "ready",
  className = "",
}: FrameProps) {
  const titleId = useId();
  const details = useRef<HTMLDetailsElement>(null);
  return (
    <section className={`sf-chart ${className}`} aria-labelledby={titleId}>
      <header className="sf-chart-heading">
        <div>
          <p className="sf-kicker">{period}</p>
          <h3 id={titleId}>{title}</h3>
        </div>
        <span className="sf-chart-badge">Demo data</span>
      </header>
      <p className="sf-chart-description">{description}</p>
      {state === "error" ? (
        <div className="sf-data-state" role="status">
          <strong>Data could not be displayed.</strong>
          <p>Please retry the source. An error is not a zero.</p>
        </div>
      ) : state === "empty" || rows.length === 0 ? (
        <div className="sf-data-state">
          <strong>No records for this selection.</strong>
          <p>Choose another period or scope. No percentage is inferred.</p>
        </div>
      ) : (
        <>
          {children}
          <details ref={details} className="sf-chart-table">
            <summary>Explore data & accessible table</summary>
            <div
              className="sf-table-scroll"
              tabIndex={0}
              role="region"
              aria-label={`${title} data table`}
            >
              <table>
                <caption>
                  {title} · {period} · fictional values
                </caption>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column} scope="col">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {row.map((cell, cellIndex) =>
                        cellIndex === 0 ? (
                          <th key={cellIndex} scope="row">
                            {cell}
                          </th>
                        ) : (
                          <td key={cellIndex}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}

type CommonProps = {
  title: string;
  description: string;
  period: string;
  state?: DataState;
};
type Tip = { label: string; value: string; x: number; y: number } | null;

function Tooltip({ tip }: { tip: Tip }) {
  return (
    <div className="sf-tooltip-slot" aria-live="polite">
      {tip ? (
        <div
          className="sf-tooltip"
          role="tooltip"
          style={{
            left: `${Math.min(78, Math.max(4, tip.x))}%`,
            top: `${Math.max(0, tip.y)}%`,
          }}
        >
          <strong>{tip.label}</strong>
          <span>{tip.value}</span>
        </div>
      ) : (
        <span className="sf-chart-hint">
          Focus a point or explore its data table.
        </span>
      )}
    </div>
  );
}

export function TrendChart({
  points,
  unit = "percent",
  area = true,
  ...props
}: CommonProps & {
  points: readonly ChartPoint[];
  unit?: ChartUnit;
  area?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [tip, setTip] = useState<Tip>(null);
  const valid =
    validValues(points.map((point) => point.value)) &&
    (unit !== "NGN" ||
      points.every((point) => Number.isSafeInteger(point.value))) &&
    (unit !== "percent" || points.every((point) => point.value <= 100));
  const maximum = chartMaximum(
    points.map((point) => point.value),
    unit,
  );
  const coords = lineCoordinates(points, maximum);
  const path = coords.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <ChartFrame
      {...props}
      state={!valid ? "error" : props.state}
      columns={[
        "Period",
        unit === "NGN" ? "Amount · NGN" : unit === "percent" ? "Rate" : "Count",
        "Definition",
      ]}
      rows={points.map((point) => [
        point.label,
        formatChartValue(point.value, unit),
        point.detail ?? "See chart definition",
      ])}
    >
      <div className="sf-plot">
        <svg
          viewBox="0 0 600 250"
          role="group"
          aria-label={`${props.title}. Zero baseline; upper bound ${formatChartValue(maximum, unit)}.`}
        >
          <defs>
            <linearGradient id={`${id}-area`} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--sf-primary)"
                stopOpacity=".28"
              />
              <stop
                offset="100%"
                stopColor="var(--sf-primary)"
                stopOpacity=".01"
              />
            </linearGradient>
            <linearGradient id={`${id}-line`}>
              <stop stopColor="var(--sf-series-1)" />
              <stop offset="100%" stopColor="var(--sf-series-2)" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((fraction) => (
            <g key={fraction}>
              <path
                d={`M50 ${190 - fraction * 150}H550`}
                className="sf-gridline"
              />
              <text
                x="46"
                y={195 - fraction * 150}
                textAnchor="end"
                className="sf-axis"
              >
                {unit === "percent"
                  ? `${fraction * 100}%`
                  : unit === "NGN"
                    ? new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format((maximum * fraction) / 100)
                    : formatChartValue(maximum * fraction, unit)}
              </text>
            </g>
          ))}
          {area && coords.length > 1 && (
            <polygon
              points={`50,190 ${path} 550,190`}
              fill={`url(#${id}-area)`}
            />
          )}
          <polyline
            points={path}
            fill="none"
            stroke={`url(#${id}-line)`}
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((point, index) => {
            const pos = coords[index];
            const show = () =>
              setTip({
                label: point.label,
                value: `${formatChartValue(point.value, unit)}${point.detail ? ` · ${point.detail}` : ""}`,
                x: pos.x / 6,
                y: pos.y / 3 - 10,
              });
            return (
              <g key={`${point.label}-${index}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="7"
                  fill="var(--sf-surface)"
                  stroke="var(--sf-series-1)"
                  strokeWidth="3"
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.label}: ${formatChartValue(point.value, unit)}. ${point.detail ?? ""}`}
                  onFocus={show}
                  onBlur={() => setTip(null)}
                  onPointerEnter={show}
                  onPointerLeave={() => setTip(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setTip(null);
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      show();
                    }
                  }}
                />
                <text
                  x={pos.x}
                  y="223"
                  textAnchor="middle"
                  className="sf-axis sf-axis-x"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
        <Tooltip tip={tip} />
      </div>
    </ChartFrame>
  );
}

export function ComparisonBars({
  points,
  labels,
  stacked = false,
  ...props
}: CommonProps & {
  points: readonly ComparisonPoint[];
  labels: readonly [string, string];
  stacked?: boolean;
}) {
  const [tip, setTip] = useState<string | null>(null);
  const [visible, setVisible] = useState([true, true]);
  const valid = validValues(
    points.flatMap((point) => [
      point.first,
      point.second,
      point.first + point.second,
    ]),
  );
  const maximum = chartMaximum(
    points.map((point) =>
      stacked
        ? point.first + point.second
        : Math.max(point.first, point.second),
    ),
    "count",
  );
  return (
    <ChartFrame
      {...props}
      state={!valid ? "error" : props.state}
      columns={["Group", ...labels, "Total"]}
      rows={points.map((point) => [
        point.label,
        String(point.first),
        String(point.second),
        String(point.first + point.second),
      ])}
    >
      <div className="sf-legend" aria-label="Visible chart series">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={visible[index]}
            onClick={() =>
              setVisible((current) =>
                current.map((value, i) => (i === index ? !value : value)),
              )
            }
          >
            <i className={`sf-series-${index + 1}`} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className={`sf-bar-list ${stacked ? "sf-stacked" : "sf-grouped"}`}>
        {points.map((point) => (
          <div className="sf-bar-group" key={point.label}>
            <strong>{point.label}</strong>
            <div className="sf-bar-tracks">
              {[point.first, point.second].map((value, index) => (
                <button
                  key={index}
                  type="button"
                  className={`sf-bar sf-series-${index + 1}`}
                  style={{
                    width: visible[index]
                      ? `${(value * 100) / maximum}%`
                      : "0%",
                    minWidth: visible[index] && value > 0 ? 28 : 0,
                    visibility: visible[index] ? "visible" : "hidden",
                  }}
                  aria-label={`${point.label}, ${labels[index]}: ${value}`}
                  onFocus={() =>
                    setTip(`${point.label} · ${labels[index]}: ${value}`)
                  }
                  onPointerEnter={() =>
                    setTip(`${point.label} · ${labels[index]}: ${value}`)
                  }
                  onPointerLeave={() => setTip(null)}
                  onBlur={() => setTip(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setTip(null);
                  }}
                >
                  <span>{value}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="sf-bar-axis">
        0 → {maximum} records · zero baseline ·{" "}
        {stacked ? "stacked totals" : "grouped series"}
      </p>
      <p className="sf-chart-readout" role="status">
        {tip ??
          "Toggle a series or focus a bar. Exact totals remain in the table."}
      </p>
    </ChartFrame>
  );
}

export function CompositionChart({
  points,
  unit = "NGN",
  ...props
}: CommonProps & { points: readonly ChartPoint[]; unit?: ChartUnit }) {
  const [selected, setSelected] = useState<number | null>(null);
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const valid =
    validValues([...points.map((point) => point.value), total]) &&
    (unit !== "NGN" ||
      points.every((point) => Number.isSafeInteger(point.value)));
  const circumference = 2 * Math.PI * 64;
  return (
    <ChartFrame
      {...props}
      state={!valid ? "error" : total === 0 ? "empty" : props.state}
      columns={[
        "Method",
        unit === "NGN" ? "Verified receipts · NGN" : "Count",
        "Share",
      ]}
      rows={points.map((point) => [
        point.label,
        formatChartValue(point.value, unit),
        total ? `${((point.value * 100) / total).toFixed(1)}%` : "—",
      ])}
    >
      <div className="sf-composition">
        <svg
          viewBox="0 0 190 190"
          role="img"
          aria-label={`Total ${formatChartValue(total, unit)}. Disjoint methods; exact values in the legend and table.`}
        >
          <circle
            cx="95"
            cy="95"
            r="64"
            fill="none"
            stroke="var(--sf-border)"
            strokeWidth="23"
          />
          {points.map((point, index) => (
            <circle
              key={point.label}
              cx="95"
              cy="95"
              r="64"
              fill="none"
              stroke={`var(--sf-series-${(index % 3) + 1})`}
              strokeWidth={selected === index ? 28 : 23}
              strokeDasharray={`${total ? (point.value / total) * circumference : 0} ${circumference}`}
              strokeDashoffset={
                (-points
                  .slice(0, index)
                  .reduce((sum, item) => sum + item.value, 0) /
                  (total || 1)) *
                circumference
              }
              transform="rotate(-90 95 95)"
            />
          ))}
          <text x="95" y="90" textAnchor="middle" className="sf-ring-label">
            Verified
          </text>
          <text x="95" y="113" textAnchor="middle" className="sf-ring-number">
            {unit === "NGN" ? `₦${(total / 1e8).toFixed(2)}m` : total}
          </text>
        </svg>
        <div className="sf-composition-legend">
          {points.map((point, index) => (
            <button
              type="button"
              key={point.label}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span>
                <i
                  className={`sf-series-${(index % 3) + 1}`}
                  aria-hidden="true"
                />
                {point.label}
              </span>
              <strong>{formatChartValue(point.value, unit)}</strong>
              <small>
                {total
                  ? `${((point.value * 100) / total).toFixed(1)}% of verified receipts`
                  : "—"}
              </small>
            </button>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
}

export function ProgressCard({
  numerator,
  denominator,
  gauge = false,
  ...props
}: CommonProps & { numerator: number; denominator: number; gauge?: boolean }) {
  const percent = rate(numerator, denominator);
  const radius = 65;
  const length = 2 * Math.PI * radius * (gauge ? 0.5 : 1);
  return (
    <ChartFrame
      {...props}
      state={percent === null && denominator !== 0 ? "error" : props.state}
      columns={["Numerator", "Denominator", "Rate"]}
      rows={[
        [
          String(numerator),
          String(denominator),
          percent === null ? "—" : `${percent.toFixed(1)}%`,
        ],
      ]}
    >
      <div className={`sf-progress ${gauge ? "sf-gauge" : ""}`}>
        <svg
          viewBox={gauge ? "0 0 180 120" : "0 0 180 180"}
          role="img"
          aria-label={
            percent === null
              ? "No denominator; rate unavailable."
              : `${numerator} of ${denominator}, ${percent.toFixed(1)} percent.`
          }
        >
          {gauge ? (
            <>
              <path
                d="M25 92A65 65 0 0 1 155 92"
                fill="none"
                stroke="var(--sf-border)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M25 92A65 65 0 0 1 155 92"
                fill="none"
                stroke="var(--sf-primary)"
                strokeWidth="14"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={`${percent ?? 0} 100`}
              />
            </>
          ) : (
            <>
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="var(--sf-border)"
                strokeWidth="13"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="var(--sf-primary)"
                strokeWidth="13"
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
                strokeDasharray={`${((percent ?? 0) / 100) * length} ${length}`}
              />
            </>
          )}
          <text
            x="90"
            y={gauge ? "83" : "95"}
            textAnchor="middle"
            className="sf-progress-value"
          >
            {percent === null ? "—" : `${percent.toFixed(1)}%`}
          </text>
          {!gauge && (
            <text x="90" y="117" textAnchor="middle" className="sf-ring-label">
              recorded marks
            </text>
          )}
        </svg>
        <p>
          <strong>
            {numerator.toLocaleString()} / {denominator.toLocaleString()}
          </strong>
          <span>
            {denominator === 0
              ? "No recorded marks; percentage unavailable."
              : "Present or late / recorded marks · 0–100% scale"}
          </span>
        </p>
      </div>
    </ChartFrame>
  );
}

export type AttendanceDay = {
  date: string;
  label: string;
  present: number;
  recorded: number;
};
export function AttendanceHeatmap({
  days,
  ...props
}: CommonProps & { days: readonly AttendanceDay[] }) {
  const [selected, setSelected] = useState<AttendanceDay | null>(null);
  return (
    <ChartFrame
      {...props}
      state={
        days.some(
          (day) =>
            !validValues([day.present, day.recorded]) ||
            day.present > day.recorded,
        )
          ? "error"
          : props.state
      }
      columns={["School day", "Present + late", "Recorded", "Rate"]}
      rows={days.map((day) => [
        day.date,
        String(day.present),
        String(day.recorded),
        rate(day.present, day.recorded) === null
          ? "—"
          : `${rate(day.present, day.recorded)!.toFixed(1)}%`,
      ])}
    >
      <div className="sf-calendar-labels" aria-hidden="true">
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="sf-heatmap">
        {days.map((day) => {
          const value = rate(day.present, day.recorded);
          return (
            <button
              key={day.date}
              type="button"
              className={
                value === null
                  ? "sf-heat-none"
                  : value >= 95
                    ? "sf-heat-high"
                    : value >= 90
                      ? "sf-heat-mid"
                      : "sf-heat-low"
              }
              aria-pressed={selected?.date === day.date}
              aria-label={`${day.date}: ${value === null ? "no recorded marks" : `${day.present} present or late of ${day.recorded}, ${value.toFixed(1)} percent`}`}
              onClick={() => setSelected(day)}
            >
              {day.label}
              <span aria-hidden="true">
                {value === null
                  ? "—"
                  : value >= 95
                    ? "●"
                    : value >= 90
                      ? "◐"
                      : "○"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="sf-heat-legend">
        <span>○ below 90%</span>
        <span>◐ 90–94.9%</span>
        <span>● 95–100%</span>
        <span>— no marks</span>
      </div>
      <p className="sf-chart-readout" role="status">
        {selected
          ? `${selected.date}: ${selected.present} present or late / ${selected.recorded} recorded marks.`
          : "Choose a school day. Weekends are excluded; missing data is not absence."}
      </p>
    </ChartFrame>
  );
}

export function Sparkline({
  values,
  label,
}: {
  values: readonly number[];
  label: string;
}) {
  if (values.length === 0 || !validValues(values))
    return <span className="sf-spark-empty">No trend</span>;
  const maximum = Math.max(...values, 1);
  return (
    <span className="sf-sparkline">
      <svg
        viewBox="0 0 140 40"
        role="img"
        aria-label={`${label}: ${values.join(", ")}. Zero baseline.`}
      >
        <polyline
          points={values
            .map(
              (value, index) =>
                `${5 + (index * 130) / Math.max(1, values.length - 1)},${35 - (value / maximum) * 30}`,
            )
            .join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function StageChart({
  points,
  assessment = false,
  ...props
}: CommonProps & { points: readonly ChartPoint[]; assessment?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const maximum = chartMaximum(
    points.map((point) => point.value),
    "count",
  );
  return (
    <ChartFrame
      {...props}
      state={
        !validValues(points.map((point) => point.value)) ? "error" : props.state
      }
      columns={[
        assessment ? "Batch status" : "Application status",
        "Count",
        "Definition",
      ]}
      rows={points.map((point) => [
        point.label,
        String(point.value),
        point.detail ?? "Current status snapshot",
      ])}
    >
      <ol className={`sf-stages ${assessment ? "sf-workflow" : ""}`}>
        {points.map((point, index) => (
          <li key={point.label}>
            <button
              type="button"
              aria-pressed={active === point.label}
              onClick={() => setActive(point.label)}
            >
              <span className="sf-stage-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="sf-stage-copy">
                <span>{point.label}</span>
                <span className="sf-stage-track">
                  <i style={{ width: `${(point.value / maximum) * 100}%` }} />
                </span>
              </span>
              <strong>{point.value}</strong>
            </button>
          </li>
        ))}
      </ol>
      <p className="sf-chart-readout" role="status">
        {points.find((point) => point.label === active)?.detail ??
          (assessment
            ? "Batch rows, not unique learners or a completion rate. Publication snapshots are preserved."
            : "Current status counts, not a cohort conversion funnel.")}
      </p>
    </ChartFrame>
  );
}

/** Caller supplies an already-authorized DTO. This component grants no access. */
export function SchoolComparison({
  schools,
  ...props
}: CommonProps & { schools: readonly SchoolComparisonDatum[] }) {
  return (
    <ChartFrame
      {...props}
      state={
        schools.some(
          (school) =>
            !validValues([school.presentIncludingLate, school.recordedMarks]) ||
            school.presentIncludingLate > school.recordedMarks,
        )
          ? "error"
          : props.state
      }
      columns={["School", "Present + late", "Recorded marks", "Rate"]}
      rows={schools.map((school) => [
        school.schoolName,
        String(school.presentIncludingLate),
        String(school.recordedMarks),
        rate(school.presentIncludingLate, school.recordedMarks) === null
          ? "—"
          : `${rate(school.presentIncludingLate, school.recordedMarks)!.toFixed(1)}%`,
      ])}
    >
      <div className="sf-school-comparison">
        {schools.map((school) => {
          const percentage = rate(
            school.presentIncludingLate,
            school.recordedMarks,
          );
          return (
            <article key={school.schoolId}>
              <div>
                <strong>{school.schoolName}</strong>
                <span>
                  {percentage === null ? "—" : `${percentage.toFixed(1)}%`}
                </span>
              </div>
              <div className="sf-stage-track">
                <i style={{ width: `${percentage ?? 0}%` }} />
              </div>
              <small>
                {school.presentIncludingLate} / {school.recordedMarks} recorded
                marks
              </small>
            </article>
          );
        })}
      </div>
      <p className="sf-chart-readout">
        Calendar window aligned. A future live caller must filter every school
        and metric before serialization.
      </p>
    </ChartFrame>
  );
}
