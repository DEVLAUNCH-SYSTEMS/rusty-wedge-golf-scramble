export const PAYMENT_PROOF_LOAD_ERROR =
  "Unable to load the payment proof right now. You can still review the registration details below.";

export async function readPaymentProofError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };

    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Ignore malformed error payloads.
  }

  return PAYMENT_PROOF_LOAD_ERROR;
}
