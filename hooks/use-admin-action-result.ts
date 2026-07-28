"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ActionResult } from "@/lib/actions/action-result";

type FormMessage = {
  tone: "success" | "error";
  text: string;
};

const ACTION_FAILURE_MESSAGE: FormMessage = {
  tone: "error",
  text: "Unable to complete that action. Please try again.",
};

function toFormMessage(result: ActionResult): FormMessage {
  return {
    tone: result.ok ? "success" : "error",
    text: result.message,
  };
}

export function useAdminActionResult() {
  const router = useRouter();
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isPending, setIsPending] = useState(false);

  function runAction(action: () => Promise<ActionResult>) {
    setMessage(null);
    setIsPending(true);

    void action()
      .then((result) => {
        setMessage(toFormMessage(result));
        if (result.ok) {
          router.refresh();
        }
      })
      .catch(() => {
        setMessage(ACTION_FAILURE_MESSAGE);
      })
      .finally(() => {
        setIsPending(false);
      });
  }

  return { message, isPending, runAction, setMessage };
}
