"use client";

import { AuthView } from "@neondatabase/auth/react/ui";

type AuthViewClientProps = {
  path: string;
};

export function AuthViewClient({ path }: AuthViewClientProps) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <AuthView path={path} />
    </div>
  );
}
