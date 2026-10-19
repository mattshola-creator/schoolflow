import { describe, expect, it } from "vitest";
import { publishedReportResults } from "./published-report";

const score = {
  student_id: "student-1",
  weighted_percent: 72,
  total_score: 72,
  grade: "A",
  remark: "Excellent",
  is_pass: true,
};

describe("published report identity", () => {
  it("renders only identity captured in that publication", () => {
    const snapshot = {
      schemaVersion: 2,
      results: [
        {
          ...score,
          student_identity: {
            firstName: "Nia",
            lastName: "Mensah",
            studentNumber: "QA-007",
          },
        },
      ],
    };
    expect(publishedReportResults(snapshot)[0]).toMatchObject({
      studentName: "Nia Mensah",
      studentNumber: "QA-007",
      total_score: 72,
    });
  });
  it("retains legacy versions without inventing historical names", () => {
    expect(publishedReportResults({ results: [score] })[0]).toMatchObject({
      studentName: null,
      studentNumber: null,
      student_id: "student-1",
    });
  });
  it("does not partially trust malformed captured identity", () => {
    expect(
      publishedReportResults({
        results: [{ ...score, student_identity: { firstName: "Nia" } }],
      })[0].studentName,
    ).toBeNull();
  });
  it("rejects malformed snapshot result rows", () => {
    expect(
      publishedReportResults({
        results: [
          { student_id: "bad" },
          { ...score, total_score: "72" },
          score,
        ],
      }),
    ).toHaveLength(1);
    expect(publishedReportResults(null)).toEqual([]);
    expect(publishedReportResults([])).toEqual([]);
  });
});
