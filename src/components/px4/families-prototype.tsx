"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  BookOpenCheck,
  FileText,
  MessageCircle,
  WalletCards,
} from "lucide-react";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  children,
  money,
  unrelatedLearner,
  type ChildId,
  type FamilyPersona,
} from "./fixtures";
import {
  MetricCard,
  PackNavigation,
  PrototypeNotice,
  PrototypeRibbon,
  Px4Shell,
  SectionHeading,
} from "./shared";

type View =
  "home" | "for-you" | "attendance" | "finance" | "results" | "communication";

const views: Array<[View, string]> = [
  ["home", "Home"],
  ["for-you", "For You"],
  ["attendance", "Attendance"],
  ["finance", "Fees & payments"],
  ["results", "Published results"],
  ["communication", "Messages & documents"],
];

export function FamiliesPrototype() {
  const [persona, setPersona] = useState<FamilyPersona>("guardian");
  const [childId, setChildId] = useState<ChildId>("amara");
  const [view, setView] = useState<View>("home");
  const child = children[childId];
  const balance = child.billedCents - child.paidCents;
  const title =
    persona === "guardian"
      ? `Good evening, Ada`
      : `Welcome back, ${child.name.split(" ")[0]}`;
  const tasks = useMemo(
    () => [
      {
        title: child.notice,
        detail: `${child.school} · due this week`,
        icon: Bell,
      },
      {
        title: `${money(balance)} outstanding`,
        detail: `${child.name}'s learner ledger only`,
        icon: WalletCards,
      },
      {
        title: "Report card ready",
        detail: `${child.result} · ${child.average}% average`,
        icon: BookOpenCheck,
      },
    ],
    [balance, child],
  );

  return (
    <Px4Shell
      homeHref="/px4-families"
      email={
        persona === "guardian"
          ? "ada.guardian@example.test"
          : "learner.preview@example.test"
      }
      ribbon={
        <PrototypeRibbon
          primary="Cedarbridge family"
          secondary={child.school}
          tertiary={`${child.className} · 2026/2027 First Term`}
        />
      }
    >
      <PrototypeNotice>
        Family and student records are fictional. Persona switching changes
        presentation only and grants no production access.
      </PrototypeNotice>
      <PackNavigation current="families" />
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Pack C · Families
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Mobile-first guardian and student reference experience
          </p>
        </div>
        <label className="text-sm font-semibold text-slate-700">
          Persona preview
          <select
            aria-label="Family persona preview"
            value={persona}
            onChange={(event) =>
              setPersona(event.target.value as FamilyPersona)
            }
            className="border-border mt-1 block min-h-11 w-full rounded-lg border bg-white px-3 font-medium"
          >
            <option value="guardian">Guardian · two linked learners</option>
            <option value="student">Student · self only</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Learner
          <select
            aria-label="Linked learner"
            value={childId}
            disabled={persona === "student"}
            onChange={(event) => setChildId(event.target.value as ChildId)}
            className="border-border mt-1 block min-h-11 w-full rounded-lg border bg-white px-3 font-medium disabled:bg-slate-100"
          >
            <option value="amara">Amara Okafor</option>
            <option value="musa">Musa Ibrahim</option>
          </select>
        </label>
      </div>
      <nav
        aria-label="Family workspace"
        className="my-6 flex max-w-full gap-2 overflow-x-auto pb-2"
      >
        {views.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`focus-visible:outline-focus-ring min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold focus-visible:outline-2 ${view === id ? "bg-brand text-white" : "border-border border bg-white text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      {view === "home" || view === "for-you" ? (
        <div className="space-y-6">
          <SectionHeading
            eyebrow={persona === "guardian" ? "Family home" : "Student home"}
            title={view === "for-you" ? "For you right now" : title}
            description={
              persona === "guardian"
                ? `Everything relevant to ${child.name}, without mixing sibling records.`
                : "Your attendance, published results and school updates in clear learner-friendly language."
            }
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Attendance"
              value={`${child.attendance}%`}
              detail={`${child.present} of ${child.sessions} sessions`}
            />
            <MetricCard
              label="Outstanding"
              value={money(balance)}
              detail="This learner only"
              warning={balance > 0}
            />
            <MetricCard
              label="Published result"
              value={`${child.average}%`}
              detail={child.result}
            />
            <MetricCard
              label="Unread updates"
              value="3"
              detail="Two notices · one message"
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
            <SurfaceCard eyebrow="Prioritized" title="For You">
              <div className="space-y-3">
                {tasks.map(
                  ({ title: taskTitle, detail, icon: Icon }, index) => (
                    <article
                      key={taskTitle}
                      className="border-border flex gap-3 rounded-xl border p-4"
                    >
                      <Icon
                        aria-hidden="true"
                        className="text-brand mt-1 size-5 shrink-0"
                      />
                      <div>
                        <StatusBadge tone={index === 0 ? "warning" : "neutral"}>
                          {index === 0 ? "Needs attention" : "Update"}
                        </StatusBadge>
                        <h2 className="mt-2 font-semibold text-slate-950">
                          {taskTitle}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">{detail}</p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            </SurfaceCard>
            <SurfaceCard eyebrow="Linked learners" title={child.name}>
              <p className="font-semibold">{child.school}</p>
              <p className="mt-1 text-sm text-slate-500">{child.className}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Switching learners replaces identity, attendance, Finance,
                results, communication and document content together.
              </p>
            </SurfaceCard>
          </div>
        </div>
      ) : null}
      {view === "attendance" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Child attendance"
            title={`${child.name}'s attendance`}
            description="A family-readable summary with only relevant exceptions."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Attendance rate"
              value={`${child.attendance}%`}
              detail="Current term"
            />
            <MetricCard
              label="Present"
              value={`${child.present}`}
              detail={`${child.sessions} recorded sessions`}
            />
            <MetricCard
              label="Follow-up"
              value={childId === "amara" ? "2" : "5"}
              detail="Explained absences and late arrivals"
              warning
            />
          </div>
          <StatePanel
            kind="setup"
            title="Attendance follow-up"
            description={`${child.school} recorded a late arrival. Contact the school if the explanation needs correction.`}
          />
        </div>
      ) : null}
      {view === "finance" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Learner Finance"
            title={`${child.name}'s fees and payments`}
            description="Sibling balances remain separate; this is not a family-wide or school-wide ledger."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Billed"
              value={money(child.billedCents)}
              detail="Current learner bill"
            />
            <MetricCard
              label="Paid"
              value={money(child.paidCents)}
              detail={`Receipt ${child.receipt}`}
            />
            <MetricCard
              label="Outstanding"
              value={money(balance)}
              detail="Current learner balance"
              warning
            />
          </div>
          <SurfaceCard title="Payment history">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Bank transfer received</p>
                <p className="text-sm text-slate-500">
                  {child.receipt} · verified
                </p>
              </div>
              <StatusBadge tone="success">Allocated</StatusBadge>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
      {view === "results" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Published results only"
            title={`${child.name}'s report card`}
            description="Draft, submitted, reviewed and unpublished assessment data is excluded."
          />
          <SurfaceCard title={child.result}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Average</p>
                <p className="text-2xl font-semibold">{child.average}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <StatusBadge tone="success">Published</StatusBadge>
              </div>
              <div>
                <p className="text-sm text-slate-500">Document</p>
                <p className="font-semibold">Report card available</p>
              </div>
            </div>
          </SurfaceCard>
          <StatePanel
            kind="unauthorized"
            title="Unpublished assessment hidden"
            description="Internal score sheets and draft result versions are not available to family or student personas."
          />
        </div>
      ) : null}
      {view === "communication" ? (
        <div className="space-y-5">
          <SectionHeading
            eyebrow="Communication"
            title="Messages and documents"
            description={`Only updates and files targeted to ${child.name} or their family are shown.`}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <SurfaceCard title="Recent message">
              <MessageCircle aria-hidden="true" className="text-brand size-5" />
              <p className="mt-3 font-semibold">{child.notice}</p>
              <p className="mt-1 text-sm text-slate-500">From {child.school}</p>
            </SurfaceCard>
            <SurfaceCard title="Authorized document">
              <FileText aria-hidden="true" className="text-brand size-5" />
              <p className="mt-3 font-semibold">{child.document}</p>
              <p className="mt-1 text-sm text-slate-500">
                Protected family-visible attachment
              </p>
            </SurfaceCard>
          </div>
          <StatePanel
            kind="unauthorized"
            title="Private documents remain restricted"
            description="Staff files, administrative attachments and unrelated learner documents are unavailable."
          />
        </div>
      ) : null}
      <section id="guidance" className="mt-6 grid gap-4 md:grid-cols-2">
        <StatePanel
          kind="unauthorized"
          title={`${unrelatedLearner.name} denied`}
          description={unrelatedLearner.reason}
        />
        <StatePanel
          kind="disabled"
          title="Guardian-only controls"
          description={
            persona === "student"
              ? "The student persona cannot switch learners or use guardian-only actions."
              : "Guardian access is limited to explicitly linked learners."
          }
        />
      </section>
      <div id="notifications" className="sr-only" aria-live="polite">
        Family notification reference region
      </div>
    </Px4Shell>
  );
}
