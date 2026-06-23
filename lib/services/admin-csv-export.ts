import { requireAdminSession } from "@/lib/services/admin-auth";
import {
  exportRegistrationsCsv,
  exportTeamsCsv,
} from "@/lib/services/csv-export";

const CSV_HEADERS = {
  "Content-Type": "text/csv; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export async function buildRegistrationsCsvResponse(): Promise<Response> {
  await requireAdminSession();
  const csv = await exportRegistrationsCsv();

  return new Response(csv, {
    status: 200,
    headers: {
      ...CSV_HEADERS,
      "Content-Disposition": 'attachment; filename="registrations.csv"',
    },
  });
}

export async function buildTeamsCsvResponse(): Promise<Response> {
  await requireAdminSession();
  const csv = await exportTeamsCsv();

  return new Response(csv, {
    status: 200,
    headers: {
      ...CSV_HEADERS,
      "Content-Disposition": 'attachment; filename="teams.csv"',
    },
  });
}
