"use client";

import { useEffect, useRef, useState } from "react";
import { readQaMagicLinkTokenHash } from "@/features/administration/qa-magic-link";
import { createClient } from "@/lib/supabase/client";

export default function QaMagicLinkPage() {
  const attempted = useRef(false);
  const [message, setMessage] = useState("Verifying your one-time QA sign-in…");

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const tokenHash = readQaMagicLinkTokenHash(window.location.hash);
    // Remove the single-use credential before making any network request.
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokenHash) {
      queueMicrotask(() =>
        setMessage(
          "This QA sign-in link is invalid or already used. Request a new link.",
        ),
      );
      return;
    }

    void createClient()
      .auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" })
      .then(({ error }) => {
        if (error) {
          setMessage(
            "This QA sign-in link is invalid or already used. Request a new link.",
          );
          return;
        }
        window.location.replace("/dashboard");
      })
      .catch(() => {
        setMessage("QA sign-in could not be completed. Request a new link.");
      });
  }, []);

  return (
    <main className="mx-auto max-w-lg px-5 py-16">
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-lg font-semibold text-slate-950">
          QA account sign-in
        </h1>
        <p
          className="mt-3 text-sm text-slate-700"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </section>
    </main>
  );
}
