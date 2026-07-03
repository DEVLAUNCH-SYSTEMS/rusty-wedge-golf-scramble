import { useState } from "react";

import { submitWaitlist } from "@/lib/actions/submit-waitlist";
import { PUBLIC_ERROR_MESSAGE } from "@/lib/services/service-error";

type FormMessage = {
  tone: "success" | "error";
  text: string;
};

export function useWaitlistForm() {
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;

    try {
      const result = await submitWaitlist(new FormData(form));
      setMessage({ tone: result.ok ? "success" : "error", text: result.message });

      if (result.ok) {
        form.reset();
      }
    } catch {
      setMessage({ tone: "error", text: PUBLIC_ERROR_MESSAGE });
    } finally {
      setIsSubmitting(false);
    }
  }

  return { message, isSubmitting, handleSubmit };
}
