import { EditPlayerProfileForm } from "@/components/admin/edit-player-profile-form";
import { PaymentProofPreview } from "@/components/admin/payment-proof-preview";
import { RegistrationDetailActions } from "@/components/admin/registration-detail-actions";
import { RegistrationDetailPanel } from "@/components/admin/registration-detail-panel";
import { isLifecycleArchived } from "@/lib/services/tournament-lifecycle";

import type { getAdminRegistrationDetail } from "@/lib/services/admin-registration-list";
import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

type RegistrationDetail = NonNullable<
  Awaited<ReturnType<typeof getAdminRegistrationDetail>>
>;

type RegistrationDetailViewProps = {
  registration: RegistrationDetail;
  tournamentLifecycleStatus: TournamentLifecycleStatus;
};

function canEditPlayerProfile(registrationStatus: string): boolean {
  return (
    registrationStatus === "pending_review" ||
    registrationStatus === "confirmed"
  );
}

function archivedEditMessage(
  lifecycleStatus: TournamentLifecycleStatus,
): string | undefined {
  if (!isLifecycleArchived(lifecycleStatus)) {
    return undefined;
  }

  return "This tournament is archived. Player profiles cannot be edited.";
}

function RegistrationEditSection({
  registration,
  tournamentLifecycleStatus,
}: RegistrationDetailViewProps) {
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
      readOnlyReason={archivedEditMessage(tournamentLifecycleStatus)}
    />
  );
}

function RegistrationDetailMain({
  registration,
  tournamentLifecycleStatus,
}: RegistrationDetailViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <RegistrationDetailPanel registration={registration} />
      <RegistrationEditSection
        registration={registration}
        tournamentLifecycleStatus={tournamentLifecycleStatus}
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

export function RegistrationDetailView({
  registration,
  tournamentLifecycleStatus,
}: RegistrationDetailViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <RegistrationDetailMain
        registration={registration}
        tournamentLifecycleStatus={tournamentLifecycleStatus}
      />
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
