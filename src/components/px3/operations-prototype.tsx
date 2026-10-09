"use client";

import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Landmark,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  ExceptionCard,
  KpiCard,
  MobileRecordCards,
  PrototypeBanner,
  RecordCard,
  StickyPrototypeActions,
  WorkflowRail,
} from "@/components/px3/operations-patterns";

const perspectives = [
  "Organization Owner / Director",
  "Principal / Head Teacher",
  "Teacher / Class Teacher",
  "Admissions Officer",
  "Bursar / Finance Officer",
  "Assessment / Examination Officer",
  "Student Administrator / Registrar",
] as const;

const workspaces = [
  ["home", "Home", Building2],
  ["day", "My Day", ClipboardCheck],
  ["admin", "Administration", ShieldCheck],
  ["students", "Students", Users],
  ["admissions", "Admissions", GraduationCap],
  ["teaching", "Teaching & attendance", CalendarCheck],
  ["finance", "Finance", Landmark],
  ["assessment", "Assessment", BookOpenCheck],
] as const;

type Workspace = (typeof workspaces)[number][0];

const students = [
  {
    name: "Amara Okafor",
    number: "CBP-0261",
    className: "Primary 5 A",
    attendance: "96%",
    balance: "₦18,500.00",
    status: "Active",
  },
  {
    name: "Tobi Adeyemi",
    number: "CBP-0268",
    className: "Primary 5 A",
    attendance: "88%",
    balance: "₦0.00",
    status: "Follow-up",
  },
  {
    name: "Musa Ibrahim",
    number: "CBA-1142",
    className: "JSS 2 Gold",
    attendance: "93%",
    balance: "₦42,750.00",
    status: "Active",
  },
];

function HomeView({ school }: { school: string }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations overview"
        title={
          school === "All authorized schools"
            ? "Your school group today"
            : `${school} today`
        }
        description="A focused view of the work, exceptions and decisions that need attention now."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active learners"
          value={school === "All authorized schools" ? "1,284" : "684"}
          detail="Current enrollment"
          tone="success"
        />
        <KpiCard
          label="Attendance today"
          value="94.2%"
          detail="38 learners require follow-up"
        />
        <KpiCard
          label="Collections this term"
          value="₦24,680,450.00"
          detail="78.4% of billed value"
        />
        <KpiCard
          label="Pending decisions"
          value="12"
          detail="Across admissions, finance and results"
          tone="warning"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <SurfaceCard eyebrow="Needs attention" title="Operational exceptions">
          <div className="grid gap-3">
            <ExceptionCard
              urgent
              title="Attendance register overdue"
              detail="Primary 3 Blue has not submitted attendance for today."
              action="Review attendance"
            />
            <ExceptionCard
              title="Payment verification queue"
              detail="Four bank-transfer payments await independent verification."
              action="Open verification queue"
            />
            <ExceptionCard
              title="Result publication blocker"
              detail="JSS 2 Mathematics has one incomplete score sheet."
              action="View assessment readiness"
            />
          </div>
        </SurfaceCard>
        <SurfaceCard eyebrow="Approvals" title="Waiting for you">
          <ul className="divide-border divide-y">
            {[
              "2 admission decisions",
              "3 expense approvals",
              "1 result publication",
              "6 document reviews",
            ].map((item) => (
              <li
                key={item}
                className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm font-semibold text-slate-800"
              >
                <span>{item}</span>
                <span className="text-brand">Review</span>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}

function MyDayView({ perspective }: { perspective: string }) {
  const teacher = perspective.includes("Teacher");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personal workspace"
        title="My Day"
        description={`Prioritized for ${perspective}. Multiple responsibilities are combined without changing your underlying access.`}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard title="Now">
          <p className="text-2xl font-semibold text-slate-950">
            {teacher ? "Primary 5 English" : "12 items"}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {teacher
              ? "09:30–10:10 · Room P5A"
              : "Need attention across your responsibilities"}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Next">
          <p className="text-lg font-semibold text-slate-950">
            {teacher ? "Take class attendance" : "Admissions review meeting"}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">Due before 10:30</p>
        </SurfaceCard>
        <SurfaceCard title="Later">
          <p className="text-lg font-semibold text-slate-950">
            {teacher
              ? "Enter Continuous Assessment"
              : "Finance reconciliation review"}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Four related tasks grouped
          </p>
        </SurfaceCard>
      </div>
      <SurfaceCard eyebrow="Action Center" title="Prioritized work">
        <div className="space-y-3">
          {[
            [
              "Urgent",
              "Resolve attendance exception",
              "Primary 3 Blue · due now",
            ],
            [
              "Approval",
              "Verify bank transfer",
              "Receipt SF-2048 · ₦125,500.00",
            ],
            [
              "Review",
              "Confirm admission placement",
              "Amina Bello · Primary 2",
            ],
            [
              "Task",
              "Complete score sheet",
              "Primary 5 English · 28/31 scores",
            ],
          ].map(([tag, title, meta]) => (
            <div
              key={title}
              className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <StatusBadge tone={tag === "Urgent" ? "warning" : "neutral"}>
                {tag}
              </StatusBadge>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="text-muted-foreground text-sm">{meta}</p>
              </div>
              <Button variant="secondary">Open</Button>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}

function AdministrationView() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration center"
        title="Access that people can understand"
        description="Membership, responsibilities, permissions and module availability explained in everyday language."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <KpiCard
          label="Active members"
          value="126"
          detail="Across two authorized schools"
        />
        <KpiCard
          label="Pending invitations"
          value="4"
          detail="Two expire this week"
          tone="warning"
        />
        <KpiCard
          label="Available modules"
          value="11 of 16"
          detail="Per plan and school configuration"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <SurfaceCard title="Effective access">
          <div className="space-y-3">
            {[
              ["Ngozi Eze", "Principal · Admissions approver"],
              ["David Cole", "Teacher · Class teacher · Assessment entry"],
              ["Ife Adebayo", "Bursar · Payment verifier"],
            ].map(([name, access]) => (
              <div key={name} className="border-border rounded-xl border p-4">
                <p className="font-semibold">{name}</p>
                <p className="text-muted-foreground mt-1 text-sm">{access}</p>
                <p className="text-brand mt-2 text-xs font-semibold">
                  Access derives from membership + responsibility + school scope
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard title="Module availability">
          <div className="space-y-3">
            {[
              ["Finance", "Available", "Included and enabled"],
              ["Assessment", "Available", "Included and enabled"],
              ["Payroll", "Unavailable", "Not included in the current plan"],
              [
                "Platform Console",
                "Restricted",
                "Platform operator authorization required",
              ],
            ].map(([name, status, reason]) => (
              <div key={name} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="text-muted-foreground text-sm">{reason}</p>
                </div>
                <StatusBadge
                  tone={
                    status === "Available"
                      ? "success"
                      : status === "Unavailable"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

function StudentsView() {
  const [selected, setSelected] = useState(students[0]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student operations"
        title="Student register and Student 360"
        description="Find a learner quickly, then understand the complete authorized context without duplicating records."
      />
      <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search learners</span>
          <Search
            aria-hidden="true"
            className="text-muted-foreground absolute top-3 left-3 size-5"
          />
          <input
            className="border-border min-h-11 w-full rounded-xl border pr-3 pl-10"
            placeholder="Search name or student number"
          />
        </label>
        <select
          aria-label="Filter by class"
          className="border-border min-h-11 rounded-xl border bg-white px-3"
        >
          <option>All classes</option>
          <option>Primary 5 A</option>
          <option>JSS 2 Gold</option>
        </select>
      </div>
      <MobileRecordCards>
        {students.map((s) => (
          <button
            type="button"
            key={s.number}
            className="text-left"
            onClick={() => setSelected(s)}
          >
            <RecordCard
              title={s.name}
              meta={`${s.number} · ${s.className}`}
              status={s.status}
            >
              <p className="text-sm">
                Attendance {s.attendance} · Balance {s.balance}
              </p>
            </RecordCard>
          </button>
        ))}
      </MobileRecordCards>
      <div className="hidden md:block">
        <DataTable caption="Synthetic student register">
          <TableHead>
            <tr>
              <TableHeader>Learner</TableHeader>
              <TableHeader>Class</TableHeader>
              <TableHeader>Attendance</TableHeader>
              <TableHeader>Balance</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.number}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => setSelected(s)}
              >
                <TableCell>
                  <strong>{s.name}</strong>
                  <br />
                  <span className="text-xs">{s.number}</span>
                </TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.attendance}</TableCell>
                <TableCell>{s.balance}</TableCell>
                <TableCell>
                  <StatusBadge>{s.status}</StatusBadge>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      <SurfaceCard eyebrow="Student 360" title={selected.name}>
        <div className="flex flex-wrap gap-2">
          {[
            "Overview",
            "Guardians",
            "Academics",
            "Attendance",
            "Finance",
            "Results",
            "Documents",
            "History",
          ].map((tab, i) => (
            <button
              type="button"
              key={tab}
              className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${i === 0 ? "bg-brand-soft text-brand-strong" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">
              Primary guardian
            </p>
            <p className="mt-1 font-semibold">Chidi Okafor</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">
              Enrollment
            </p>
            <p className="mt-1 font-semibold">{selected.className} · Active</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">
              Attendance
            </p>
            <p className="mt-1 font-semibold">{selected.attendance}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">
              Current balance
            </p>
            <p className="mt-1 font-semibold">{selected.balance}</p>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

function AdmissionsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admissions"
        title="Every applicant’s next step is clear"
        description="A visual pipeline over the existing admissions state machine—from enquiry through enrollment."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Enquiry", "18"],
          ["Submitted", "12"],
          ["Review", "7"],
          ["Assessment", "9"],
          ["Offer", "5"],
          ["Ready", "3"],
        ].map(([s, n]) => (
          <div
            key={s}
            className="border-border bg-surface rounded-xl border p-4"
          >
            <p className="text-2xl font-semibold">{n}</p>
            <p className="text-muted-foreground text-sm">{s}</p>
          </div>
        ))}
      </div>
      <SurfaceCard eyebrow="Applicant 360" title="Amina Bello · APP-2026-0142">
        <WorkflowRail
          steps={[
            "Submitted",
            "Reviewed",
            "Assessed",
            "Approved",
            "Offer accepted",
            "Enrollment",
          ]}
          current={4}
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <KpiCard
            label="Required documents"
            value="3 of 3"
            detail="Verified"
            tone="success"
          />
          <KpiCard
            label="Placement"
            value="Primary 2"
            detail="Cedarbridge Primary"
          />
          <KpiCard
            label="Conversion readiness"
            value="Ready"
            detail="All mandatory checks complete"
            tone="success"
          />
        </div>
        <StickyPrototypeActions>
          <Button variant="secondary">View checklist</Button>
          <Button>Preview student conversion</Button>
        </StickyPrototypeActions>
      </SurfaceCard>
    </div>
  );
}

function TeachingView() {
  const [marked, setMarked] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Teaching"
        title="Today’s classes, attendance and learning"
        description="Designed for fast tablet and mobile use without weakening submission controls."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard title="09:30 · Primary 5 English">
          <p className="text-muted-foreground text-sm">
            31 learners · Room P5A
          </p>
          <Button className="mt-4 w-full">Open class workspace</Button>
        </SurfaceCard>
        <SurfaceCard title="11:00 · JSS 2 Literature">
          <p className="text-muted-foreground text-sm">
            28 learners · Room J2G
          </p>
          <Button variant="secondary" className="mt-4 w-full">
            View lesson plan
          </Button>
        </SurfaceCard>
        <SurfaceCard title="Teaching summary">
          <p className="text-2xl font-semibold">4 of 5</p>
          <p className="text-muted-foreground text-sm">
            Lesson plans approved this week
          </p>
        </SurfaceCard>
      </div>
      <SurfaceCard eyebrow="Fast attendance" title="Primary 5 A · Today">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={() => setMarked(true)}>Mark all present</Button>
          <Button variant="secondary">Show exceptions only</Button>
        </div>
        <div className="space-y-2">
          {students.slice(0, 2).map((s, i) => (
            <div
              key={s.number}
              className="border-border flex items-center gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="text-muted-foreground text-xs">{s.number}</p>
              </div>
              <select
                aria-label={`Attendance status for ${s.name}`}
                className="border-border min-h-11 rounded-lg border bg-white px-3"
              >
                <option>{marked ? "Present" : i ? "Late" : "Present"}</option>
                <option>Absent</option>
                <option>Late</option>
                <option>Excused</option>
              </select>
            </div>
          ))}
        </div>
        <StickyPrototypeActions>
          <span className="mr-auto self-center text-sm text-slate-600">
            Prototype only · submission disabled
          </span>
          <Button variant="secondary">Save draft preview</Button>
          <Button disabled>Submit register</Button>
        </StickyPrototypeActions>
      </SurfaceCard>
    </div>
  );
}

function FinanceView() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance operations"
        title="Collections, verification and exceptions"
        description="Exact-decimal examples preserve the M9 separation between recording, verification and allocation."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Billed this term"
          value="₦31,480,000.00"
          detail="Authoritative billed value"
        />
        <KpiCard
          label="Allocated payments"
          value="₦24,680,450.00"
          detail="78.4% collected"
          tone="success"
        />
        <KpiCard
          label="Outstanding"
          value="₦6,799,550.00"
          detail="Across 186 learners"
          tone="warning"
        />
        <KpiCard
          label="Awaiting verification"
          value="₦318,750.00"
          detail="4 payments · separate verifier"
          tone="warning"
        />
      </div>
      <SurfaceCard title="Payment verification queue">
        <div className="hidden md:block">
          <DataTable caption="Synthetic payment verification queue">
            <TableHead>
              <tr>
                <TableHeader>Reference</TableHeader>
                <TableHeader>Payer</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Recorded by</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {[
                ["SF-2048", "Amara Okafor", "₦125,500.00", "M. Yusuf"],
                ["SF-2051", "Musa Ibrahim", "₦94,250.00", "M. Yusuf"],
                ["SF-2054", "Tobi Adeyemi", "₦99,000.00", "E. James"],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c) => (
                    <TableCell key={c}>{c}</TableCell>
                  ))}
                  <TableCell>
                    <StatusBadge tone="warning">
                      Awaiting verification
                    </StatusBadge>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
        <MobileRecordCards>
          {[
            ["SF-2048", "Amara Okafor", "₦125,500.00"],
            ["SF-2051", "Musa Ibrahim", "₦94,250.00"],
          ].map((r) => (
            <RecordCard
              key={r[0]}
              title={r[1]}
              meta={`${r[0]} · ${r[2]}`}
              status="Verify"
            />
          ))}
        </MobileRecordCards>
        <StickyPrototypeActions>
          <span className="mr-auto self-center text-sm text-slate-600">
            No production mutation is connected.
          </span>
          <Button disabled>Verify selected payment</Button>
        </StickyPrototypeActions>
      </SurfaceCard>
    </div>
  );
}

function AssessmentView() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessment and results"
        title="Know what is ready—and what is blocking publication"
        description="Scores remain draft until the existing server-authoritative workflow validates, reviews, approves and publishes them."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Score sheets" value="42" detail="Current term" />
        <KpiCard
          label="Submitted"
          value="34"
          detail="81% complete"
          tone="success"
        />
        <KpiCard
          label="Review blockers"
          value="3"
          detail="Missing or invalid entries"
          tone="warning"
        />
        <KpiCard label="Published" value="18" detail="Immutable snapshots" />
      </div>
      <SurfaceCard
        eyebrow="Score entry reference"
        title="Primary 5 A · English"
      >
        <div className="hidden overflow-x-auto md:block">
          <DataTable caption="Synthetic score entry sheet">
            <TableHead>
              <tr>
                <TableHeader>Learner</TableHeader>
                <TableHeader>CA 1 / 20</TableHeader>
                <TableHeader>CA 2 / 20</TableHeader>
                <TableHeader>Exam / 60</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Grade</TableHeader>
              </tr>
            </TableHead>
            <tbody>
              {[
                ["Amara Okafor", "17", "18", "52", "87", "A"],
                ["Tobi Adeyemi", "14", "16", "43", "73", "B"],
                ["Musa Ibrahim", "12", "15", "", "—", "Draft"],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <TableCell key={`${r[0]}-${i}`}>
                      {i > 0 && i < 4 ? (
                        <input
                          aria-label={`${r[0]} ${["", "CA 1", "CA 2", "Exam"][i]}`}
                          value={c}
                          readOnly
                          className="border-border w-20 rounded-lg border px-2 py-2"
                        />
                      ) : (
                        c
                      )}
                    </TableCell>
                  ))}
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
        <MobileRecordCards>
          <RecordCard
            title="Amara Okafor"
            meta="17 + 18 + 52 = 87"
            status="A"
          />
          <RecordCard
            title="Musa Ibrahim"
            meta="Exam score missing"
            status="Draft"
          />
        </MobileRecordCards>
        <StickyPrototypeActions>
          <span className="mr-auto self-center text-sm text-slate-600">
            1 blocker · server calculation remains authoritative
          </span>
          <Button variant="secondary">Save draft preview</Button>
          <Button disabled>Submit score sheet</Button>
        </StickyPrototypeActions>
      </SurfaceCard>
      <SurfaceCard title="Publication readiness">
        <WorkflowRail
          steps={["Draft", "Submitted", "Reviewed", "Approved", "Published"]}
          current={2}
        />
        <p className="text-muted-foreground mt-4 text-sm">
          A published snapshot from the previous term is available for
          authorized report-card viewing. This draft cannot replace it.
        </p>
      </SurfaceCard>
    </div>
  );
}

export function OperationsPrototype() {
  const [perspective, setPerspective] = useState<(typeof perspectives)[number]>(
    perspectives[0],
  );
  const [school, setSchool] = useState("All authorized schools");
  const [workspace, setWorkspace] = useState<Workspace>("home");
  const content = useMemo(
    () =>
      ({
        home: <HomeView school={school} />,
        day: <MyDayView perspective={perspective} />,
        admin: <AdministrationView />,
        students: <StudentsView />,
        admissions: <AdmissionsView />,
        teaching: <TeachingView />,
        finance: <FinanceView />,
        assessment: <AssessmentView />,
      })[workspace],
    [workspace, school, perspective],
  );
  return (
    <>
      <PrototypeBanner />
      <section
        aria-label="Prototype controls"
        className="border-border bg-surface mb-5 grid gap-4 rounded-2xl border p-4 shadow-sm lg:grid-cols-[1fr_1fr_auto]"
      >
        <label className="text-sm font-semibold text-slate-700">
          Perspective
          <select
            value={perspective}
            onChange={(e) =>
              setPerspective(e.target.value as typeof perspective)
            }
            className="border-border mt-1 min-h-11 w-full rounded-xl border bg-white px-3 font-normal"
          >
            {perspectives.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Operating scope
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="border-border mt-1 min-h-11 w-full rounded-xl border bg-white px-3 font-normal"
          >
            <option>All authorized schools</option>
            <option>Cedarbridge Primary School</option>
            <option>Cedarbridge Academy</option>
            <option disabled>Northgate School — access required</option>
          </select>
        </label>
        <div className="self-end rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <BriefcaseBusiness
            aria-hidden="true"
            className="mr-2 inline size-4"
          />
          Multi-responsibility preview
        </div>
      </section>
      <nav
        aria-label="School operations prototypes"
        className="border-border mb-6 flex gap-2 overflow-x-auto border-b pb-2"
      >
        {workspaces.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            aria-current={workspace === id ? "page" : undefined}
            onClick={() => setWorkspace(id)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold ${workspace === id ? "bg-brand text-white" : "hover:bg-surface bg-white text-slate-700"}`}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </button>
        ))}
      </nav>
      {content}
    </>
  );
}
