"use client";

import Link from "next/link";

import { FormMessage } from "@/components/forms/form-message";

type AdminErrorPageProps = {
  reset: () => void;
};

export default function AdminErrorPage({ reset }: AdminErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-[40vh] max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <FormMessage
        tone="error"
        message="Unable to load this admin page. Refresh and try again."
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-rw-navy px-5 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-rw-navy"
        >
          Back to admin home
        </Link>
      </div>
    </main>
  );
}
