"use server";

import { revalidatePath } from "next/cache";

import { getActiveTournament } from "@/lib/services/tournament";

export async function revalidatePublicLandingAndTeams(): Promise<void> {
  revalidatePath("/teams");
  revalidatePath("/");
}

export async function revalidatePublicLandingAndTeamsIfPublished(): Promise<void> {
  const tournament = await getActiveTournament();

  if (tournament?.teamsPublished) {
    await revalidatePublicLandingAndTeams();
  }
}

export async function revalidatePublicLandingAndTeamsIfResultsPublished(): Promise<void> {
  const tournament = await getActiveTournament();

  if (tournament?.resultsPublished) {
    await revalidatePublicLandingAndTeams();
  }
}

export async function revalidatePublicTeamsSurfacesIfVisible(): Promise<void> {
  const tournament = await getActiveTournament();

  if (tournament?.teamsPublished || tournament?.resultsPublished) {
    await revalidatePublicLandingAndTeams();
  }
}
