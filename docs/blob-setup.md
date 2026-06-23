# Vercel Blob setup (payment proofs)

Payment proof screenshots are stored in a **private** Vercel Blob store. Uploads happen in the registration server action; admins retrieve proofs through `/api/admin/payment-proofs/[registrationId]`.

## 1. Create the Blob store (Vercel dashboard)

1. Open the Vercel project for this app.
2. Go to **Storage** → **Create Database / Store** → **Blob**.
3. Name the store (e.g. `rusty-wedge-payment-proofs`).
4. Choose the same region as your app if prompted.
5. Create the store and link it to this project.

Vercel automatically adds a **`BLOB_READ_WRITE_TOKEN`** environment variable to the linked project when the store is connected.

## 2. Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | Vercel + `.env.local` | Read/write private blobs (`put`, `get`, `del`) |

Local development:

```bash
vercel env pull .env.local
```

Or copy the token manually from **Project → Settings → Environment Variables**.

Set the token for **Development**, **Preview**, and **Production** in Vercel. Use separate stores or prefixes per environment if you want isolation (optional in V1).

## 3. GitHub Actions (optional for CI)

Add repository secret:

| Secret | Purpose |
|--------|---------|
| `BLOB_READ_WRITE_TOKEN` | Future E2E tests for registration upload + proof viewer |

The `ci-gate` job already passes this secret when present. It is optional until upload/proof E2E tests run against real Blob storage.

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

1. Ensure `.env.local` includes `BLOB_READ_WRITE_TOKEN`.
2. Run `npm run dev`.
3. Submit a test registration with a payment proof image.
4. Confirm a row in `registrations` has `payment_proof_path` set.
5. Sign in as an allowlisted admin and request:

   `GET /api/admin/payment-proofs/{registrationId}`

   Expect `200` with the image/PDF bytes. Unauthenticated requests should return `401`.

## 6. Production checklist

- [ ] Blob store created and linked to the Vercel project
- [ ] `BLOB_READ_WRITE_TOKEN` set for Production (and Preview if used)
- [ ] Local `.env.local` synced via `vercel env pull`
- [ ] Test upload on preview deployment before go-live
- [ ] Confirm proof viewer returns `401`/`403` without admin session

## 7. Post-event cleanup (manual V1)

See [post-event-checklist.md](./qa/post-event-checklist.md) item **P4**: delete blobs from the Vercel Blob dashboard (or via SDK `del()`) and clear `payment_proof_path` in the database when proofs are no longer needed.
