# Slice 11 — Conditional public navigation + revalidation

**Status:** OPERATOR APPROVED (2026-08-27)  
**Environment:** Development only  
**Prerequisite:** Slice 10 OPERATOR APPROVED — see [`slice-10-approval.md`](slice-10-approval.md)

---

## Operator approval record

- **Slice 11 functionality approved** — conditional Teams nav, revalidation wiring, publication gate unchanged.
- **Desktop visual QA approved** — header/nav collision resolved; intro band + roster grid readable.
- **Fixed four-slot roster cards approved** — consistent card height; em-dash open slots.
- **Team #N + player-count presentation approved** — gold accent restrained; First Last roster.
- **Privacy / behavior unchanged** — nav visibility is not authorization; public DTO unchanged.

---

## Operator decisions (locked)

- **Teams nav link** appears only when active tournament `teamsPublished === true`.
- **Nav visibility is not authorization** — `/teams` remains gated server-side (Slice 10).
- **`buildPublicNavLinks({ teamsPublished, anchorBase })`** drives landing + `/teams` headers.
- **Revalidation:** publish/hide always revalidate `/` + `/teams`; roster mutations revalidate only when published.

---

## Implementation summary

| Area | Behavior |
|------|----------|
| Nav | `lib/content/landing-content.ts` — `buildPublicNavLinks`, `buildPublicRegisterHref` |
| Header | `PublicPageHeaderBand`, `PublicTeamsPageIntro` — no nav/title collision |
| Cards | `PublicTeamCard` — 4 fixed slots, player count, Team #N |
| Revalidation | `lib/actions/revalidate-public-teams-surfaces.ts` |
| Actions | `admin-teams-publication.ts`, `admin-teams.ts` |

---

## Validation (dev)

**Result:** PASS (2026-08-27)

---

## Authorization

Proceed to **Slice 12** (final regression, privacy, docs). Production untouched.
