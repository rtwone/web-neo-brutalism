# Irfan Hariyanto Portfolio

## Resend setup

The contact form posts to `/api/contact`. Deploy the project on a platform that supports the `api` serverless directory, such as Vercel, then configure these environment variables:

```text
RESEND_API_KEY=re_your_rotated_key
RESEND_FROM_EMAIL=Portfolio <onboarding@resend.dev>
CONTACT_TO_EMAIL=your-verified-email@example.com
```

Use a verified Resend domain for `RESEND_FROM_EMAIL` in production. Never expose `RESEND_API_KEY` in frontend code or commit it to the repository.

## Neon configuration

The frontend Neon endpoints are configured with:

```text
VITE_NEON_DATA_API_URL=https://ep-solitary-cloud-az9ut7o0.apirest.c-3.ap-southeast-1.aws.neon.tech/neondb/rest/v1
VITE_NEON_AUTH_URL=https://ep-solitary-cloud-az9ut7o0.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth
```

These URLs are public client configuration values. Database credentials, service-role tokens, IP hash secrets, and anti-spam operations must remain server-side.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
