import { AdminAuthError } from "@/lib/services/admin-auth";
import { buildRegistrationsCsvResponse } from "@/lib/services/admin-csv-export";

export const dynamic = "force-dynamic";

function mapAuthError(error: AdminAuthError): Response {
  const status = error.code === "UNAUTHENTICATED" ? 401 : 403;
  return Response.json({ error: error.message }, { status });
}

export async function GET(request: Request) {
  try {
    const tournamentId = new URL(request.url).searchParams.get("tournamentId");
    return await buildRegistrationsCsvResponse(tournamentId);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return mapAuthError(error);
    }

    console.error("Registrations CSV export failed:", error);
    return Response.json({ error: "Unable to export registrations." }, { status: 500 });
  }
}
