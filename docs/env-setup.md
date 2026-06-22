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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store read/write token |

## Vercel deployment sync

1. Open the Vercel project → **Settings** → **Environment Variables**.
2. Add each variable for **Production**, **Preview**, and **Development** as needed.
3. Pull locally after setting remote vars:

```bash
vercel env pull .env.local
```

4. Redeploy after changing production secrets.

See also [database-setup.md](./database-setup.md) for migrations and seeding.

## Security notes

- Never commit `.env.local` or production secrets.
- Use separate Neon branches for **CI**, preview, and production.
- GitHub Actions `DATABASE_URL` must be a CI/test branch only — never production.
- Rotate `NEON_AUTH_COOKIE_SECRET` if compromised.
