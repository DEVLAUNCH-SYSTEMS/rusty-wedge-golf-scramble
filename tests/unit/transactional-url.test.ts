import { afterEach, describe, expect, it } from "vitest";

import { getTransactionalDatabaseUrl } from "@/lib/db/transactional-url";

const DEV_POOLED =
  "postgresql://user:pass@ep-dev-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
const DEV_UNPOOLED =
  "postgresql://user:pass@ep-dev.us-east-2.aws.neon.tech/neondb?sslmode=require";
const CI_UNPOOLED =
  "postgresql://user:pass@ep-ci.us-east-2.aws.neon.tech/neondb?sslmode=require";

describe("getTransactionalDatabaseUrl", () => {
  afterEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_UNPOOLED;
  });

  it("uses DATABASE_URL when no unpooled URL is configured", () => {
    process.env.DATABASE_URL = DEV_POOLED;

    expect(getTransactionalDatabaseUrl()).toBe(DEV_POOLED);
  });

  it("uses unpooled URL when it targets the same database as DATABASE_URL", () => {
    process.env.DATABASE_URL = DEV_POOLED;
    process.env.DATABASE_URL_UNPOOLED = DEV_UNPOOLED;

    expect(getTransactionalDatabaseUrl()).toBe(DEV_UNPOOLED);
  });

  it("ignores unpooled URL when it targets a different database", () => {
    process.env.DATABASE_URL = DEV_POOLED;
    process.env.DATABASE_URL_UNPOOLED = CI_UNPOOLED;

    expect(getTransactionalDatabaseUrl()).toBe(DEV_POOLED);
  });
});
