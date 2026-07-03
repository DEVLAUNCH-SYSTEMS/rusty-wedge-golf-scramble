"use client";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminBodyTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";
import { PaymentProofMedia } from "@/components/admin/payment-proof-media";
import { FormMessage } from "@/components/forms/form-message";
import { usePaymentProofPreview } from "@/hooks/use-payment-proof-preview";

type PaymentProofPreviewProps = {
  registrationId: string;
  contentType: string | null;
};

function PaymentProofContent({
  contentType,
  loadState,
}: {
  contentType: string | null;
  loadState: ReturnType<typeof usePaymentProofPreview>;
}) {
  if (loadState.status === "loading") {
    return <p className={`${adminBodyTextClassName} mt-4`}>Loading payment proof…</p>;
  }

  if (loadState.status === "error") {
    return (
      <div className="mt-4">
        <FormMessage tone="error" message={loadState.message} />
      </div>
    );
  }

  return <PaymentProofMedia contentType={contentType} objectUrl={loadState.objectUrl} />;
}

export function PaymentProofPreview({
  registrationId,
  contentType,
}: PaymentProofPreviewProps) {
  const proofUrl = `/api/admin/payment-proofs/${registrationId}`;
  const loadState = usePaymentProofPreview(proofUrl);

  return (
    <section className={adminCardClassName}>
      <h2 className={adminSectionTitleClassName}>Payment proof</h2>
      <PaymentProofContent contentType={contentType} loadState={loadState} />
    </section>
  );
}
