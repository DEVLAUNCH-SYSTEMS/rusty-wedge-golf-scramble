# cursor-project-prompt

Follow `rules.mdc` as a hard contract.

This is a clean codebase. Do not introduce legacy patterns.

Requirements:

- keep `page.tsx` as a Server Component
- place business logic in services, not UI
- keep client components small and isolated
- do not import server-only modules into components or hooks
- keep files and functions small enough to stay readable
- preserve accessibility standards, especially semantic structure, labels, alt text, keyboard support, and valid interactive behavior

If an implementation would violate these rules:

- refactor before outputting code
- do not choose the fastest implementation over the correct one

The result must pass lint and typecheck without errors or warnings.
