import { FormMessage } from "@/components/forms/form-message";

type AdminActionMessageProps = {
  message: { tone: "success" | "error"; text: string } | null;
};

export function AdminActionMessage({ message }: AdminActionMessageProps) {
  if (!message) {
    return null;
  }

  return <FormMessage tone={message.tone} message={message.text} />;
}
