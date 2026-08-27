"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  createDeleteTeamSubmitHandler,
  type DeleteTeamFormMessage,
} from "@/hooks/delete-team-submit-handler";

export function useDeleteTeamSubmit(redirectOnSuccess?: string) {
  const router = useRouter();
  const [message, setMessage] = useState<DeleteTeamFormMessage | null>(null);
  const [isPending, setIsPending] = useState(false);
  const submitDelete = createDeleteTeamSubmitHandler({
    redirectOnSuccess,
    router,
    setMessage,
    setIsPending,
  });

  return { message, isPending, submitDelete };
}

export { resolveDeleteTeamDisplayMessage } from "@/hooks/delete-team-submit-handler";
