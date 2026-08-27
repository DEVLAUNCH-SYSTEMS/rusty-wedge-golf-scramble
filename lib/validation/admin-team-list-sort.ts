export type AdminTeamListSort = "asc" | "desc";

export function parseAdminTeamListSort(value: string | undefined): AdminTeamListSort {
  return value === "desc" ? "desc" : "asc";
}
