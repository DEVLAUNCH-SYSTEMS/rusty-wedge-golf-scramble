# Pull Request Checklist

## Summary

* What does this change do?
* Why is it needed?

---

## Cleanup and debt (when applicable)

* [ ] This PR is **behavior-preserving** OR the summary explains intentional behavior changes
* [ ] If this touches a **hotspot** (`app/actions/queue.ts`, `app/actions/notifications.ts`, or a contested file), coordination is noted (see `docs/engineering/cleanup/TWO_DEV_OPERATING_AGREEMENT.md`)
* [ ] No unnecessary new debt: avoided new `any`, lazy `"use client"` on pages, or layering logic on known-bad structure without improvement
* [ ] Verification: `npm run pr` (or equivalent CI) and manual steps for impacted flows are listed below
* [ ] This PR does **not** relax `eslint.config.mjs` or `tsconfig.json` unless that **is** the stated purpose (see `docs/engineering/LINT_POLICY_LOCK.md`)

**Hotspot / lock note (if any):**

```text
<!-- e.g. Working on queue.ts — extract X into lib/ — ETA Friday -->
```

---

## Architecture & Placement

* [ ] Logic is placed in the correct layer (UI / hook / service / DB)
* [ ] Business logic is NOT inside UI components
* [ ] Routes / server actions are thin (validate → call service → return)
* [ ] No direct DB access from UI

---

## Data Flow & State Ownership

* [ ] Data flow is clear and traceable (Server → Client → UI)
* [ ] State has a single source of truth
* [ ] No duplication of business state across layers
* [ ] External data follows pattern: Webhook → DB → App reads DB

---

## Security / RLS / Token Flows (if applicable)

* [ ] Queries are properly scoped (user / org / token context)
* [ ] No trust in client-provided identifiers
* [ ] Token routes only access token-scoped data
* [ ] No owner-level DB usage in user-facing flows

---

## Components & Structure

* [ ] Components are single-purpose and small (<100 lines)
* [ ] No deeply nested JSX
* [ ] Client components are minimal and isolated
* [ ] Server components used by default where possible

---

## Functions & Logic

* [ ] Functions are small and focused (single responsibility)
* [ ] No large multi-purpose handlers
* [ ] Naming clearly reflects intent

---

## Reuse & Abstraction

* [ ] No duplicated logic (extracted if reused)
* [ ] No unnecessary abstractions
* [ ] Existing patterns were reused where appropriate

---

## Complexity Check

* [ ] Change reduces or maintains system complexity
* [ ] No hidden side effects
* [ ] No “magic” or implicit behavior
* [ ] Easy to understand in <30 seconds

---

## Refactoring

* [ ] Touched code was improved where necessary
* [ ] No new code layered on top of poor structure

---

## Error Handling & Reliability

* [ ] Errors are handled explicitly
* [ ] No silent failures
* [ ] Behavior is deterministic and debuggable

---

## Final Gate

* [ ] Would a staff engineer approve this without major comments?
* [ ] Is ownership of logic and data clear?
* [ ] Does this follow `rules.mdc`?

If any answer is "no" → refactor before merging.