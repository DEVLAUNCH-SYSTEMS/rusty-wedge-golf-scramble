import { eq } from "drizzle-orm";

import { getAuth } from "@/lib/auth/server";
import { getDb } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export type AdminSession = {
  neonAuthUserId: string;
  adminUserId: string;
  email: string;
  displayName: string | null;
};

export class AdminAuthError extends Error {
  readonly code: "UNAUTHENTICATED" | "FORBIDDEN";

  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "AdminAuthError";
    this.code = code;
  }
}

async function findAllowlistedAdmin(neonAuthUserId: string) {
  const db = getDb();

  const rows = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      displayName: adminUsers.displayName,
    })
    .from(adminUsers)
    .where(eq(adminUsers.neonAuthUserId, neonAuthUserId))
    .limit(1);

  return rows[0] ?? null;
}

async function readSessionUserId(): Promise<string | null> {
  try {
    const { data: session, error } = await getAuth().getSession();

    if (error) {
      return null;
    }

    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const userId = await readSessionUserId();

  if (!userId) {
    throw new AdminAuthError("UNAUTHENTICATED", "Authentication required.");
  }

  const admin = await findAllowlistedAdmin(userId);

  if (!admin) {
    throw new AdminAuthError("FORBIDDEN", "Admin access is not granted.");
  }

  return {
    neonAuthUserId: userId,
    adminUserId: admin.id,
    email: admin.email,
    displayName: admin.displayName,
  };
}
