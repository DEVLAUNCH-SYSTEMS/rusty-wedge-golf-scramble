# Admin Onboarding

Each tournament organizer uses their **own Neon Auth account**. Do not share admin credentials.

## Steps

1. Deploy the app with Neon Auth configured (`NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`).
2. Visit `/auth/sign-in` and create a Neon Auth account with your organizer email.
3. After sign-in, note your Neon Auth user ID from the Neon Auth dashboard or session payload.
4. Insert an allowlist row in `admin_users` (via SQL or Neon console):

```sql
INSERT INTO admin_users (neon_auth_user_id, email, display_name)
VALUES ('YOUR_NEON_AUTH_USER_ID', 'you@example.com', 'Your Name');
```

5. Sign out and sign in again, then open `/admin`.

## Adding another organizer

Repeat steps 2–4 for each person. Each organizer gets a separate Neon Auth account and allowlist row.

## Removing access

Delete the row from `admin_users` for that `neon_auth_user_id`. This immediately revokes admin access on the next request.
