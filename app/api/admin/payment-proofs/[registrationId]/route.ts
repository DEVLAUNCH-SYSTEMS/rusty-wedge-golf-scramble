import { AdminAuthError } from "@/lib/services/admin-auth";
import {
  getPaymentProofForAdmin,
  mapPaymentProofViewerAuthError,
  mapPaymentProofViewerError,
  PaymentProofViewerError,
} from "@/lib/services/payment-proof-viewer";

export const dynamic = "force-dynamic";

type PaymentProofRouteContext = {
  params: Promise<{ registrationId: string }>;
};

function handlePaymentProofError(error: unknown): Response {
  if (error instanceof AdminAuthError) {
    return mapPaymentProofViewerAuthError(error);
  }

  if (error instanceof PaymentProofViewerError) {
    return mapPaymentProofViewerError(error);
  }

  console.error("Payment proof viewer failed:", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });

  return Response.json({ error: "Unable to load payment proof." }, { status: 500 });
}

export async function GET(_request: Request, context: PaymentProofRouteContext) {
  try {
    const { registrationId } = await context.params;
    const proof = await getPaymentProofForAdmin(registrationId);

    return new Response(proof.body, {
      status: 200,
      headers: {
        "Content-Type": proof.contentType,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return handlePaymentProofError(error);
  }
}
