import { describe, expect, it, vi } from "vitest";
import { readConversionContext } from "./conversion-context-probe";

const ids = {
  application: "11111111-1111-4111-8111-111111111111",
  organization: "22222222-2222-4222-8222-222222222222",
  school: "33333333-3333-4333-8333-333333333333",
  person: "44444444-4444-4444-8444-444444444444",
};

type Result = { data: unknown; error: null; count?: number };

function readonlyClient(results: Record<string, Result>) {
  const calls: string[] = [];
  const from = vi.fn((table: string) => {
    calls.push(`from:${table}`);
    const result = results[table];
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      in: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => result),
      then: (resolve: (value: Result) => unknown) =>
        Promise.resolve(result).then(resolve),
    };
    return builder;
  });
  return { client: { from }, calls, from };
}

function context(
  supabase: unknown,
  permissions = ["admissions.enroll", "students.manage"],
) {
  return {
    supabase,
    user: { id: crypto.randomUUID() },
    active: { organizationId: ids.organization, schoolId: ids.school },
    authorization: {
      organizationId: ids.organization,
      schoolId: ids.school,
      permissions,
      modules: [
        { key: "admissions", entitled: true, enabled: true },
        { key: "students", entitled: true, enabled: true },
      ],
      features: [],
    },
  } as never;
}

describe("readConversionContext", () => {
  it("uses SELECT-only queries and never exposes a conversion-capable call", async () => {
    const { client, calls, from } = readonlyClient({
      admission_applications: {
        data: {
          id: ids.application,
          status: "accepted",
          enrolled_student_id: null,
          applicant_person_id: ids.person,
        },
        error: null,
      },
      admission_offers: { data: { status: "accepted" }, error: null },
      admission_checklist_items: {
        data: [{ required: true, status: "complete" }],
        error: null,
      },
      admission_application_documents: {
        data: [
          { required: true, status: "verified" },
          { required: true, status: "verified" },
        ],
        error: null,
      },
      admission_guardians: { data: null, error: null, count: 1 },
      student_profiles: { data: [], error: null },
    });

    const result = await readConversionContext(
      context(client),
      ids.application,
    );
    expect(result).toEqual({
      stage: "pre_rpc_context_complete",
      checks: {
        applicationAccepted: true,
        applicationUnconverted: true,
        offerAccepted: true,
        mandatoryChecklistPending: 0,
        requiredDocumentsUnsatisfied: 0,
        guardianCount: 1,
        studentProfiles: 0,
        enrollments: 0,
        classMemberships: 0,
        guardianRelationships: 0,
      },
    });
    expect(calls).toEqual([
      "from:admission_applications",
      "from:admission_offers",
      "from:admission_checklist_items",
      "from:admission_application_documents",
      "from:admission_guardians",
      "from:student_profiles",
    ]);
    expect(from).toHaveBeenCalledTimes(6);
    expect("rpc" in client).toBe(false);
    expect("insert" in client).toBe(false);
    expect("update" in client).toBe(false);
    expect("delete" in client).toBe(false);
  });

  it("denies missing student-management authorization before any query", async () => {
    const { client, from } = readonlyClient({});
    await expect(
      readConversionContext(
        context(client, ["admissions.enroll"]),
        ids.application,
      ),
    ).rejects.toMatchObject({ stage: "student_authorization_denied" });
    expect(from).not.toHaveBeenCalled();
  });
});
