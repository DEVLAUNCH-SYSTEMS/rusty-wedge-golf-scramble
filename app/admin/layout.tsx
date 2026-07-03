import { redirect } from "next/navigation";

import { AdminClientShell } from "@/components/admin/admin-client-shell";
import { AdminForbidden } from "@/components/admin/admin-forbidden";
import { AdminNav } from "@/components/admin/admin-nav";
import { adminPageClassName } from "@/components/admin/admin-text-styles";
import { AdminAuthError, requireAdminSession } from "@/lib/services/admin-auth";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | Rusty Wedge Golf Scramble",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLayoutProps = {
  children: React.ReactNode;
};

type AdminShellResult =
  | { kind: "ok"; email: string }
  | { kind: "forbidden" }
  | { kind: "redirect" };

async function resolveAdminShell(): Promise<AdminShellResult> {
  try {
    const admin = await requireAdminSession();
    return { kind: "ok", email: admin.email };
  } catch (error) {
    if (error instanceof AdminAuthError && error.code === "UNAUTHENTICATED") {
      return { kind: "redirect" };
    }

    if (error instanceof AdminAuthError && error.code === "FORBIDDEN") {
      return { kind: "forbidden" };
    }

    throw error;
  }
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const shell = await resolveAdminShell();

  if (shell.kind === "redirect") {
    redirect("/auth/sign-in");
  }

  if (shell.kind === "forbidden") {
    return <AdminForbidden />;
  }

  return (
    <div className={adminPageClassName}>
      <AdminNav adminEmail={shell.email} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <AdminClientShell>{children}</AdminClientShell>
      </main>
    </div>
  );
}
