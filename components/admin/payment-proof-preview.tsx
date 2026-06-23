"use client";

import { useState } from "react";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { adminBodyTextClassName, adminSectionTitleClassName } from "@/components/admin/admin-text-styles";

type PaymentProofImageProps = {
  proofUrl: string;
  onLoadError: () => void;
};

function PaymentProofImage({ proofUrl, onLoadError }: PaymentProofImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={proofUrl}
      alt="Payment proof screenshot"
      onError={onLoadError}
      className="mt-4 max-h-[480px] w-full rounded-lg border border-slate-200 object-contain"
    />
  );
}

function PaymentProofPdf({ proofUrl }: { proofUrl: string }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <iframe
        title="Payment proof PDF"
        src={proofUrl}
        className="h-[480px] w-full rounded-lg border border-slate-200"
      />
      <a
        href={proofUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-rw-gold-accessible hover:underline"
      >
        Open PDF in new tab
      </a>
    </div>
  );
}

type PaymentProofLoadErrorProps = {
  message: string;
};

function PaymentProofLoadError({ message }: PaymentProofLoadErrorProps) {
  return (
    <p className={`${adminBodyTextClassName} mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950`}>
      {message}
    </p>
  );
}

type PaymentProofPreviewProps = {
  registrationId: string;
  contentType: string | null;
};

const defaultLoadErrorMessage =
  process.env.NODE_ENV === "development"
    ? "Unable to load the payment proof. If you are developing locally, your VERCEL_OIDC_TOKEN may have expired — run npx vercel env pull .env.vercel.local, merge the new token into .env.local, and restart the dev server."
    : "Unable to load the payment proof. Confirm the Vercel Blob store is linked to this project (Production), remove any manually set VERCEL_OIDC_TOKEN from Vercel env vars, and redeploy.";

async function readProofLoadError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };

    if (payload.error) {
      return payload.error;
    }
  } catch {
    // Fall back to the default message when the API does not return JSON.
  }

  return defaultLoadErrorMessage;
}

async function handleLoadError(
  setLoadErrorMessage: (message: string) => void,
  response?: Response,
): Promise<void> {
  if (response) {
    setLoadErrorMessage(await readProofLoadError(response));
    return;
  }

  setLoadErrorMessage(defaultLoadErrorMessage);
}

function PaymentProofMedia({
  contentType,
  proofUrl,
  onImageLoadError,
}: {
  contentType: string | null;
  proofUrl: string;
  onImageLoadError: () => void;
}) {
  if (contentType === "application/pdf") {
    return <PaymentProofPdf proofUrl={proofUrl} />;
  }

  return <PaymentProofImage proofUrl={proofUrl} onLoadError={onImageLoadError} />;
}

export function PaymentProofPreview({
  registrationId,
  contentType,
}: PaymentProofPreviewProps) {
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const proofUrl = `/api/admin/payment-proofs/${registrationId}`;

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Payment proof</h2>
      {loadErrorMessage ? <PaymentProofLoadError message={loadErrorMessage} /> : null}
      <PaymentProofMedia
        contentType={contentType}
        proofUrl={proofUrl}
        onImageLoadError={() => {
          void handleLoadError(setLoadErrorMessage);
        }}
      />
    </section>
  );
}
