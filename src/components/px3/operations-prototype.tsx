"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { ApplicationShell } from "@/components/application-shell";
import { ContextRibbon } from "@/components/context-ribbon";
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
import {
  formatMoney,
  getScopedRolePresentation,
  getScopeFixture,
  percentage,
  perspectiveOptions,
  scopeOptions,
  type PerspectiveId,
  type ScopeId,
} from "@/components/px3/operations-fixtures";

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

function HomeView({
  scopeId,
  perspective,
}: {
  scopeId: ScopeId;
  perspective: PerspectiveId;
}) {
  const scope = getScopeFixture(scopeId);
  const role = getScopedRolePresentation(scopeId, perspective);
  const outstanding = scope.billedCents - scope.collectedCents;
  const roleMetrics = {
    owner: [
      [
        "Active learners",
        scope.learners.toLocaleString(),
        "Current enrollment",
      ],
      [
        "Attendance today",
        percentage(scope.present, scope.learners),
        `${scope.attendanceFollowUps} follow-ups`,
      ],
      [
        "Collections this term",
        formatMoney(scope.collectedCents),
        `${percentage(scope.collectedCents, scope.billedCents)} of billed value`,
      ],
      [
        "Pending decisions",
        String(scope.pendingApprovals),
        "Across authorized workflows",
      ],
    ],
    principal: [
      [
        "Learners present",
        scope.present.toLocaleString(),
        `${percentage(scope.present, scope.learners)} attendance`,
      ],
      [
        "Attendance follow-ups",
        String(scope.attendanceFollowUps),
        "Require school action",
      ],
      [
        "Registers overdue",
        String(scope.overdueRegisters),
        "Teaching operations",
      ],
      [
        "School approvals",
        String(scope.pendingApprovals),
        "Awaiting leadership",
      ],
    ],
    teacher: [
      ["Classes today", scopeId === "academy" ? "4" : "5", "Your timetable"],
      [
        "Learners to follow up",
        String(Math.min(scope.attendanceFollowUps, 8)),
        "Assigned classes",
      ],
      [
        "Plans approved",
        `${scope.lessonPlansApproved}/${scope.lessonPlansTotal}`,
        "Current week",
      ],
      [
        "Score blockers",
        String(scope.assessmentBlockers),
        "Your assigned subjects",
      ],
    ],
    admissions: [
      [
        "Open applications",
        String(scope.admissionStages.slice(0, 4).reduce((a, b) => a + b, 0)),
        "Enquiry through assessment",
      ],
      [
        "Awaiting review",
        String(scope.admissionStages[2]),
        "Document and eligibility checks",
      ],
      ["Offers issued", String(scope.admissionStages[4]), "Current intake"],
      [
        "Ready to enroll",
        String(scope.admissionStages[5]),
        "All checks complete",
      ],
    ],
    bursar: [
      [
        "Billed this term",
        formatMoney(scope.billedCents),
        "Authoritative billed value",
      ],
      [
        "Collected",
        formatMoney(scope.collectedCents),
        `${percentage(scope.collectedCents, scope.billedCents)} allocated`,
      ],
      ["Outstanding", formatMoney(outstanding), "Current balance"],
      [
        "Awaiting verification",
        String(scope.verificationCount),
        formatMoney(scope.verificationCents),
      ],
    ],
    assessment: [
      ["Score sheets", String(scope.scoreSheets), "Current term"],
      [
        "Submitted",
        String(scope.submittedSheets),
        percentage(scope.submittedSheets, scope.scoreSheets),
      ],
      [
        "Review blockers",
        String(scope.assessmentBlockers),
        "Missing or invalid entries",
      ],
      [
        "Published snapshots",
        String(scope.publishedSnapshots),
        "Immutable results",
      ],
    ],
    registrar: [
      [
        "Active learners",
        scope.learners.toLocaleString(),
        "Current enrollment",
      ],
      [
        "Records to follow up",
        String(scope.attendanceFollowUps),
        "Attendance-linked checks",
      ],
      [
        "Ready to enroll",
        String(scope.admissionStages[5]),
        "Admissions conversion",
      ],
      [
        "Pending approvals",
        String(scope.pendingApprovals),
        "Student record actions",
      ],
    ],
  } satisfies Record<PerspectiveId, string[][]>;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={role.eyebrow}
        title={role.title}
        description={role.description}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {roleMetrics[perspective].map(([label, value, detail], index) => (
          <KpiCard
            key={label}
            label={label}
            value={value}
            detail={detail}
            tone={index === 3 ? "warning" : index === 1 ? "success" : undefined}
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <SurfaceCard eyebrow="Needs attention" title="Operational exceptions">
          <div className="grid gap-3">
            {role.tasks.map((task, index) => (
              <ExceptionCard
                key={task}
                urgent={index === 0}
                title={task}
                detail={`${scope.shortLabel} · ${index === 0 ? "Priority today" : scopeId === "all" ? "Across authorized schools" : "School-scoped responsibility"}`}
                action="Open reference workspace"
              />
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard eyebrow="Approvals" title="Waiting for you">
          <ul className="divide-border divide-y">
            {[
              `${scope.admissionStages[2]} admission reviews`,
              `${scope.verificationCount} payment verifications`,
              `${scope.assessmentBlockers} assessment blockers`,
              `${scope.pendingApprovals} total scoped decisions`,
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

function MyDayView({
  perspective,
  scopeId,
}: {
  perspective: PerspectiveId;
  scopeId: ScopeId;
}) {
  const scope = getScopeFixture(scopeId);
  const role = getScopedRolePresentation(scopeId, perspective);
  const teacher = perspective === "teacher";
  const taskCategory: Record<PerspectiveId, string> = {
    owner: "Decision",
    principal: "Leadership",
    teacher: "Teaching",
    admissions: "Admissions",
    bursar: "Finance",
    assessment: "Assessment",
    registrar: "Student records",
  };
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personal workspace"
        title="My Day"
        description={`Prioritized for ${perspectiveOptions.find((option) => option.id === perspective)?.label} in ${scope.label}. Multiple responsibilities are combined without changing your underlying access.`}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard title="Now">
          <p className="text-2xl font-semibold text-slate-950">
            {teacher
              ? scopeId === "academy"
                ? "JSS 2 Literature"
                : "Primary 5 English"
              : `${scope.pendingApprovals} items`}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {teacher
              ? scopeId === "academy"
                ? "09:30–10:10 · Room J2G"
                : "09:30–10:10 · Room P5A"
              : "Need attention across your responsibilities"}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Next">
          <p className="text-lg font-semibold text-slate-950">
            {teacher ? "Take class attendance" : role.tasks[0]}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">Due before 10:30</p>
        </SurfaceCard>
        <SurfaceCard title="Later">
          <p className="text-lg font-semibold text-slate-950">
            {teacher ? "Enter Continuous Assessment" : role.tasks[1]}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Four related tasks grouped
          </p>
        </SurfaceCard>
      </div>
      <SurfaceCard eyebrow="Action Center" title="Prioritized work">
        <div className="space-y-3">
          {role.tasks.map((title, index) => (
            <div
              key={title}
              className="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
            >
              <StatusBadge tone={index === 0 ? "warning" : "neutral"}>
                {index === 0 ? "Priority" : taskCategory[perspective]}
              </StatusBadge>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="text-muted-foreground text-sm">
                  {scope.shortLabel} ·{" "}
                  {index === 0 ? "Due now" : "Combined responsibility view"}
                </p>
              </div>
              <Button variant="secondary">Open</Button>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}

function AdministrationView({ scopeId }: { scopeId: ScopeId }) {
  const scope = getScopeFixture(scopeId);
  const accessRows =
    scopeId === "primary"
      ? [["Ngozi Eze", "Principal · Admissions approver"]]
      : scopeId === "academy"
        ? [
            ["David Cole", "Teacher · Class teacher · Assessment entry"],
            ["Ife Adebayo", "Bursar · Payment verifier"],
          ]
        : [
            ["Ngozi Eze", "Principal · Admissions approver"],
            ["David Cole", "Teacher · Class teacher · Assessment entry"],
            ["Ife Adebayo", "Bursar · Payment verifier"],
          ];
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
          value={String(scope.activeMembers)}
          detail={
            scopeId === "all"
              ? "Across two authorized schools"
              : scope.shortLabel
          }
        />
        <KpiCard
          label="Pending invitations"
          value={String(scope.pendingInvitations)}
          detail={`${scope.pendingInvitations} require follow-up`}
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
            {accessRows.map(([name, access]) => (
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

function StudentsView({ scopeId }: { scopeId: ScopeId }) {
  const students = getScopeFixture(scopeId).students;
  const [selectedNumber, setSelectedNumber] = useState(students[0].number);
  const selected =
    students.find((student) => student.number === selectedNumber) ??
    students[0];
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
            onClick={() => setSelectedNumber(s.number)}
          >
            <RecordCard
              title={s.name}
              meta={`${s.number} · ${s.className}`}
              status={s.status}
            >
              <p className="text-sm">
                Attendance {s.attendance} · Balance{" "}
                {formatMoney(s.balanceCents)}
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
                onClick={() => setSelectedNumber(s.number)}
              >
                <TableCell>
                  <strong>{s.name}</strong>
                  <br />
                  <span className="text-xs">{s.number}</span>
                </TableCell>
                <TableCell>{s.className}</TableCell>
                <TableCell>{s.attendance}</TableCell>
                <TableCell>{formatMoney(s.balanceCents)}</TableCell>
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
            <p className="mt-1 font-semibold">{selected.guardian}</p>
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
            <p className="mt-1 font-semibold">
              {formatMoney(selected.balanceCents)}
            </p>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

function AdmissionsView({ scopeId }: { scopeId: ScopeId }) {
  const scope = getScopeFixture(scopeId);
  const applicant =
    scopeId === "academy"
      ? "Daniel Mensah · APP-2026-0204"
      : "Amina Bello · APP-2026-0142";
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admissions"
        title="Every applicant’s next step is clear"
        description="A visual pipeline over the existing admissions state machine—from enquiry through enrollment."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {["Enquiry", "Submitted", "Review", "Assessment", "Offer", "Ready"].map(
          (s, index) => (
            <div
              key={s}
              className="border-border bg-surface rounded-xl border p-4"
            >
              <p className="text-2xl font-semibold">
                {scope.admissionStages[index]}
              </p>
              <p className="text-muted-foreground text-sm">{s}</p>
            </div>
          ),
        )}
      </div>
      <SurfaceCard eyebrow="Applicant 360" title={applicant}>
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
            value={scopeId === "academy" ? "JSS 1" : "Primary 2"}
            detail={scope.shortLabel}
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

function TeachingView({ scopeId }: { scopeId: ScopeId }) {
  const scope = getScopeFixture(scopeId);
  const students = scope.students;
  const [marked, setMarked] = useState(false);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My Teaching"
        title="Today’s classes, attendance and learning"
        description="Designed for fast tablet and mobile use without weakening submission controls."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <SurfaceCard
          title={
            scopeId === "academy"
              ? "09:30 · JSS 2 Literature"
              : "09:30 · Primary 5 English"
          }
        >
          <p className="text-muted-foreground text-sm">
            {scopeId === "academy"
              ? "28 learners · Room J2G"
              : "31 learners · Room P5A"}
          </p>
          <Button className="mt-4 w-full">Open class workspace</Button>
        </SurfaceCard>
        <SurfaceCard
          title={
            scopeId === "primary"
              ? "11:00 · Primary 4 Mathematics"
              : scopeId === "academy"
                ? "11:00 · SS 1 English"
                : "11:00 · JSS 2 Literature"
          }
        >
          <p className="text-muted-foreground text-sm">
            {scopeId === "primary"
              ? "30 learners · Room P4B"
              : scopeId === "academy"
                ? "26 learners · Room S1B"
                : "28 learners · Room J2G"}
          </p>
          <Button variant="secondary" className="mt-4 w-full">
            View lesson plan
          </Button>
        </SurfaceCard>
        <SurfaceCard title="Teaching summary">
          <p className="text-2xl font-semibold">
            {scope.lessonPlansApproved} of {scope.lessonPlansTotal}
          </p>
          <p className="text-muted-foreground text-sm">
            Lesson plans approved this week
          </p>
        </SurfaceCard>
      </div>
      <SurfaceCard
        eyebrow="Fast attendance"
        title={`${scopeId === "academy" ? "JSS 2 Gold" : "Primary 5 A"} · Today`}
      >
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

function FinanceView({ scopeId }: { scopeId: ScopeId }) {
  const scope = getScopeFixture(scopeId);
  const paymentRows = scope.students.map((student, index) => [
    `${scopeId === "academy" ? "SFA" : "SFP"}-${2048 + index}`,
    student.name,
    formatMoney(
      index === 0
        ? scope.verificationCents
        : Math.round(scope.verificationCents / 3),
    ),
    scopeId === "academy" ? "E. James" : "M. Yusuf",
  ]);
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
          value={formatMoney(scope.billedCents)}
          detail="Authoritative billed value"
        />
        <KpiCard
          label="Allocated payments"
          value={formatMoney(scope.collectedCents)}
          detail={`${percentage(scope.collectedCents, scope.billedCents)} collected`}
          tone="success"
        />
        <KpiCard
          label="Outstanding"
          value={formatMoney(scope.billedCents - scope.collectedCents)}
          detail={`Across ${scope.attendanceFollowUps + 52} learners`}
          tone="warning"
        />
        <KpiCard
          label="Awaiting verification"
          value={formatMoney(scope.verificationCents)}
          detail={`${scope.verificationCount} payments · separate verifier`}
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
              {paymentRows.map((r) => (
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
          {paymentRows.map((r) => (
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

function AssessmentView({ scopeId }: { scopeId: ScopeId }) {
  const scope = getScopeFixture(scopeId);
  const scoreRows = scope.students.map((student, index) => [
    student.name,
    index === 0 ? "17" : "14",
    index === 0 ? "18" : "16",
    index === 0 ? "52" : "",
    index === 0 ? "87" : "—",
    index === 0 ? "A" : "Draft",
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessment and results"
        title="Know what is ready—and what is blocking publication"
        description="Scores remain draft until the existing server-authoritative workflow validates, reviews, approves and publishes them."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Score sheets"
          value={String(scope.scoreSheets)}
          detail="Current term"
        />
        <KpiCard
          label="Submitted"
          value={String(scope.submittedSheets)}
          detail={`${percentage(scope.submittedSheets, scope.scoreSheets)} complete`}
          tone="success"
        />
        <KpiCard
          label="Review blockers"
          value={String(scope.assessmentBlockers)}
          detail="Missing or invalid entries"
          tone="warning"
        />
        <KpiCard
          label="Published"
          value={String(scope.publishedSnapshots)}
          detail="Immutable snapshots"
        />
      </div>
      <SurfaceCard
        eyebrow="Score entry reference"
        title={
          scopeId === "academy"
            ? "JSS 2 Gold · Literature"
            : "Primary 5 A · English"
        }
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
              {scoreRows.map((r) => (
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
            title={scope.students[0].name}
            meta="17 + 18 + 52 = 87"
            status="A"
          />
          <RecordCard
            title={scope.students[1].name}
            meta="Exam score missing"
            status="Draft"
          />
        </MobileRecordCards>
        <StickyPrototypeActions>
          <span className="mr-auto self-center text-sm text-slate-600">
            {scope.assessmentBlockers} blocker
            {scope.assessmentBlockers === 1 ? "" : "s"} · server calculation
            remains authoritative
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
  const [perspective, setPerspective] = useState<PerspectiveId>("owner");
  const [scopeId, setScopeId] = useState<ScopeId>("all");
  const [workspace, setWorkspace] = useState<Workspace>("home");
  const workspaceButtons = useRef<
    Partial<Record<Workspace, HTMLButtonElement | null>>
  >({});
  const scope = getScopeFixture(scopeId);
  useEffect(() => {
    const activeButton = workspaceButtons.current[workspace];
    if (!activeButton) return;
    activeButton.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [workspace]);

  function moveWorkspace(current: Workspace, direction: -1 | 1) {
    const currentIndex = workspaces.findIndex(([id]) => id === current);
    const nextIndex =
      (currentIndex + direction + workspaces.length) % workspaces.length;
    const next = workspaces[nextIndex][0];
    setWorkspace(next);
    workspaceButtons.current[next]?.focus();
  }
  const content = useMemo(
    () =>
      ({
        home: <HomeView scopeId={scopeId} perspective={perspective} />,
        day: <MyDayView perspective={perspective} scopeId={scopeId} />,
        admin: <AdministrationView scopeId={scopeId} />,
        students: <StudentsView key={scopeId} scopeId={scopeId} />,
        admissions: <AdmissionsView scopeId={scopeId} />,
        teaching: <TeachingView scopeId={scopeId} />,
        finance: <FinanceView scopeId={scopeId} />,
        assessment: <AssessmentView scopeId={scopeId} />,
      })[workspace],
    [workspace, scopeId, perspective],
  );
  const activeContext = {
    organizationId: "synthetic-cedarbridge",
    organizationName: "Cedarbridge Learning Group",
    schoolId: scopeId === "all" ? null : `synthetic-${scopeId}`,
    schoolName: scopeId === "all" ? null : scope.label,
  };
  return (
    <ApplicationShell
      items={[
        {
          href: "/px3-operations#students",
          label: "Students",
          group: "People",
        },
        {
          href: "/px3-operations#assessment",
          label: "Assessment",
          group: "Academics",
        },
        {
          href: "/px3-operations#teaching",
          label: "Teaching",
          group: "Academics",
        },
        {
          href: "/px3-operations#finance",
          label: "Finance",
          group: "Operations",
        },
        {
          href: "/px3-operations#admin",
          label: "Administration",
          group: "Administration",
        },
      ]}
      unavailableItems={[
        { label: "Northgate School", reason: "No membership in this school" },
        {
          label: "Platform Console",
          reason: "Separate platform-operator authorization required",
        },
      ]}
      userEmail="operations.preview@schoolflow.example"
      homeHref="/px3-operations"
      notificationHref="/px3-operations#day"
      helpHref="/px3-operations#guidance"
      contextRibbon={
        <div className="space-y-1.5">
          <p className="text-tenant-accent-strong text-[0.65rem] font-bold tracking-[0.14em] uppercase">
            Synthetic prototype operating context · production context unchanged
          </p>
          <ContextRibbon
            active={activeContext}
            options={scopeOptions.map((option) => ({
              organizationId: "synthetic-cedarbridge",
              organizationName: "Cedarbridge Learning Group",
              schoolId: option.id === "all" ? null : `synthetic-${option.id}`,
              schoolName: option.id === "all" ? null : option.label,
            }))}
            academic={{
              sessionId: "synthetic-2026",
              sessionName: "2026/2027",
              periodId: "synthetic-term-1",
              periodName: "First Term",
              available: true,
            }}
          />
        </div>
      }
    >
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
            {perspectiveOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Operating scope
          <select
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value as ScopeId)}
            className="border-border mt-1 min-h-11 w-full rounded-xl border bg-white px-3 font-normal"
          >
            {scopeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
            <option disabled value="northgate">
              Northgate School — access required
            </option>
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
      <div className="relative mb-6 min-w-0">
        <p className="mb-2 text-xs font-semibold text-slate-500 sm:hidden">
          Swipe to explore all workspaces
        </p>
        <nav
          aria-label="School operations prototypes"
          role="tablist"
          className="border-border flex max-w-full scrollbar-thin gap-2 overflow-x-auto overscroll-x-contain scroll-smooth border-b pr-8 pb-2"
        >
          {workspaces.map(([id, label, Icon]) => (
            <button
              key={id}
              ref={(element) => {
                workspaceButtons.current[id] = element;
              }}
              type="button"
              role="tab"
              aria-selected={workspace === id}
              aria-controls="px3-workspace-panel"
              tabIndex={workspace === id ? 0 : -1}
              onClick={() => setWorkspace(id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveWorkspace(id, 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveWorkspace(id, -1);
                }
              }}
              className={`focus-visible:outline-focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 ${workspace === id ? "bg-brand text-white" : "hover:bg-surface bg-white text-slate-700"}`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-12 w-10 bg-gradient-to-l from-white to-transparent sm:hidden"
        />
      </div>
      <section id="px3-workspace-panel" role="tabpanel" aria-live="polite">
        {content}
      </section>
    </ApplicationShell>
  );
}
