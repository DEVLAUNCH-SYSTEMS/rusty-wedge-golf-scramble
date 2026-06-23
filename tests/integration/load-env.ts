import { loadEnvFiles } from "@/lib/db/load-env";

process.env.RUN_CI_GATE = "1";
loadEnvFiles();
