# Security audit policy

## Dependency scanning

- `npm audit --audit-level=moderate` runs on every pull request, every push to `main`, and every Monday at 10:00 UTC.
- GitHub Dependency Review blocks pull requests that introduce moderate-or-higher vulnerable packages.
- `npm outdated || true` runs as a non-blocking freshness report so maintainers can see available upgrades without failing safe builds.

## Update cadence

- Dependabot checks npm packages and GitHub Actions weekly on Mondays.
- Security updates should be reviewed within two business days.
- Non-security dependency updates should be batched weekly unless they unblock development or fix a production defect.
- Major framework updates should be tested in a dedicated pull request with `npm run check`, `npm run build`, and `npm audit --audit-level=moderate` passing before merge.

## Form and mutation endpoint policy

- All new contact, newsletter, checkout, or metadata forms must validate with `src/lib/server/form-security.ts` on the server before side effects occur.
- All POST, PUT, PATCH, and DELETE routes must call the CSRF guard and reject missing or invalid tokens.
- Public forms must include a hidden honeypot field and submission timestamp; Turnstile or hCaptcha tokens can be required for abuse-prone routes.
- User text must be treated as untrusted, sanitized, and stored or rendered only after validation.
