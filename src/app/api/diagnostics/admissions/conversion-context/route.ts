import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ConversionProbeError,
  readConversionContext,
} from "@/features/admissions/conversion-context-probe";
import { requireAdmissionsContext } from "@/features/admissions/service";

export const dynamic = "force-dynamic";

const probeBindingsSchema = z.object({
  actorId: z.string().uuid(),
  applicationId: z.string().uuid(),
  organizationId: z.string().uuid(),
  schoolId: z.string().uuid(),
});

type ProbeConfigRejection =
  | "missing_or_disabled"
  | "missing_binding"
  | "malformed_binding"
  | "invalid_expiry"
  | "wrong_deployment_context"
  | "expired"
  | "excessive_window";

type ProbeConfigResult =
  | {
      ok: true;
      config: z.infer<typeof probeBindingsSchema> & { expiresAt: Date };
    }
  | { ok: false; rejectionCategory: ProbeConfigRejection };

function loadProbeConfig(now = new Date()): ProbeConfigResult {
  if (process.env.SCHOOLFLOW_CONVERSION_PROBE_ENABLED !== "true")
    return { ok: false, rejectionCategory: "missing_or_disabled" };

  if (process.env.SCHOOLFLOW_CONVERSION_PROBE_DEPLOY_CONTEXT !== "production")
    return { ok: false, rejectionCategory: "wrong_deployment_context" };

  const rawBindings = {
    actorId: process.env.SCHOOLFLOW_CONVERSION_PROBE_ACTOR_ID,
    applicationId: process.env.SCHOOLFLOW_CONVERSION_PROBE_APPLICATION_ID,
    organizationId: process.env.SCHOOLFLOW_CONVERSION_PROBE_ORGANIZATION_ID,
    schoolId: process.env.SCHOOLFLOW_CONVERSION_PROBE_SCHOOL_ID,
  };
  if (Object.values(rawBindings).some((value) => !value))
    return { ok: false, rejectionCategory: "missing_binding" };

  const bindings = probeBindingsSchema.safeParse(rawBindings);
  if (!bindings.success)
    return { ok: false, rejectionCategory: "malformed_binding" };

  const expiresAt = z.coerce
    .date()
    .safeParse(process.env.SCHOOLFLOW_CONVERSION_PROBE_EXPIRES_AT);
  if (!expiresAt.success)
    return { ok: false, rejectionCategory: "invalid_expiry" };
  if (expiresAt.data.getTime() <= now.getTime())
    return { ok: false, rejectionCategory: "expired" };
  if (expiresAt.data.getTime() > now.getTime() + 4 * 60 * 60 * 1000)
    return { ok: false, rejectionCategory: "excessive_window" };

  return {
    ok: true,
    config: { ...bindings.data, expiresAt: expiresAt.data },
  };
}

function logConfigurationRejection(
  correlationId: string,
  occurredAt: string,
  rejectionCategory: ProbeConfigRejection,
) {
  try {
    console.error(
      JSON.stringify({
        event: "conversion_context_probe",
        correlationId,
        occurredAt,
        stage: "configuration_rejected",
        rejectionCategory,
        operation: "admissions_conversion_context",
      }),
    );
  } catch {
    // Logging must never weaken the fail-closed response.
  }
}

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET() {
  const correlationId = randomUUID();
  const occurredAt = new Date().toISOString();
  const configResult = loadProbeConfig();
  if (!configResult.ok) {
    logConfigurationRejection(
      correlationId,
      occurredAt,
      configResult.rejectionCategory,
    );
    return unavailable();
  }
  const { config } = configResult;

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
