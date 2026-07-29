import {
  adminMutedTextClassName,
  adminSectionTitleClassName,
} from "@/components/admin/admin-text-styles";

export function CreateTournamentIntro() {
  return (
    <>
      <h2 className={adminSectionTitleClassName}>Tournament details</h2>
      <p className={`text-sm ${adminMutedTextClassName}`}>
        New tournaments start as drafts. Open registration and make the event
        current from the tournaments list when you are ready.
      </p>
    </>
  );
}
