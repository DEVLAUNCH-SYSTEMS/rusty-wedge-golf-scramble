import { AdminViewContextBanner } from "@/components/admin/admin-tournament-context-badge";
import { EditPlayerProfileForm } from "@/components/admin/edit-player-profile-form";
import { PaymentProofPreview } from "@/components/admin/payment-proof-preview";
import { RegistrationDetailActions } from "@/components/admin/registration-detail-actions";
import { RegistrationDetailPanel } from "@/components/admin/registration-detail-panel";

import type { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";
import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type RegistrationDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminRegistrationDetail>>
>;

type RegistrationDetailViewProps = {
  registration: RegistrationDetail;
  tournamentLifecycleStatus: TournamentLifecycleStatus;
  isViewingActiveTournament: boolean;
  readOnlyReason?: string;
};

function canEditPlayerProfile(registrationStatus: string): boolean {
  return (
    registrationStatus === "pending_review" ||
    registrationStatus === "confirmed"
  );
}

function RegistrationEditSection({
  registration,
  readOnlyReason,
}: {
  registration: RegistrationDetail;
  readOnlyReason?: string;
}) {
  if (!canEditPlayerProfile(registration.registrationStatus)) {
    return null;
  }

  return (
    <EditPlayerProfileForm
      registrationId={registration.id}
      firstName={registration.firstName}
      lastName={registration.lastName}
      email={registration.email}
      phone={registration.phone}
      skillLevel={registration.skillLevel}
      preferredPlayers={registration.preferredPlayers}
      notes={registration.notes}
      readOnlyReason={readOnlyReason}
    />
  );
}

function RegistrationDetailMain({
  registration,
  readOnlyReason,
}: {
  registration: RegistrationDetail;
  readOnlyReason?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <RegistrationDetailPanel registration={registration} />
      <RegistrationEditSection
        registration={registration}
        readOnlyReason={readOnlyReason}
      />
      {registration.paymentProofPath ? (
        <PaymentProofPreview
          registrationId={registration.id}
          contentType={registration.paymentProofContentType}
        />
      ) : null}
    </div>
  );
}

function RegistrationDetailGrid({
  registration,
  readOnlyReason,
}: {
  registration: RegistrationDetail;
  readOnlyReason?: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <RegistrationDetailMain
        registration={registration}
        readOnlyReason={readOnlyReason}
      />
      <RegistrationDetailActions
        registrationId={registration.id}
        registrationStatus={registration.registrationStatus}
        paymentStatus={registration.paymentStatus}
        paymentReviewNotes={registration.paymentReviewNotes}
        adminNotes={registration.adminNotes}
        readOnlyReason={readOnlyReason}
      />
    </div>
  );
}

export function RegistrationDetailView(props: RegistrationDetailViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <AdminViewContextBanner
        lifecycleStatus={props.tournamentLifecycleStatus}
        isViewingActiveTournament={props.isViewingActiveTournament}
      />
      <RegistrationDetailGrid
        registration={props.registration}
        readOnlyReason={props.readOnlyReason}
      />
    </div>
  );
}
