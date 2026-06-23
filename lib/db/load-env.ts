import { config } from "dotenv";

import {
  applyCiGateDatabaseEnv,
  shouldForceCiGateDatabaseEnv,
} from "@/lib/db/ci-gate-env";

export function loadEnvFiles(): void {
  config({ path: ".env.local" });
  config();
  applyCiGateDatabaseEnv(shouldForceCiGateDatabaseEnv());
}
