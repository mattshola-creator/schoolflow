const baseUrl = process.env.SCHOOLFLOW_SMOKE_URL;
if (!baseUrl) throw new Error("SCHOOLFLOW_SMOKE_URL is required");

const requests = Math.min(Number(process.env.SMOKE_REQUESTS ?? 40), 100);
const concurrency = Math.min(Number(process.env.SMOKE_CONCURRENCY ?? 8), 10);
const paths = ["/", "/api/health"];
const results = [];
let cursor = 0;

async function worker() {
  while (cursor < requests) {
    const index = cursor++;
    const path = paths[index % paths.length];
    const started = performance.now();
    try {
      const response = await fetch(new URL(path, baseUrl), {
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
      });
      results.push({
        path,
        status: response.status,
        ms: performance.now() - started,
      });
    } catch (error) {
      results.push({
        path,
        status: 0,
        ms: performance.now() - started,
        error: String(error),
      });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
const sorted = results.map((result) => result.ms).sort((a, b) => a - b);
const percentile = (value) =>
  sorted[Math.min(Math.ceil(sorted.length * value) - 1, sorted.length - 1)];
const failures = results.filter(
  (result) => result.status < 200 || result.status >= 400,
);
const summary = {
  baseUrl: new URL(baseUrl).origin,
  requests,
  concurrency,
  failures: failures.length,
  latencyMs: {
    min: Math.round(sorted[0] ?? 0),
    median: Math.round(percentile(0.5) ?? 0),
    p95: Math.round(percentile(0.95) ?? 0),
    max: Math.round(sorted.at(-1) ?? 0),
  },
  statuses: Object.fromEntries(
    [...new Set(results.map((result) => result.status))].map((status) => [
      status,
      results.filter((result) => result.status === status).length,
    ]),
  ),
  paths: Object.fromEntries(
    paths.map((path) => {
      const values = results
        .filter((result) => result.path === path)
        .map((result) => result.ms)
        .sort((a, b) => a - b);
      return [
        path,
        {
          requests: values.length,
          medianMs: Math.round(values[Math.ceil(values.length * 0.5) - 1] ?? 0),
          p95Ms: Math.round(values[Math.ceil(values.length * 0.95) - 1] ?? 0),
        },
      ];
    }),
  ),
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
