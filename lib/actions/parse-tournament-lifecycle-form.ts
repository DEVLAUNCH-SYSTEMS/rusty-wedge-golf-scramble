import { z } from "zod";

import { tournamentLifecycleStatusEnum } from "@/lib/db/schema/enums";

import type { TournamentLifecycleStatus } from "@/lib/services/tournament-lifecycle";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const lifecycleTargets = tournamentLifecycleStatusEnum.enumValues as [
  TournamentLifecycleStatus,
  ...TournamentLifecycleStatus[],
];

const tournamentLifecycleTargetSchema = z.enum(lifecycleTargets, {
  message: "Choose a valid lifecycle action.",
});

export type TournamentLifecycleFormInput = {
  tournamentId: string;
  toStatus: TournamentLifecycleStatus;
  confirmYear: string;
  confirmAcknowledged: string;
};

export function parseTournamentLifecycleFormData(
  formData: FormData,
): TournamentLifecycleFormInput {
  const tournamentId = readString(formData, "tournamentId");

  if (!tournamentId) {
    throw new z.ZodError([
      {
        code: "custom",
        message: "Tournament is required.",
        path: ["tournamentId"],
      },
    ]);
  }

  return {
    tournamentId,
    toStatus: tournamentLifecycleTargetSchema.parse(
      readString(formData, "toStatus"),
    ),
    confirmYear: readString(formData, "confirmYear"),
    confirmAcknowledged: readString(formData, "confirmAcknowledged"),
  };
}
