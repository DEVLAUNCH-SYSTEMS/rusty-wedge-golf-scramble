type FormMessage = { tone: "success" | "error"; text: string };

export function resolveAdminFormDisabledMessage(
  disabled: boolean,
  disabledMessage: string | undefined,
  message: FormMessage | null,
): FormMessage | null {
  if (!disabled) {
    return message;
  }

  return {
    tone: "error",
    text:
      disabledMessage ??
      "This action is unavailable for the current tournament.",
  };
}
