"use client";

import { ClientErrorBoundary } from "@/components/error/client-error-boundary";
import { PUBLIC_ERROR_MESSAGE } from "@/lib/services/service-error";

type PublicClientShellProps = {
  children: React.ReactNode;
};

export function PublicClientShell({ children }: PublicClientShellProps) {
  return (
    <ClientErrorBoundary message={PUBLIC_ERROR_MESSAGE}>{children}</ClientErrorBoundary>
  );
}
