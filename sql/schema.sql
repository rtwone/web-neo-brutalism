CREATE TABLE IF NOT EXISTS site_stats (
    page VARCHAR(255) PRIMARY KEY,
    likes BIGINT NOT NULL DEFAULT 0 CHECK (likes >= 0),
    views BIGINT NOT NULL DEFAULT 0 CHECK (views >= 0),
    is_away BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
    visitor_id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitor_likes (
    id BIGSERIAL PRIMARY KEY,
    visitor_id UUID NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    page VARCHAR(255) NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (visitor_id, page)
);

ALTER TABLE visitor_likes ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS visitor_likes_ip_page_unique
    ON visitor_likes (ip_hash, page);

CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    visitor_id UUID NOT NULL REFERENCES visitors(visitor_id) ON DELETE CASCADE,
    page VARCHAR(255) NOT NULL,
    ip_hash VARCHAR(64),
    user_agent_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_visitor_page_created_idx
    ON page_views (visitor_id, page, created_at DESC);

CREATE INDEX IF NOT EXISTS page_views_page_created_idx
    ON page_views (page, created_at DESC);

INSERT INTO site_stats (page) VALUES ('/') ON CONFLICT (page) DO NOTHING;
