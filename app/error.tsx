"use client";

import Link from "next/link";

import { FormMessage } from "@/components/forms/form-message";
import { PUBLIC_ERROR_MESSAGE } from "@/lib/services/service-error";

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <FormMessage tone="error" message={PUBLIC_ERROR_MESSAGE} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-rw-navy px-5 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-rw-navy"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
