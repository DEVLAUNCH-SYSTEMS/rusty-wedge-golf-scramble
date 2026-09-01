import type { ResultsAnnouncementBatchOutcome } from "@/lib/domain/results-announcement-batch-outcome";

type PermissiveBatchError = {
  index: number;
  message: string;
};

type PermissiveBatchSuccess = {
  data: Array<{ id: string }>;
  errors?: PermissiveBatchError[];
};

type PermissiveBatchErrorResponse = {
  message: string;
  statusCode: number | null;
  name: string;
};

function isAmbiguousProviderError(error: PermissiveBatchErrorResponse): boolean {
  if (error.statusCode === null) {
    return true;
  }

  return error.statusCode >= 500;
}

function classifyProviderError(
  error: PermissiveBatchErrorResponse,
): ResultsAnnouncementBatchOutcome {
  if (error.statusCode === 409) {
    return {
      kind: "known_failure",
      message:
        "Resend rejected the request because this tournament idempotency key was already used with a different payload. In development, use Send smoke test to retest template or config changes without affecting announcement status.",
    };
  }

  if (isAmbiguousProviderError(error)) {
    return { kind: "ambiguous", message: error.message };
  }

  return { kind: "known_failure", message: error.message };
}

function buildFullSuccessOutcome(
  recipientCount: number,
  providerBatchIds: string[],
): ResultsAnnouncementBatchOutcome {
  return {
    kind: "full_success",
    recipientCount,
    successCount: providerBatchIds.length,
    providerBatchIds,
  };
}

function buildPartialOutcome(
  recipientCount: number,
  providerBatchIds: string[],
  failureCount: number,
): ResultsAnnouncementBatchOutcome {
  return {
    kind: "partial",
    recipientCount,
    successCount: providerBatchIds.length,
    failureCount,
    providerBatchIds,
  };
}

function classifyBatchDataOutcome(input: {
  recipientCount: number;
  providerBatchIds: string[];
  failureCount: number;
}): ResultsAnnouncementBatchOutcome {
  const { recipientCount, providerBatchIds, failureCount } = input;
  const successCount = providerBatchIds.length;

  if (successCount === recipientCount && failureCount === 0) {
    return buildFullSuccessOutcome(recipientCount, providerBatchIds);
  }

  if (successCount > 0 && failureCount > 0) {
    return buildPartialOutcome(recipientCount, providerBatchIds, failureCount);
  }

  if (successCount === 0) {
    return {
      kind: "known_failure",
      message: "Batch send rejected by provider.",
    };
  }

  return {
    kind: "ambiguous",
    message: "Unexpected provider batch response.",
  };
}

export function classifyPermissiveBatchResponse(input: {
  recipientCount: number;
  response:
    | { data: PermissiveBatchSuccess; error: null }
    | { data: null; error: PermissiveBatchErrorResponse };
}): ResultsAnnouncementBatchOutcome {
  if (input.response.error) {
    return classifyProviderError(input.response.error);
  }

  const providerBatchIds = input.response.data.data.map((entry) => entry.id);
  const failureCount = input.response.data.errors?.length ?? 0;

  return classifyBatchDataOutcome({
    recipientCount: input.recipientCount,
    providerBatchIds,
    failureCount,
  });
}

export function classifyBatchTransportError(error: unknown): ResultsAnnouncementBatchOutcome {
  const message =
    error instanceof Error ? error.message : "Provider request failed before a response.";

  return { kind: "ambiguous", message };
}
