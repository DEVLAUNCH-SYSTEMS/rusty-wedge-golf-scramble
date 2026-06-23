import { AdminAuthError } from "@/lib/services/admin-auth";
import { buildTeamsCsvResponse } from "@/lib/services/admin-csv-export";

export const dynamic = "force-dynamic";

function mapAuthError(error: AdminAuthError): Response {
  const status = error.code === "UNAUTHENTICATED" ? 401 : 403;
  return Response.json({ error: error.message }, { status });
}

export async function GET() {
  try {
    return await buildTeamsCsvResponse();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return mapAuthError(error);
    }

    console.error("Teams CSV export failed:", error);
    return Response.json({ error: "Unable to export teams." }, { status: 500 });
  }
}
