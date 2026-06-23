"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ActionResult } from "@/lib/actions/action-result";

type FormMessage = {
  tone: "success" | "error";
  text: string;
};

export function useAdminActionResult() {
  const router = useRouter();
  const [message, setMessage] = useState<FormMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<ActionResult>) {
    setMessage(null);

    startTransition(async () => {
      const result = await action();
      setMessage({
        tone: result.ok ? "success" : "error",
        text: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return { message, isPending, runAction, setMessage };
}
