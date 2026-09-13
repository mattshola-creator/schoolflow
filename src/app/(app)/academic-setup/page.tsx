import { AlertTriangle, CheckCircle2, LockKeyhole } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { loadAcademicSetup } from "@/features/academics/service";
import {
  createAcademicLock,
  createAcademicPeriod,
  createAcademicSection,
  createAcademicSession,
  createClassArm,
  createClassLevel,
  createSubject,
  deactivateAcademicItem,
  releaseAcademicLock,
  saveAcademicSettings,
} from "./actions";

const panel = "rounded-xl border bg-white p-5 sm:p-6";
const button =
  "rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:opacity-50";
const secondaryButton =
  "rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
const stepNames = {
  settings: "Preferences",
  session: "Session",
  periods: "Periods",
  levels: "Levels",
  arms: "Arms",
  subjects: "Subjects",
  review: "Review",
};

function Notice({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-5 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}
    >
      {error ?? message}
    </p>
  );
}

function DeactivateButton({
  kind,
  id,
}: {
  kind: "section" | "level" | "arm" | "subject";
  id: string;
}) {
  return (
    <form action={deactivateAcademicItem}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <button className="text-xs font-medium text-slate-500 underline hover:text-slate-900">
        Deactivate
      </button>
    </form>
  );
}

export default async function AcademicSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const setup = await loadAcademicSetup().catch(() => null);
  if (!setup)
    return (
      <main className="py-16">
        <p className="text-sm font-semibold text-amber-800">Unavailable</p>
        <h1 className="mt-2 text-3xl font-semibold">
          Academic setup is not available
        </h1>
        <p className="mt-3 max-w-xl text-slate-600">
          Select an authorized school workspace or ask an administrator to grant
          the required academic setup access.
        </p>
      </main>
    );
  const can = (permission: string) =>
    setup.authorization.permissions.includes(permission);
  const activeLevels = setup.levels.filter((item) => item.status === "active");
  const currentSession = setup.sessions.find(
    (item) => item.status === "current",
  );
  const statusLabel = setup.state.replace("_", " ");

  return (
    <main className="py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Academic foundation
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Set up {setup.active.schoolName}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Configure the calendar and class structure this school actually
            operates. Every value is persisted and school-scoped.
          </p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3 text-sm">
          <span className="block text-xs font-medium text-slate-500">
            Setup status
          </span>
          <span className="font-semibold capitalize">{statusLabel}</span>
        </div>
      </div>
      <Notice error={error} message={message} />

      <ol
        aria-label="Academic setup progress"
        className="mt-7 flex gap-2 overflow-x-auto pb-2"
      >
        {Object.entries(stepNames).map(([key, label], index) => {
          const currentIndex = Object.keys(stepNames).indexOf(setup.nextStep);
          const complete = index < currentIndex || setup.nextStep === "review";
          return (
            <li
              key={key}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${key === setup.nextStep ? "border-emerald-700 bg-emerald-50 text-emerald-900" : complete ? "border-emerald-200 text-emerald-800" : "text-slate-500"}`}
            >
              {complete ? "✓ " : ""}
              {label}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-6">
        <section className={panel}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">1. Academic preferences</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use terms, semesters, quarters, or another label without
                changing the data model.
              </p>
            </div>
            {setup.settings && (
              <CheckCircle2
                className="size-5 text-emerald-700"
                aria-label="Complete"
              />
            )}
          </div>
          {can("academics.structure.manage") && (
            <form
              action={saveAcademicSettings}
              className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <label className="text-sm font-medium">
                Period label
                <input
                  className={fieldClass}
                  name="periodLabel"
                  defaultValue={setup.settings?.period_label ?? "Term"}
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Week starts
                <select
                  className={fieldClass}
                  name="weekStartsOn"
                  defaultValue={setup.settings?.week_starts_on ?? 1}
                >
                  <option value="1">Monday</option>
                  <option value="0">Sunday</option>
                </select>
              </label>
              <button className={button}>Save preferences</button>
            </form>
          )}
        </section>

        <section className={panel}>
          <h2 className="text-lg font-semibold">2. Sessions and periods</h2>
          <p className="mt-1 text-sm text-slate-600">
            Only one session and one period can be current for this school.
            Overlapping active dates are rejected.
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-medium">Academic sessions</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {setup.sessions.length ? (
                  setup.sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span>
                        {session.name} · {session.start_date}–{session.end_date}
                      </span>
                      <span className="text-slate-500 capitalize">
                        {session.status}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No session configured.</li>
                )}
              </ul>
              {can("academics.sessions.manage") && (
                <form
                  action={createAcademicSession}
                  className="mt-4 grid gap-3 rounded-lg border p-4"
                >
                  <label className="text-sm font-medium">
                    Session name
                    <input
                      className={fieldClass}
                      name="name"
                      placeholder="2026/2027"
                      required
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-medium">
                      Starts
                      <input
                        className={fieldClass}
                        name="startDate"
                        type="date"
                        required
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Ends
                      <input
                        className={fieldClass}
                        name="endDate"
                        type="date"
                        required
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="makeCurrent" value="true" />{" "}
                    Make current
                  </label>
                  <button className={button}>Add session</button>
                </form>
              )}
            </div>
            <div>
              <h3 className="font-medium">Academic periods</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {setup.periods.length ? (
                  setup.periods.map((period) => (
                    <li
                      key={period.id}
                      className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span>
                        {period.sequence}. {period.name}
                      </span>
                      <span className="text-slate-500 capitalize">
                        {period.status}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No periods configured.</li>
                )}
              </ul>
              {can("academics.periods.manage") && (
                <form
                  action={createAcademicPeriod}
                  className="mt-4 grid gap-3 rounded-lg border p-4"
                >
                  <label className="text-sm font-medium">
                    Session
                    <select
                      className={fieldClass}
                      name="sessionId"
                      defaultValue={currentSession?.id ?? ""}
                      required
                    >
                      <option value="" disabled>
                        Select a session
                      </option>
                      {setup.sessions
                        .filter((item) => item.status !== "archived")
                        .map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-[1fr_6rem] gap-3">
                    <label className="text-sm font-medium">
                      Name
                      <input
                        className={fieldClass}
                        name="name"
                        placeholder="First Term"
                        required
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Order
                      <input
                        className={fieldClass}
                        name="sequence"
                        type="number"
                        min="1"
                        max="24"
                        defaultValue="1"
                        required
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-sm font-medium">
                      Starts
                      <input
                        className={fieldClass}
                        name="startDate"
                        type="date"
                        required
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Ends
                      <input
                        className={fieldClass}
                        name="endDate"
                        type="date"
                        required
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="makeCurrent" value="true" />{" "}
                    Make current
                  </label>
                  <button className={button}>Add period</button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className={panel}>
          <h2 className="text-lg font-semibold">3. Class structure</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sections are optional groupings. Levels and arms remain separate and
            reorderable.
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div>
              <h3 className="font-medium">Sections</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {setup.sections.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span>{item.name}</span>
                    {item.status === "active" && (
                      <DeactivateButton kind="section" id={item.id} />
                    )}
                  </li>
                ))}
              </ul>
              {can("academics.structure.manage") && (
                <form
                  action={createAcademicSection}
                  className="mt-4 grid gap-3"
                >
                  <input
                    className={fieldClass}
                    name="name"
                    aria-label="Section name"
                    placeholder="Primary"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={fieldClass}
                      name="code"
                      aria-label="Section code"
                      placeholder="PRI"
                    />
                    <input
                      className={fieldClass}
                      name="sortOrder"
                      aria-label="Section order"
                      type="number"
                      defaultValue="1"
                      min="1"
                      required
                    />
                  </div>
                  <button className={button}>Add section</button>
                </form>
              )}
            </div>
            <div>
              <h3 className="font-medium">Class levels</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {setup.levels.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span>{item.name}</span>
                    {item.status === "active" && (
                      <DeactivateButton kind="level" id={item.id} />
                    )}
                  </li>
                ))}
              </ul>
              {can("academics.structure.manage") && (
                <form action={createClassLevel} className="mt-4 grid gap-3">
                  <input
                    className={fieldClass}
                    name="name"
                    aria-label="Class level name"
                    placeholder="Primary 4"
                    required
                  />
                  <select
                    className={fieldClass}
                    name="sectionId"
                    aria-label="Section"
                  >
                    <option value="">No section</option>
                    {setup.sections
                      .filter((item) => item.status === "active")
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={fieldClass}
                      name="code"
                      aria-label="Class level code"
                      placeholder="P4"
                    />
                    <input
                      className={fieldClass}
                      name="sortOrder"
                      aria-label="Class level order"
                      type="number"
                      defaultValue="1"
                      min="1"
                      required
                    />
                  </div>
                  <button className={button}>Add level</button>
                </form>
              )}
            </div>
            <div>
              <h3 className="font-medium">Class arms</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {setup.arms.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span>
                      {
                        setup.levels.find(
                          (level) => level.id === item.class_level_id,
                        )?.name
                      }{" "}
                      · {item.name}
                    </span>
                    {item.status === "active" && (
                      <DeactivateButton kind="arm" id={item.id} />
                    )}
                  </li>
                ))}
              </ul>
              {can("academics.structure.manage") && (
                <form action={createClassArm} className="mt-4 grid gap-3">
                  <select
                    className={fieldClass}
                    name="classLevelId"
                    aria-label="Class level"
                    required
                  >
                    <option value="">Select level</option>
                    {activeLevels.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={fieldClass}
                    name="name"
                    aria-label="Class arm name"
                    placeholder="Gold"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={fieldClass}
                      name="code"
                      aria-label="Class arm code"
                      placeholder="GOLD"
                    />
                    <input
                      className={fieldClass}
                      name="sortOrder"
                      aria-label="Class arm order"
                      type="number"
                      defaultValue="1"
                      min="1"
                      required
                    />
                  </div>
                  <button className={button}>Add arm</button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className={panel}>
          <h2 className="text-lg font-semibold">4. Subjects</h2>
          <p className="mt-1 text-sm text-slate-600">
            The subject catalog belongs to this school; applicability and
            core/elective status are assigned by level.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {setup.subjects.map((subject) => {
              const links = setup.applicability.filter(
                (item) => item.subject_id === subject.id,
              );
              return (
                <li
                  key={subject.id}
                  className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>
                    <strong>{subject.name}</strong>
                    {subject.code ? ` · ${subject.code}` : ""}
                    <small className="mt-1 block text-slate-500">
                      {links.length
                        ? links
                            .map(
                              (link) =>
                                `${setup.levels.find((level) => level.id === link.class_level_id)?.name} (${link.classification})`,
                            )
                            .join(", ")
                        : "Available school-wide"}
                    </small>
                  </span>
                  {subject.status === "active" && (
                    <DeactivateButton kind="subject" id={subject.id} />
                  )}
                </li>
              );
            })}
          </ul>
          {can("academics.subjects.manage") && (
            <form
              action={createSubject}
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
            >
              <label className="text-sm font-medium">
                Subject name
                <input
                  className={fieldClass}
                  name="name"
                  placeholder="Mathematics"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Code
                <input className={fieldClass} name="code" placeholder="MATH" />
              </label>
              <label className="text-sm font-medium">
                Level applicability
                <select className={fieldClass} name="classLevelId">
                  <option value="">School-wide</option>
                  {activeLevels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Classification
                <select className={fieldClass} name="classification">
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                </select>
                <input type="hidden" name="sortOrder" value="1" />
              </label>
              <button className={button}>Add subject</button>
            </form>
          )}
        </section>

        <section className={panel}>
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 size-5 text-slate-700" />
            <div>
              <h2 className="text-lg font-semibold">5. Academic locks</h2>
              <p className="mt-1 text-sm text-slate-600">
                Locks are enforced by database triggers, including direct API
                mutations. Unlocking preserves the lock history.
              </p>
            </div>
          </div>
          {setup.locks.length > 0 && (
            <ul className="mt-4 space-y-3">
              {setup.locks.map((lock) => (
                <li
                  key={lock.id}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 text-amber-800" />
                    <span>
                      <strong className="capitalize">
                        {lock.scope.replace("_", " ")}
                      </strong>{" "}
                      · {lock.reason}
                    </span>
                  </div>
                  {can("academics.locks.manage") && (
                    <form
                      action={releaseAcademicLock}
                      className="mt-3 flex gap-2"
                    >
                      <input type="hidden" name="lockId" value={lock.id} />
                      <input
                        className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
                        name="reason"
                        aria-label="Unlock reason"
                        placeholder="Reason for unlocking"
                        required
                      />
                      <button className={secondaryButton}>Unlock</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          {can("academics.locks.manage") && (
            <form
              action={createAcademicLock}
              className="mt-5 grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
            >
              <label className="text-sm font-medium">
                Lock scope
                <select className={fieldClass} name="scope">
                  <option value="school_setup">Entire academic setup</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Reason
                <input
                  className={fieldClass}
                  name="reason"
                  placeholder="Configuration approved for use"
                  required
                />
              </label>
              <button className={button}>Apply lock</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
