"use client";

import { useActionState } from "react";
import { createQaInvitation, type QaInvitationState } from "@/app/(app)/administration/actions";
import { fieldClass } from "@/components/auth-card";
import { Button } from "@/components/ui/button";

const initialState: QaInvitationState = {
  message: "Create a QA-only invitation. No email will be sent.",
};

export function QaInvitationForm({
  organizationName,
  schoolId,
}: {
  organizationName: string;
  schoolId: string;
}) {
  const [state, formAction, pending] = useActionState(
    createQaInvitation,
    initialState,
  );
  const internalQa = organizationName === "SchoolFlow Internal QA";
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-950">
        Prepare QA test access
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-700">
        This QA-only tool uses fixed least-privilege roles and the existing
        invitation acceptance flow. It creates no Auth users, sends no email,
        and returns a one-time link that expires in seven days.
      </p>
      <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="schoolId" value={schoolId} />
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Account email
          <input
            className={fieldClass}
            name="email"
            type="email"
            autoComplete="off"
            maxLength={254}
            required
          />
        </label>
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
                <option value="payment_verifier">
                  Cedarbridge independent payment verifier
                </option>
              </>
            )}
          </select>
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Preparing invitation…" : "Create QA invitation"}
          </Button>
        </div>
      </form>
      <p
        className="mt-4 text-sm text-slate-700"
        role={state.inviteUrl ? "status" : "alert"}
      >
        {state.message}
      </p>
      {state.inviteUrl ? (
        <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">
          One-time invitation link
          <input
            className={fieldClass}
            value={state.inviteUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      ) : null}
      <p className="mt-3 text-xs text-slate-600">
        The invited person must sign up through SchoolFlow with this same email
        and then accept the link. Share it privately; it grants the selected
        role only after the signed-in email is matched.
      </p>
    </section>
  );
}
