"use client";

import { ClientErrorBoundary } from "@/components/error/client-error-boundary";

type AdminClientShellProps = {
  children: React.ReactNode;
};

export function AdminClientShell({ children }: AdminClientShellProps) {
  return (
    <ClientErrorBoundary message="Something went wrong in this admin view. Refresh the page and try again.">
      {children}
    </ClientErrorBoundary>
  );
}
