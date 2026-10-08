import { ArrowRight, CheckCircle2, Clock3, UsersRound } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import {
  FormField,
  TextInput,
  inputClassName,
} from "@/components/ui/form-field";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Tab, Tabs } from "@/components/ui/tabs";

const learners = [
  {
    name: "Amina Yusuf",
    level: "Primary 4",
    status: "Active",
    attendance: "96%",
  },
  { name: "David Okon", level: "JSS 2", status: "Review", attendance: "88%" },
  {
    name: "Chisom Eze",
    level: "Nursery 2",
    status: "Active",
    attendance: "94%",
  },
];

export default function ExperiencePreviewPage() {
  return (
    <main>
      <PageHeader
        eyebrow="PX1 reference experience"
        title="A calmer way to run the school day"
        description="A bounded, synthetic demonstration of Design System v2, the responsive shell and shared interaction patterns. It does not change operational records."
        actions={
          <>
            <ButtonLink href="/dashboard" variant="secondary">
              Return home
            </ButtonLink>
            <Dialog
              triggerLabel="Open reference dialog"
              title="Review learner status"
              description="Native dialog behavior with an explicit close control and backdrop dismissal."
            >
              <p className="text-sm leading-6 text-slate-600">
                This reference confirms spacing, hierarchy, focus treatment and
                touch targets. No production mutation is attached.
              </p>
              <div className="mt-5 flex justify-end">
                <Button type="button">Acknowledge</Button>
              </div>
            </Dialog>
          </>
        }
      />

      <section
        className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
        aria-label="Reference key indicators"
      >
        {[
          ["Active learners", "1,248", UsersRound],
          ["Attendance today", "94.2%", CheckCircle2],
          ["Actions due", "12", Clock3],
          ["Setup health", "Ready", CheckCircle2],
        ].map(([label, value, Icon]) => (
          <SurfaceCard key={String(label)} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {String(label)}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {String(value)}
                </p>
              </div>
              <span className="bg-tenant-accent-soft text-tenant-accent grid size-10 place-items-center rounded-xl">
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <section className="mt-6 grid gap-5 sm:mt-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] xl:gap-6">
        <SurfaceCard eyebrow="Register pattern" title="Learner overview">
          <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]">
            <label className="sr-only" htmlFor="reference-search">
              Search learners
            </label>
            <TextInput
              id="reference-search"
              type="search"
              placeholder="Search learners"
            />
            <label className="sr-only" htmlFor="reference-level">
              Filter by level
            </label>
            <select id="reference-level" className={inputClassName}>
              <option>All levels</option>
              <option>Primary</option>
              <option>Secondary</option>
            </select>
            <Button type="button" variant="secondary">
              Apply filters
            </Button>
          </div>
          <div className="hidden md:block">
            <DataTable caption="Synthetic learner reference data">
              <TableHead>
                <tr>
                  <TableHeader>Learner</TableHeader>
                  <TableHeader>Class</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Attendance</TableHeader>
                </tr>
              </TableHead>
              <tbody>
                {learners.map((learner) => (
                  <tr key={learner.name}>
                    <TableCell>
                      <span className="font-semibold text-slate-900">
                        {learner.name}
                      </span>
                    </TableCell>
                    <TableCell>{learner.level}</TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={
                          learner.status === "Active" ? "success" : "warning"
                        }
                      >
                        {learner.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{learner.attendance}</TableCell>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
          <ul
            className="divide-border border-border divide-y rounded-xl border md:hidden"
            aria-label="Synthetic learner reference data"
          >
            {learners.map((learner) => (
              <li key={learner.name} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {learner.name}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {learner.level}
                    </p>
                  </div>
                  <StatusBadge
                    tone={learner.status === "Active" ? "success" : "warning"}
                  >
                    {learner.status}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Attendance{" "}
                  <strong className="text-slate-900">
                    {learner.attendance}
                  </strong>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3 md:hidden">
            <p className="text-xs leading-5 text-slate-500">
              Common learner details use mobile cards; complex registers retain
              the standard controlled-scroll table pattern.
            </p>
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Form pattern" title="Create a focused task">
          <form className="space-y-5">
            <FormField
              htmlFor="task-title"
              label="Task title"
              required
              description="Use a short, action-oriented description."
            >
              <TextInput
                id="task-title"
                placeholder="Review attendance exceptions"
              />
            </FormField>
            <FormField htmlFor="task-owner" label="Responsible team">
              <select id="task-owner" className={inputClassName}>
                <option>Academic office</option>
                <option>School administration</option>
                <option>Finance office</option>
              </select>
            </FormField>
            <FormField
              htmlFor="task-note"
              label="Reference validation"
              error="This example demonstrates a clear inline error."
            >
              <TextInput
                id="task-note"
                aria-invalid="true"
                aria-describedby="task-note-error"
                defaultValue="Needs a due date"
              />
            </FormField>
            <Button type="button" className="w-full sm:w-auto">
              Create reference task{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </form>
        </SurfaceCard>
      </section>

      <SurfaceCard
        className="mt-6 sm:mt-8"
        eyebrow="Tabs and status"
        title="Interaction patterns"
      >
        <Tabs label="Reference sections">
          <Tab selected>Overview</Tab>
          <Tab>Activity</Tab>
          <Tab>Documents</Tab>
          <Tab>History</Tab>
        </Tabs>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatePanel
            kind="empty"
            title="Nothing here yet"
            description="Create the first item when this workspace is ready."
          />
          <StatePanel
            kind="unauthorized"
            title="Permission required"
            description="Your role does not grant access to this action."
          />
          <StatePanel
            kind="unentitled"
            title="Not in the current plan"
            description="Ask an authorized administrator about module availability."
          />
          <StatePanel
            kind="setup"
            title="Setup required"
            description="Complete academic setup before continuing."
          />
        </div>
      </SurfaceCard>

      <section
        id="guidance"
        className="mt-6 grid gap-5 sm:mt-8 lg:grid-cols-2 lg:gap-6"
      >
        <SurfaceCard eyebrow="Loading" title="Predictable feedback">
          <LoadingSkeleton />
        </SurfaceCard>
        <SurfaceCard eyebrow="Guidance" title="What this reference proves">
          <ul className="space-y-3 text-sm leading-6 text-slate-600">
            <li>• Navigation remains permission and entitlement derived.</li>
            <li>
              • Context values come from the server-validated active workspace.
            </li>
            <li>
              • Tenant accenting is restrained and preserves neutral reading
              surfaces.
            </li>
            <li>
              • Keyboard focus, reduced motion and 44px touch targets are
              foundational.
            </li>
            <li>• Operational modules are not migrated in PX1.</li>
          </ul>
        </SurfaceCard>
      </section>
    </main>
  );
}
