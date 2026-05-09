# External origin allowlist

The production CSP intentionally allows no third-party script or font origins by default.

## Current policy

| Asset class | Allowed origins | Rationale |
| --- | --- | --- |
| Scripts | `'self'` | Application bundles are built and served from the deployment origin. |
| Fonts | `'self'` | Google Fonts were removed from the page shell; typography now uses local/system fonts so critical rendering does not depend on a third-party font request. |
| Styles | `'self'` plus `'unsafe-inline'` | Astro/Tailwind output and existing inline height styles require inline style compatibility. Do not add remote stylesheet hosts without updating the CSP review. |

## Change-control for new origins

- Add external origins only when the asset cannot be self-hosted or bundled.
- Prefer local npm packages, vendored static assets, or first-party API routes over remote scripts.
- If Turnstile or hCaptcha is enabled for a high-abuse form, add only the provider's required script and verification origins in the same pull request as the server-side verifier.
- Any CSP expansion must include a build check and a security review note in the pull request body.
