# Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Fill in values from the Neon dashboard and Vercel project settings.

## Required variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres connection string (app runtime; pooled is OK) |
| `DATABASE_URL_UNPOOLED` | Optional direct Neon URL for `drizzle-kit migrate` (recommended in CI) |
| `NEON_AUTH_BASE_URL` | Neon Auth project URL |
| `NEON_AUTH_COOKIE_SECRET` | Session cookie signing secret (32+ chars) |
| `BLOB_STORE_ID` | Vercel Blob store id (set when store is linked) |
| `VERCEL_OIDC_TOKEN` | Short-lived Blob auth for local dev (`vercel env pull`; auto on Vercel) |
| `BLOB_READ_WRITE_TOKEN` | Optional legacy Blob token (older stores / CI) |

See [blob-setup.md](./blob-setup.md) for creating the Vercel Blob store and verifying uploads.

## Vercel deployment sync

1. Open the Vercel project → **Settings** → **Environment Variables**.
2. Add each variable for **Production**, **Preview**, and **Development** as needed.
3. Pull Vercel-only vars locally (do **not** overwrite Neon values):

```bash
npx vercel env pull .env.vercel.local
```

Merge `BLOB_*` and `VERCEL_OIDC_TOKEN` from `.env.vercel.local` into `.env.local`, or append with care. Running `vercel env pull .env.local` replaces the entire file and will remove Neon variables.

4. Redeploy after changing production secrets.

See also [database-setup.md](./database-setup.md) for migrations and seeding.

## Security notes

- Never commit `.env.local` or production secrets.
- Use separate Neon branches for **CI**, preview, and production.
- GitHub Actions `DATABASE_URL` must be a CI/test branch only — never production.
- Rotate `NEON_AUTH_COOKIE_SECRET` if compromised.
