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

function PaymentProofLoadError() {
  return (
    <p className={`${adminBodyTextClassName} mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950`}>
      Unable to load the payment proof. If you are developing locally, your{" "}
      <code className="text-sm">VERCEL_OIDC_TOKEN</code> may have expired — run{" "}
      <code className="text-sm">npx vercel env pull .env.vercel.local</code>, merge
      the new token into <code className="text-sm">.env.local</code>, and restart the
      dev server.
    </p>
  );
}

type PaymentProofPreviewProps = {
  registrationId: string;
  contentType: string | null;
};

export function PaymentProofPreview({
  registrationId,
  contentType,
}: PaymentProofPreviewProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const proofUrl = `/api/admin/payment-proofs/${registrationId}`;

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Payment proof</h2>
      {loadFailed ? <PaymentProofLoadError /> : null}
      {contentType === "application/pdf" ? (
        <PaymentProofPdf proofUrl={proofUrl} />
      ) : (
        <PaymentProofImage proofUrl={proofUrl} onLoadError={() => setLoadFailed(true)} />
      )}
    </section>
  );
}
