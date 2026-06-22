"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";

import { authClient } from "@/lib/auth/client";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <NeonAuthUIProvider authClient={authClient} redirectTo="/admin">
      {children}
    </NeonAuthUIProvider>
  );
}
