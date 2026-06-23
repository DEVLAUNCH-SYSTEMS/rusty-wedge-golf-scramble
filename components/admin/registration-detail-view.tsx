import { PaymentProofPreview } from "@/components/admin/payment-proof-preview";
import { RegistrationDetailActions } from "@/components/admin/registration-detail-actions";
import { RegistrationDetailPanel } from "@/components/admin/registration-detail-panel";

import type { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";

type RegistrationDetailViewProps = {
  registration: NonNullable<Awaited<ReturnType<typeof getAdminRegistrationDetail>>>;
};

export function RegistrationDetailView({ registration }: RegistrationDetailViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-6">
        <RegistrationDetailPanel registration={registration} />
        {registration.paymentProofPath ? (
          <PaymentProofPreview
            registrationId={registration.id}
            contentType={registration.paymentProofContentType}
          />
        ) : null}
      </div>
      <RegistrationDetailActions
        registrationId={registration.id}
        registrationStatus={registration.registrationStatus}
        paymentStatus={registration.paymentStatus}
        paymentReviewNotes={registration.paymentReviewNotes}
        adminNotes={registration.adminNotes}
      />
    </div>
  );
}
