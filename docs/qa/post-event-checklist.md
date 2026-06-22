# Post-Event Checklist

Run after the tournament concludes.

## Archive exports

- [ ] **P1** Export final registrations CSV
- [ ] **P2** Export final teams CSV

## Payment proof retention

- [ ] **P3** Organizers decide: retain or delete Venmo payment screenshots
- [ ] **P4** If deleting: remove blobs from Vercel Blob and clear `payment_proof_path` on registrations
- [ ] **P7** Document what was kept/deleted and when

## Shutdown

- [ ] **P5** Disable registration: `UPDATE tournaments SET registration_enabled = false WHERE slug = '2026-rusty-wedge';`
- [ ] **P6** Optional: replace landing page with “registration closed” or take site offline

## Event-day backup (reference)

- [ ] **O5** Day before: export registrations + teams CSV
- [ ] **O6** Morning of: re-export if changes occurred overnight
