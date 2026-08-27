# Visitor Stats Database Setup

Visitor Stats uses Neon PostgreSQL through the server-only `DATABASE_URL`. The browser never receives database credentials or `IP_HASH_SECRET`.

## 1. Create a Neon project

1. Open the Neon console and create a PostgreSQL project.
2. Copy the pooled connection string from the Connect dialog.
3. Keep the connection string private.

## 2. Run the schema

1. Open the Neon SQL Editor.
2. Open `sql/schema.sql` from this project.
3. Run the complete file.

This creates `site_stats`, `visitors`, `visitor_likes`, and `page_views`, including indexes, foreign keys, unique Like protection, and non-negative statistic constraints.

## 3. Configure local development

Copy `.env.example` values into your local `.env` and set:

```text
DATABASE_URL=postgresql://...
IP_HASH_SECRET=<long-random-secret>
```

The rate-limit defaults are 5 Like requests per 60 seconds, 30 View requests per 60 seconds, and 180-minute View deduplication. They can be changed with the matching environment variables.

## 4. Configure Vercel

Add these server-side environment variables in the Vercel project settings for every environment that needs stats:

```text
DATABASE_URL
IP_HASH_SECRET
LIKE_RATE_LIMIT
LIKE_RATE_WINDOW
VIEW_RATE_LIMIT
VIEW_RATE_WINDOW
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

The API does not accept client-provided Like or View totals. Rate-limited requests return HTTP 429 with a generic error response.
