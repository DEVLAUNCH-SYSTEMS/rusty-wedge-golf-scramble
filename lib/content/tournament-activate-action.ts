export const TOURNAMENT_ACTIVATE_ACTION = {
  label: "Make current",
  description:
    "Set this tournament as the active event on the public site. The previously active tournament will no longer be shown on /.",
  confirmLabel:
    "I understand this changes which tournament the public site uses.",
} as const;
