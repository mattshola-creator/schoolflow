import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { enrollmentConversionSchema } from "@/features/admissions/schemas";
import {
  AdmissionConversionError,
  convertAdmissionToStudent,
} from "@/features/admissions/service";

export const dynamic = "force-dynamic";

export function hasValidConversionOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null) return false;

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return true;

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost ?? request.headers.get("host");
  if (!host) return false;

  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);

  return origin === `${protocol}://${host}`;
}

function redirect(
  request: Request,
  path: string,
  key: "message" | "error",
  value: string,
) {
  const destination = new URL(path, request.url);
  destination.searchParams.set(key, value);
  return NextResponse.redirect(destination, 303);
}

type ConversionLog = {
  stage:
    | "request_validation"
    | "context_resolution"
    | "rpc_invocation"
    | "rpc_response"
    | "service"
    | "response_redirect";
  category: string;
  rpcInvoked: boolean;
  rpcReturnedError: boolean;
  rpcCode?: string;
};

function logConversionFailure(
  correlationId: string,
  occurredAt: string,
  failure: ConversionLog,
) {
  try {
    console.error(
      JSON.stringify({
        event: "admission_conversion_failed",
        operation: "admissions_conversion",
        correlationId,
        occurredAt,
        ...failure,
      }),
    );
  } catch {
    // Observability must never alter conversion behavior or trigger a retry.
  }
}

export async function POST(request: NextRequest) {
  const correlationId = randomUUID();
  const occurredAt = new Date().toISOString();

  if (!hasValidConversionOrigin(request)) {
    logConversionFailure(correlationId, occurredAt, {
      stage: "request_validation",
      category: "origin_rejected",
      rpcInvoked: false,
      rpcReturnedError: false,
    });
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    logConversionFailure(correlationId, occurredAt, {
      stage: "request_validation",
      category: "form_data_invalid",
      rpcInvoked: false,
      rpcReturnedError: false,
    });
    return redirect(
      request,
      "/admissions",
      "error",
      "Invalid enrollment request",
    );
  }

  const values = Object.fromEntries(formData);
  const parsed = enrollmentConversionSchema.safeParse(values);
  const applicationId =
    typeof values.applicationId === "string" ? values.applicationId : null;
  if (!parsed.success) {
    logConversionFailure(correlationId, occurredAt, {
      stage: "request_validation",
      category: "input_validation_failed",
      rpcInvoked: false,
      rpcReturnedError: false,
    });
    return redirect(
      request,
      applicationId ? `/admissions/${applicationId}` : "/admissions",
      "error",
      "Check the enrollment details",
    );
  }

  let studentId: string;
  try {
    studentId = await convertAdmissionToStudent(parsed.data);
  } catch (error) {
    const failure =
      error instanceof AdmissionConversionError
        ? error.diagnostic
        : {
            stage: "service" as const,
            category: "unexpected_service_failure",
            rpcInvoked: false,
            rpcReturnedError: false,
          };
    logConversionFailure(correlationId, occurredAt, failure);
    return redirect(
      request,
      `/admissions/${parsed.data.applicationId}`,
      "error",
      "Enrollment requirements are incomplete or invalid",
    );
  }

  try {
    return redirect(
      request,
      `/students/${studentId}`,
      "message",
      "Applicant enrolled",
    );
  } catch {
    logConversionFailure(correlationId, occurredAt, {
      stage: "response_redirect",
      category: "success_redirect_failed",
      rpcInvoked: true,
      rpcReturnedError: false,
    });
    return redirect(
      request,
      `/admissions/${parsed.data.applicationId}`,
      "error",
      "Enrollment requirements are incomplete or invalid",
    );
  }
}
