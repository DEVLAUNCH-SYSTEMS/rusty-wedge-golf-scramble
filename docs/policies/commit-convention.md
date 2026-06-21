# Commit Convention

## Format

```jsx
<type>(scope): <clear description>
```

[optional body]

## Allowed Types

- feat: new feature
- fix: bug fix
- refactor: structural improvement without behavior change
- perf: performance improvement
- chore: non-functional work (deps, config, cleanup)
- docs: documentation only

## Examples

feat(queue): add court assignment rotation logic
fix(token-flow): restrict invoice query to token-scoped access
refactor(service): extract matchmaking logic into queue service
perf(api): reduce redundant DB calls in event assignment
chore(db): add index for projectId on notes table
