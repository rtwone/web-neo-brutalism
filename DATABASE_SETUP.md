# Visitor Stats Database Setup

Visitor Stats uses Supabase PostgreSQL through the server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The browser's persisted visitor ID is used for Like deduplication, with a server-side hash of the real IP address as a fallback.

## 1. Create a Supabase project

1. Open the Supabase dashboard and create a project.
2. Copy the Project URL and service role key from Project Settings > API.
3. Keep the service role key private and server-side.

## 2. Run the schema

1. Open the Supabase SQL Editor.
2. Open `sql/schema.sql` from this project.
3. Run the complete file.

This creates `site_stats`, `visitors`, `visitor_likes`, `page_views`, `site_content`, and `twibbon_config`, including indexes, foreign keys, unique Like protection, and non-negative statistic constraints.

## 3. Configure local development

Copy `.env.example` values into your local `.env` and set:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
IP_HASH_SECRET=<long-random-secret>
```

The rate-limit defaults are 120 API requests per IP per 60 seconds globally, 5 Like requests per 60 seconds, 30 View requests per 60 seconds, and 180-minute View deduplication. They can be changed with the matching environment variables.

## 4. Configure Vercel

Add these server-side environment variables in the Vercel project settings for every environment that needs stats:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
IP_HASH_SECRET
LIKE_RATE_LIMIT
LIKE_RATE_WINDOW
VIEW_RATE_LIMIT
VIEW_RATE_WINDOW
GLOBAL_RATE_LIMIT
GLOBAL_RATE_WINDOW
VIEW_DEDUP_MINUTES
```

Do not prefix server secrets with `VITE_`; Vite variables are exposed to the browser.

## 5. Run and test

```text
npm run dev
npm run build
```

Open the portfolio and use the Visitor Stats Like button. The first View is recorded through `POST /api/stats/view`; refreshing within the deduplication window does not increment it. A repeated Like for the same visitor and page is ignored by the database unique constraint.

The public routes are:

```text
GET  /api/stats?page=/
POST /api/stats/view?page=/
POST /api/stats/like?page=/
```

The admin Twibbon settings are available at `/admin/twibbon`. The page stores text configuration in `twibbon_config`; the template image is intentionally not managed by this panel yet.

The API does not accept client-provided Like or View totals. Rate-limited requests return HTTP 429 with a generic error response.
