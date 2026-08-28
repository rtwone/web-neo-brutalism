SET TIME ZONE 'Asia/Jakarta';

CREATE TABLE IF NOT EXISTS site_stats (
    page VARCHAR(255) PRIMARY KEY,
    likes BIGINT NOT NULL DEFAULT 0 CHECK (likes >= 0),
    views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0)
);

CREATE TABLE IF NOT EXISTS visitors (
    visitor_id VARCHAR(255) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS visitor_likes (
    id BIGSERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    page VARCHAR(255) NOT NULL,
    UNIQUE (visitor_id, page)
);

CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    page VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_stats DROP COLUMN IF EXISTS is_away;
ALTER TABLE site_stats DROP COLUMN IF EXISTS updated_at;
ALTER TABLE visitors DROP COLUMN IF EXISTS created_at;
ALTER TABLE visitors DROP COLUMN IF EXISTS last_seen_at;
ALTER TABLE visitor_likes DROP COLUMN IF EXISTS ip_hash;
ALTER TABLE visitor_likes DROP COLUMN IF EXISTS created_at;
ALTER TABLE page_views DROP COLUMN IF EXISTS ip_hash;
ALTER TABLE page_views DROP COLUMN IF EXISTS user_agent_hash;
DROP INDEX IF EXISTS visitor_likes_ip_page_unique;

ALTER TABLE visitor_likes DROP CONSTRAINT IF EXISTS visitor_likes_visitor_id_fkey;
ALTER TABLE page_views DROP CONSTRAINT IF EXISTS page_views_visitor_id_fkey;
ALTER TABLE visitor_likes ALTER COLUMN visitor_id TYPE VARCHAR(255) USING visitor_id::text;
ALTER TABLE page_views ALTER COLUMN visitor_id TYPE VARCHAR(255) USING visitor_id::text;
ALTER TABLE visitors ALTER COLUMN visitor_id TYPE VARCHAR(255) USING visitor_id::text;
ALTER TABLE visitor_likes ADD CONSTRAINT visitor_likes_visitor_id_fkey
    FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE;
ALTER TABLE page_views ADD CONSTRAINT page_views_visitor_id_fkey
    FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS page_views_visitor_page_created_idx
    ON page_views (visitor_id, page, created_at DESC);

CREATE INDEX IF NOT EXISTS page_views_page_created_idx
    ON page_views (page, created_at DESC);

INSERT INTO site_stats (page) VALUES ('/') ON CONFLICT (page) DO NOTHING;
