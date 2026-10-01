# Irfan Hariyanto Portfolio

## Resend setup

The contact form posts to `/api/contact`. Deploy the project on a platform that supports the `api` serverless directory, such as Vercel, then configure these environment variables:

```text
RESEND_API_KEY=re_your_rotated_key
RESEND_FROM_EMAIL=Portfolio <onboarding@resend.dev>
CONTACT_TO_EMAIL=your-verified-email@example.com
ADMIN_PASSWORD=replace-with-a-long-admin-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Use a verified Resend domain for `RESEND_FROM_EMAIL` in production. Never expose `RESEND_API_KEY` in frontend code or commit it to the repository.

## Admin panel

Run the complete `sql/schema.sql` file in Supabase, then configure `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` server-side. Open `/admin` to edit the About photo, skills, projects, contact social links, Resend recipient email, endpoint discovery cards, and `/admin/twibbon` to edit the Twibbon title, eyebrow, subtitle, caption, and output filename. The CMS stores portfolio content in `site_content` and Twibbon settings in `twibbon_config`; the contact API uses the saved recipient and falls back to `CONTACT_TO_EMAIL` when no CMS value exists.

For images, create a public Supabase Storage bucket named `portfolio-assets` and upload the files there. The admin page uploads images directly to that bucket and stores the public URL in the `site_content` JSON, so the media lives in Supabase instead of in the repo or as a local path.

## Supabase configuration

The server-side stats API uses these Supabase environment variables:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run `sql/schema.sql` in the Supabase SQL Editor. Keep `SUPABASE_SERVICE_ROLE_KEY` and `IP_HASH_SECRET` server-side and never prefix them with `VITE_`.

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
