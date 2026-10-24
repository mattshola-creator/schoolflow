import { expect, it } from "vitest";
import { storageFailureCategory } from "./storage-diagnostics";
it.each([
  [{ status: 401 }, "storage_authentication"],
  [{ code: "PGRST301" }, "storage_authentication"],
  [{ code: "42501" }, "storage_privilege"],
  [{ status: 403 }, "storage_privilege"],
  [{ code: "42P01" }, "storage_schema"],
  [{ code: "PGRST205" }, "storage_schema"],
  [{ code: "PGRST106" }, "storage_schema"],
  [{ status: 500 }, "storage_data_api"],
])("classifies safe upstream metadata %j", (input, category) => {
  expect(storageFailureCategory(input)).toBe(category);
});
it("does not propagate arbitrary upstream content", () => {
  expect(storageFailureCategory({ code: "untrusted payload" })).toBe(
    "storage_data_api",
  );
});
