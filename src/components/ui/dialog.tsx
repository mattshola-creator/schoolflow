"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export function Dialog({
  children,
  description,
  title,
  triggerLabel,
}: {
  children: ReactNode;
  description?: string;
  title: string;
  triggerLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
      </Button>
      <dialog
        ref={dialogRef}
        className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-[2px]"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => dialogRef.current?.close()}
            className="hover:bg-surface-subtle inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-slate-500"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </dialog>
    </>
  );
}
