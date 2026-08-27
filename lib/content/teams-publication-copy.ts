export function teamsPublicationStatusLabel(teamsPublished: boolean): string {
  return teamsPublished ? "Published" : "Hidden";
}

export function teamsPublicationStatusDescription(teamsPublished: boolean): string {
  return teamsPublished
    ? "Assigned teams are visible on the public site when the Teams page is enabled."
    : "Assigned teams are hidden from the public site.";
}

export function teamsPublicationActionDescription(teamsPublished: boolean): string {
  return teamsPublished
    ? "Hide teams to remove them from the public site."
    : "Publish teams to make the current roster visible on the public site.";
}

export function teamsPublicationAcknowledgementCopy(teamsPublished: boolean): string {
  return teamsPublished
    ? "I understand that hiding teams removes them from the public site."
    : "I understand that publishing teams makes the current roster visible on the public site.";
}

export type TeamsPublicationFormConfig = {
  submitLabel: string;
  pendingLabel: string;
  danger: boolean;
};

export function resolveTeamsPublicationFormConfig(
  teamsPublished: boolean,
): TeamsPublicationFormConfig {
  if (teamsPublished) {
    return {
      submitLabel: "Hide teams",
      pendingLabel: "Hiding…",
      danger: true,
    };
  }

  return {
    submitLabel: "Publish teams",
    pendingLabel: "Publishing…",
    danger: false,
  };
}
