"use client";

import { useRouter } from "next/navigation";

import { adminCardClassName } from "@/components/admin/admin-form-styles";
import { CreateTournamentFormBody } from "@/components/admin/create-tournament-form-body";
import { CreateTournamentIntro } from "@/components/admin/create-tournament-intro";
import { useAdminActionResult } from "@/hooks/use-admin-action-result";
import { createTournamentAction } from "@/lib/actions/admin-tournament-create";

import type { TournamentCreateFormValues } from "@/lib/services/tournament-create-form-defaults";

type CopySource = { id: string; label: string };

type CreateTournamentFormProps = {
  defaults: TournamentCreateFormValues;
  copySources: CopySource[];
  selectedCopyFromId: string | null;
};

function submitCreateTournament(
  router: ReturnType<typeof useRouter>,
  formData: FormData,
) {
  return createTournamentAction(formData).then((result) => {
    if (result.ok) router.push("/admin/tournaments");
    return result;
  });
}

export function CreateTournamentForm(props: CreateTournamentFormProps) {
  const router = useRouter();
  const { message, isPending, runAction } = useAdminActionResult();

  return (
    <section className={adminCardClassName}>
      <CreateTournamentIntro />
      <CreateTournamentFormBody
        {...props}
        isPending={isPending}
        message={message}
        onNavigate={(path) => router.push(path)}
        onSubmit={(formData) => {
          runAction(() => submitCreateTournament(router, formData));
        }}
      />
    </section>
  );
}
