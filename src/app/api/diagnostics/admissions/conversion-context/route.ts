import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ConversionProbeError,
  readConversionContext,
} from "@/features/admissions/conversion-context-probe";
import { requireAdmissionsContext } from "@/features/admissions/service";

export const dynamic = "force-dynamic";

const probeConfigSchema = z.object({
  enabled: z.literal("true"),
  actorId: z.string().uuid(),
  applicationId: z.string().uuid(),
  organizationId: z.string().uuid(),
  schoolId: z.string().uuid(),
  expiresAt: z.coerce.date(),
  deployContext: z.literal("production"),
});

function loadProbeConfig(now = new Date()) {
  const parsed = probeConfigSchema.safeParse({
    enabled: process.env.SCHOOLFLOW_CONVERSION_PROBE_ENABLED,
    actorId: process.env.SCHOOLFLOW_CONVERSION_PROBE_ACTOR_ID,
    applicationId: process.env.SCHOOLFLOW_CONVERSION_PROBE_APPLICATION_ID,
    organizationId: process.env.SCHOOLFLOW_CONVERSION_PROBE_ORGANIZATION_ID,
    schoolId: process.env.SCHOOLFLOW_CONVERSION_PROBE_SCHOOL_ID,
    expiresAt: process.env.SCHOOLFLOW_CONVERSION_PROBE_EXPIRES_AT,
    deployContext: process.env.CONTEXT,
  });
  if (
    !parsed.success ||
    parsed.data.expiresAt.getTime() <= now.getTime() ||
    parsed.data.expiresAt.getTime() > now.getTime() + 4 * 60 * 60 * 1000
  )
    return null;
  return parsed.data;
}

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET() {
  const config = loadProbeConfig();
  if (!config) return unavailable();

  const correlationId = randomUUID();
  const occurredAt = new Date().toISOString();
  let context: Awaited<ReturnType<typeof requireAdmissionsContext>>;
  try {
    context = await requireAdmissionsContext("admissions.enroll");
  } catch {
    console.error(
      JSON.stringify({
        event: "conversion_context_probe",
        correlationId,
        occurredAt,
        stage: "authentication_or_context_denied",
        errorCategory: "probe_access_denied",
      }),
    );
    return unavailable();
  }
  try {
    if (
      context.user.id !== config.actorId ||
      context.active.organizationId !== config.organizationId ||
      context.active.schoolId !== config.schoolId ||
      context.authorization.organizationId !== config.organizationId ||
      context.authorization.schoolId !== config.schoolId
    ) {
      console.error(
        JSON.stringify({
          event: "conversion_context_probe",
          correlationId,
          occurredAt,
          stage: "diagnostic_binding_denied",
          errorCategory: "probe_access_denied",
        }),
      );
      return unavailable();
    }

    const result = await readConversionContext(context, config.applicationId);
    console.info(
      JSON.stringify({
        event: "conversion_context_probe",
        correlationId,
        occurredAt,
        stage: result.stage,
        checks: result.checks,
      }),
    );
    return NextResponse.json(
      { correlationId, status: "complete", stage: result.stage },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    const stage =
      error instanceof ConversionProbeError ? error.stage : "context_resolved";
    console.error(
      JSON.stringify({
        event: "conversion_context_probe",
        correlationId,
        occurredAt,
        stage,
        errorCategory: "probe_stage_failed",
      }),
    );
    return NextResponse.json(
      { correlationId, status: "failed", stage },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
