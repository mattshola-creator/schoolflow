"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/ui/form-field";

const steps = ["Organization", "First school", "Modules", "Review"] as const;
const modules = [
  "Students & staff",
  "Academic setup",
  "Admissions",
  "Attendance & teaching",
  "Finance",
  "Assessment & results",
  "Communication",
  "Management reporting",
];

export function OnboardingPrototype() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([
    "Students & staff",
    "Academic setup",
  ]);
  const toggle = (item: string) =>
    setSelected((value) =>
      value.includes(item) ? value.filter((x) => x !== item) : [...value, item],
    );
  return (
    <section className="bg-background min-h-[calc(100vh-4.5rem)]">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-brand text-sm font-bold tracking-wider uppercase">
            Synthetic onboarding prototype
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Shape your first SchoolFlow workspace.
          </h1>
          <p className="text-muted-foreground mt-4 leading-7">
            Nothing entered here is submitted, saved or connected to production
            authentication.
          </p>
        </div>
        <ol
          className="mt-10 grid grid-cols-4 gap-2"
          aria-label="Onboarding progress"
        >
          {steps.map((label, index) => (
            <li key={label} aria-current={index === step ? "step" : undefined}>
              <span
                className={`block h-1.5 rounded-full ${index <= step ? "bg-brand" : "bg-border"}`}
              />
              <span
                className={`mt-2 hidden text-xs font-bold sm:block ${index === step ? "text-brand" : "text-muted-foreground"}`}
              >
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>
        <div className="border-border mt-8 rounded-3xl border bg-white p-6 shadow-sm sm:p-9">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold">
                Tell us about the organization
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Organization name"
                  htmlFor="prototype-org"
                  description="Use fictional information for this review."
                >
                  <TextInput
                    id="prototype-org"
                    placeholder="Unity Learning Group"
                  />
                </FormField>
                <FormField label="Number of schools" htmlFor="prototype-count">
                  <TextInput
                    id="prototype-count"
                    inputMode="numeric"
                    placeholder="3"
                  />
                </FormField>
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold">Describe the first school</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField label="School name" htmlFor="prototype-school">
                  <TextInput
                    id="prototype-school"
                    placeholder="Unity Primary School"
                  />
                </FormField>
                <FormField
                  label="School structure"
                  htmlFor="prototype-structure"
                >
                  <select
                    id="prototype-structure"
                    className="border-border min-h-11 w-full rounded-lg border bg-white px-3"
                  >
                    <option>Nursery and Primary</option>
                    <option>Secondary</option>
                    <option>Combined</option>
                  </select>
                </FormField>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold">
                Choose capabilities to explore
              </h2>
              <p className="text-muted-foreground mt-2">
                Selections demonstrate packaging only; they do not activate
                entitlements.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {modules.map((item) => (
                  <label
                    key={item}
                    className="border-border hover:border-brand-border flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(item)}
                      onChange={() => toggle(item)}
                      className="size-5 accent-emerald-700"
                    />
                    <span className="font-semibold">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <span className="bg-status-success-soft text-status-success grid size-12 place-items-center rounded-2xl">
                <CheckCircle2 aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-5 text-2xl font-bold">
                Review the prototype journey
              </h2>
              <p className="text-muted-foreground mt-3 leading-7">
                A production onboarding flow would validate account,
                organization, first school, plan and modules before
                confirmation. PX2 deliberately stops before submission.
              </p>
              <div className="bg-surface-subtle mt-6 rounded-2xl p-5">
                <p className="text-sm font-bold">Selected prototype modules</p>
                <p className="text-muted-foreground mt-2">
                  {selected.join(" · ") || "None selected"}
                </p>
              </div>
              <p role="status" className="text-brand mt-6 font-bold">
                Prototype complete — no data was saved.
              </p>
            </div>
          )}
          <div className="border-border mt-9 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((x) => Math.max(0, x - 1))}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={() =>
                  setStep((x) => Math.min(steps.length - 1, x + 1))
                }
              >
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button onClick={() => setStep(0)}>Start over</Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-5 text-center text-xs">
          For founder review only. Existing `/sign-up` and secure Supabase
          onboarding remain unchanged.
        </p>
      </div>
    </section>
  );
}
