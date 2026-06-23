"use client";

import { AuthView } from "@neondatabase/auth/react/ui";

import { AuthPageShell } from "@/components/auth/auth-page-shell";

type AuthViewClientProps = {
  path: string;
};

export function AuthViewClient({ path }: AuthViewClientProps) {
  return (
    <AuthPageShell>
      <AuthView path={path} />
    </AuthPageShell>
  );
}
