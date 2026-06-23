"use client";

import { AuthView } from "@neondatabase/auth/react/ui";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

type AuthViewClientProps = {
  path: string;
};

const authViewClassNames = {
  base: "max-w-none gap-5 border-slate-200 bg-white py-0 shadow-none",
  footer: "text-slate-600",
  footerLink:
    "px-0 font-semibold text-rw-gold-accessible underline-offset-4 hover:text-rw-gold",
  form: {
    primaryButton:
      "bg-black text-white shadow-none hover:bg-neutral-800 focus-visible:ring-neutral-400/40",
    forgotPasswordLink: "text-rw-navy hover:text-rw-gold-accessible",
  },
} as const;

export function AuthViewClient({ path }: AuthViewClientProps) {
  return (
    <AuthPageShell>
      <AuthView classNames={authViewClassNames} path={path} />
    </AuthPageShell>
  );
}
