# First PR Example

This is an example of what a small, standards-compliant PR should look like in a new project using the strict setup.

---

## Example task

Add a newsletter signup form to the marketing homepage.

### Requirements

- keep `app/page.tsx` as a Server Component
- keep the interactive form isolated in a small Client Component
- do not place submission logic directly in the page
- keep accessibility strong
- keep the data flow obvious

---

## Recommended file structure

```text
app/
  page.tsx
components/
  marketing/
    newsletter-signup-form.tsx
lib/
  actions/
    newsletter.ts
```

---

## 1. Server page stays thin

### `app/page.tsx`

```tsx
import { NewsletterSignupForm } from "@/components/marketing/newsletter-signup-form";

export default function HomePage() {
  return (
    <main>
      <section>
        <h1>Build better systems</h1>
        <p>Get practical engineering notes in your inbox.</p>
        <NewsletterSignupForm />
      </section>
    </main>
  );
}
```

### Why this is correct

- `page.tsx` remains a Server Component
- the page renders structure and content only
- interactivity is isolated elsewhere

---

## 2. Client form stays focused

### `components/marketing/newsletter-signup-form.tsx`

```tsx
"use client";

import { useState } from "react";

import { subscribeToNewsletter } from "@/lib/actions/newsletter";

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      await subscribeToNewsletter({ email });
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Newsletter signup">
      <label htmlFor="newsletter-email">Email address</label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Subscribe"}
      </button>

      {status === "success" && <p>Thanks for subscribing.</p>}
      {status === "error" && <p>Something went wrong. Please try again.</p>}
    </form>
  );
}
```

### Why this is correct

- client behavior is isolated to a leaf component
- accessibility basics are preserved
- the component is focused on form interaction only
- the page does not become client-side just because the form needs state

---

## 3. Business logic lives outside UI

### `lib/actions/newsletter.ts`

```tsx
export async function subscribeToNewsletter(input: { email: string }) {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  const response = await fetch("/api/newsletter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  if (!response.ok) {
    throw new Error("Failed to subscribe.");
  }
}
```

### Why this is correct

- submission logic is outside the component
- validation and request handling are separated from rendering
- future changes have a clear place to live

---

## What would be wrong instead

### Bad example 1

Putting `"use client"` at the top of `app/page.tsx`

Why it is wrong:

- converts the whole page into a Client Component
- expands client JS unnecessarily
- weakens ownership boundaries

### Bad example 2

Putting fetch / business logic inline in the JSX file and growing the page into a 250-line route

Why it is wrong:

- mixes concerns
- makes the route harder to revisit later
- creates unclear ownership of logic

### Bad example 3

Putting newsletter API logic directly inside the button click handler

Why it is wrong:

- business logic lives in UI
- harder to test and reuse
- harder to refactor later

---

## Example PR summary

```md
Adds a newsletter signup form to the homepage.

### What changed
- kept `app/page.tsx` server-rendered
- added `NewsletterSignupForm` as a small client leaf component
- added `subscribeToNewsletter` action helper in `lib/actions/newsletter`

### Data flow
- server page renders static marketing content
- client form manages local interaction state
- form submits through action helper

### Why this structure
- preserves server-first page architecture
- keeps business logic out of UI
- keeps the feature easy to extend later
```

---

## Standard this example demonstrates

- server-first page
- small client island
- business logic outside UI
- accessible form structure
- clear file ownership
- readable code with obvious data flow

Use this as the mental model for new features in strict-mode projects.
