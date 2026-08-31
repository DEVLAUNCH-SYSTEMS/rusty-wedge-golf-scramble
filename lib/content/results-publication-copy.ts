export function resultsPublicationStatusLabel(resultsPublished: boolean): string {
  return resultsPublished ? "Published" : "Hidden";
}

export function resultsPublicationStatusDescription(resultsPublished: boolean): string {
  return resultsPublished
    ? "Final results are visible on the public site when results mode is enabled."
    : "Final results are hidden from the public site.";
}

export function resultsPublicationActionDescription(resultsPublished: boolean): string {
  return resultsPublished
    ? "Hide results to remove them from the public site."
    : "Publish results to make placed teams visible on the public site.";
}

export function resultsPublicationAcknowledgementCopy(resultsPublished: boolean): string {
  return resultsPublished
    ? "I understand that hiding results removes them from the public site."
    : "I understand that publishing results makes placed teams visible on the public site.";
}

export type ResultsPublicationFormConfig = {
  submitLabel: string;
  pendingLabel: string;
  danger: boolean;
};

export function resolveResultsPublicationFormConfig(
  resultsPublished: boolean,
): ResultsPublicationFormConfig {
  if (resultsPublished) {
    return {
      submitLabel: "Hide results",
      pendingLabel: "Hiding…",
      danger: true,
    };
  }

  return {
    submitLabel: "Publish results",
    pendingLabel: "Publishing…",
    danger: false,
  };
}
