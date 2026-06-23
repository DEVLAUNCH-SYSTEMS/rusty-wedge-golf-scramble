# Vercel Blob setup (payment proofs)

Payment proof screenshots are stored in a **private** Vercel Blob store. Uploads happen in the registration server action; admins retrieve proofs through `/api/admin/payment-proofs/[registrationId]`.

## 1. Create the Blob store (Vercel dashboard)

1. Open the Vercel project for this app.
2. Go to **Storage** → **Create Database / Store** → **Blob**.
3. Name the store (e.g. `rusty-wedge-payment-proofs`).
4. Choose the same region as your app if prompted.
5. Create the store and **connect it to this project**.
6. When connecting, include the **Development** environment (not just Production/Preview) so local uploads work.

## 2. Environment variables (OIDC — current Vercel default)

When a Blob store is connected to a project, Vercel typically adds:

| Variable | In dashboard? | Purpose |
|----------|----------------|---------|
| `BLOB_STORE_ID` | Yes | Identifies the Blob store |
| `BLOB_WEBHOOK_PUBLIC_KEY` | Yes | Verifies signed webhook callbacks |
| `VERCEL_OIDC_TOKEN` | **No** (CLI only for local) | Short-lived auth for `put` / `get` / `del` |
| `BLOB_READ_WRITE_TOKEN` | Sometimes (legacy) | Long-lived token; older stores only |

**You will not always see `BLOB_READ_WRITE_TOKEN`.** That is expected with OIDC-connected stores.

On Vercel deployments, `VERCEL_OIDC_TOKEN` is injected automatically. **Do not add `VERCEL_OIDC_TOKEN` to Vercel project env vars** (for example by syncing a local `vercel env pull` file) — a copied token expires quickly and breaks proof viewing in production. Locally, pull it with the Vercel CLI only into `.env.local`.

### Local development setup

From the project root:

```bash
npx vercel link
npx vercel env pull .env.local
```

Then restart `npm run dev`.

`VERCEL_OIDC_TOKEN` is short-lived. If uploads suddenly fail after working, run `npx vercel env pull .env.local` again.

Do **not** hand-copy only `BLOB_STORE_ID` and `BLOB_WEBHOOK_PUBLIC_KEY` — that is not enough for local uploads.

### Legacy read-write token (optional)

If your store still exposes `BLOB_READ_WRITE_TOKEN` (older setup), you can use that instead of OIDC for local dev or CI. The SDK accepts either:

- `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`, or
- `BLOB_READ_WRITE_TOKEN`

## 3. GitHub Actions (optional for CI)

Add repository secret:

| Secret | Purpose |
|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | E2E tests for registration upload + proof viewer (if not using OIDC in CI) |

The `ci-gate` job passes this secret when present. It is optional until upload/proof E2E tests run against real Blob storage.

## 4. How the app uses Blob

| Operation | Code | Path pattern |
|-----------|------|--------------|
| Upload (registration) | `lib/services/payment-proof-blob.ts` → `put()` | `payment-proofs/{tournamentId}/{uuid}.{ext}` |
| View (admin only) | `lib/services/payment-proof-viewer.ts` → `get()` | Pathname from DB only — never from the URL |

Store settings:

- **Access:** `private` on upload (`access: "private"`)
- **Max size:** 5 MB (validated before upload)
- **Types:** JPG, PNG, PDF

## 5. Verify locally

1. Run `npx vercel link` and `npx vercel env pull .env.local`.
2. Confirm `.env.local` includes `BLOB_STORE_ID` and `VERCEL_OIDC_TOKEN` (or `BLOB_READ_WRITE_TOKEN`).
3. Run `npm run dev`.
4. Submit a test registration with a payment proof image.
5. Confirm a row in `registrations` has `payment_proof_path` set.
6. Sign in as an allowlisted admin and request:

   `GET /api/admin/payment-proofs/{registrationId}`

   Expect `200` with the image/PDF bytes. Unauthenticated requests should return `401`.

## 6. Production checklist

- [ ] Blob store created and linked to the Vercel project (including Development if you test locally)
- [ ] Local `.env.local` synced via `vercel env pull` (not manual partial copy)
- [ ] Test upload on preview deployment before go-live
- [ ] Confirm proof viewer returns `401`/`403` without admin session

## 7. Post-event cleanup (manual V1)

See [post-event-checklist.md](./qa/post-event-checklist.md) item **P4**: delete blobs from the Vercel Blob dashboard (or via SDK `del()`) and clear `payment_proof_path` in the database when proofs are no longer needed.
