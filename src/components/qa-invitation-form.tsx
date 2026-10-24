"use client";

import { useState, type FormEvent } from "react";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";

type QaInvitationState = {
  message: string;
  inviteUrl?: string;
  signInUrl?: string;
};

const initialState: QaInvitationState = {
  message: "Prepare a fixed synthetic QA identity. No email will be sent.",
};

export function QaInvitationForm({
  organizationName,
  schoolId,
}: {
  organizationName: string;
  schoolId: string;
}) {
  const [state, setState] = useState<QaInvitationState>(initialState);
  const [pending, setPending] = useState(false);
  const internalQa = organizationName === "SchoolFlow Internal QA";

  async function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({ message: "Preparing the authorized synthetic QA identity…" });

    try {
      const response = await fetch("/api/administration/qa-invitation", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as QaInvitationState;
      setState(
        response.ok
          ? result
          : {
              message:
                result.message ??
                "QA identity creation was blocked. No email or notification was sent.",
            },
      );
    } catch {
      setState({
        message:
          "The QA invitation request could not be completed. No email or external notification was sent.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-950">
        Prepare QA test access
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-700">
        This QA-only tool creates one fixed synthetic identity through the
        protected Auth Admin flow, then uses the existing single-use invitation
        acceptance process. No email or external notification is sent.
      </p>
      <form
        onSubmit={submitInvitation}
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
        <input type="hidden" name="schoolId" value={schoolId} />
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Role and access scope
          <select className={fieldClass} name="rolePreset" required>
            <option value="">Select role</option>
            {internalQa ? (
              <option value="internal_qa_reader">
                SchoolFlow Internal QA only · read only
              </option>
            ) : (
              <>
                <option value="payment_recorder">
                  Cedarbridge payment recorder
                </option>
                <option value="principal_review">
                  Cedarbridge Principal review pilot
                </option>
                <option value="bursar_recorder">
                  Cedarbridge Bursar recorder pilot
                </option>
                <option value="assessment_teacher">
                  Cedarbridge Assessment teacher
                </option>
                <option value="payment_verifier">
                  Cedarbridge independent payment verifier
                </option>
              </>
            )}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Sign-in workspace
          <select
            className={fieldClass}
            name="signInDestination"
            defaultValue="current"
          >
            <option value="current">This preview or workspace</option>
            <option value="stable_qa">
              Stable QA — separate account session
            </option>
          </select>
          <span className="text-sm font-normal">
            Both private links use the selected workspace. Choose stable QA to
            preserve the owner session on this preview.
          </span>
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Preparing test account…" : "Prepare test account"}
          </Button>
        </div>
      </form>
      <p
        className="mt-4 text-sm text-slate-700"
        role={state.inviteUrl || state.signInUrl ? "status" : "alert"}
      >
        {state.message}
      </p>
      {state.signInUrl ? (
        <div className="mt-3">
          <a
            href={state.signInUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="text-brand font-semibold underline"
          >
            Sign in to the prepared QA account
          </a>
          <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">
            One-time synthetic account sign-in link
            <input
              className={fieldClass}
              value={state.signInUrl}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        </div>
      ) : null}
      {state.inviteUrl ? (
        <div className="mt-3">
          <a
            href={state.inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="text-brand font-semibold underline"
          >
            Open the prepared QA invitation
          </a>
          <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">
            Single-use role acceptance link
            <input
              className={fieldClass}
              value={state.inviteUrl}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-slate-600">
        Sign out of the current application account before following a sign-in
        link. Other tabs on the same hostname share the signed-in account. These
        fixed @schoolflow.test identities have no real inbox. The one-time
        sign-in link is shown only to this authorized manager. Open it in the
        isolated QA browser, then open the role acceptance link. Links are not
        sent externally.
      </p>
    </section>
  );
}
