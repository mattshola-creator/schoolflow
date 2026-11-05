import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DataTable, TableHead, TableHeader, TableCell } from "./data-table";

afterEach(cleanup);
it("provides keyboard access to overflowing records without replacing table semantics", () => {
  render(
    <DataTable caption="Authorized class register">
      <TableHead>
        <tr>
          <TableHeader>Student</TableHeader>
        </tr>
      </TableHead>
      <tbody>
        <tr>
          <TableCell>Fictional learner</TableCell>
        </tr>
      </tbody>
    </DataTable>,
  );
  expect(
    screen.getByRole("region", {
      name: "Authorized class register · scrollable table",
    }),
  ).toHaveAttribute("tabindex", "0");
  expect(
    screen.getByRole("table", { name: "Authorized class register" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("columnheader", { name: "Student" }),
  ).toBeInTheDocument();
});
