import { Resend } from "resend";

import { getResendEnvConfig } from "@/lib/email/resend-env";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const config = getResendEnvConfig();
    resendClient = new Resend(config.apiKey);
  }

  return resendClient;
}

export function resetResendClientForTests(): void {
  resendClient = null;
}
