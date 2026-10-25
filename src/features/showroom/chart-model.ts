export type ChartUnit = "count" | "percent" | "NGN";
export type ChartPoint = { label: string; value: number; detail?: string };
export type ComparisonPoint = { label: string; first: number; second: number };
export type DataState = "ready" | "empty" | "error";

export function validValues(values: readonly number[]) {
  return values.every(
    (value) =>
      Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER,
  );
}

export function formatChartValue(value: number, unit: ChartUnit) {
  if (!Number.isFinite(value)) return "—";
  if (unit === "percent") return `${value.toFixed(1)}%`;
  // Financial chart inputs are integer minor units. Formatting is not ledger arithmetic.
  if (unit === "NGN")
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value / 100);
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 }).format(
    value,
  );
}

export function rate(numerator: number, denominator: number): number | null {
  if (
    !validValues([numerator, denominator]) ||
    denominator === 0 ||
    numerator > denominator
  )
    return null;
  return (numerator * 100) / denominator;
}

export function chartMaximum(values: readonly number[], unit: ChartUnit) {
  if (unit === "percent") return 100;
  const max = Math.max(0, ...values);
  if (max === 0) return 1;
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

export function lineCoordinates(
  points: readonly ChartPoint[],
  maximum: number,
) {
  return points.map((point, index) => ({
    x: points.length === 1 ? 300 : 50 + (index * 500) / (points.length - 1),
    y: 190 - (point.value / maximum) * 150,
  }));
}

/** DTO input must already be permission-filtered by a trusted caller. */
export type SchoolComparisonDatum = {
  schoolId: string;
  schoolName: string;
  presentIncludingLate: number;
  recordedMarks: number;
};
export function combinedAttendance(rows: readonly SchoolComparisonDatum[]) {
  const present = rows.reduce((sum, row) => sum + row.presentIncludingLate, 0);
  const recorded = rows.reduce((sum, row) => sum + row.recordedMarks, 0);
  if (
    rows.some(
      (row) =>
        !validValues([row.presentIncludingLate, row.recordedMarks]) ||
        row.presentIncludingLate > row.recordedMarks,
    )
  )
    return null;
  return rate(present, recorded);
}
