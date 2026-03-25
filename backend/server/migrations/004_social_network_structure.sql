-- Migration 004 - Structure "reseau social" pour Supabase/PostgreSQL
-- Objectif: enrichir la plateforme (forum, interactions, suivi admin) tout en gardant
-- la logique de conversation unidirectionnelle user -> admin.

-- =========================
-- TOPICS: thematiques riches
-- =========================
ALTER TABLE topics ADD COLUMN IF NOT EXISTS theme_category VARCHAR(100) DEFAULT 'DIVERS';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS theme_subcategory VARCHAR(120);
ALTER TABLE topics ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'followers', 'private'));
ALTER TABLE topics ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_topics_theme_category ON topics(theme_category);
CREATE INDEX IF NOT EXISTS idx_topics_theme_subcategory ON topics(theme_subcategory);
CREATE INDEX IF NOT EXISTS idx_topics_visibility ON topics(visibility);

-- =========================
-- PROFIL social utilisateur
-- =========================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(120),
  bio TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  profile_visibility VARCHAR(20) NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- FOLLOW entre utilisateurs
-- =========================
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at DESC);

-- =========================
-- Reactions forum (likes)
-- =========================
CREATE TABLE IF NOT EXISTS topic_reactions (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'like'
    CHECK (reaction_type IN ('like', 'love', 'insightful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (topic_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_reactions_user_id ON topic_reactions(user_id);

CREATE TABLE IF NOT EXISTS topic_comment_reactions (
  comment_id UUID NOT NULL REFERENCES topic_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'like'
    CHECK (reaction_type IN ('like', 'love', 'insightful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_comment_reactions_user_id ON topic_comment_reactions(user_id);

-- =========================
-- Suivi des topics (abonnement)
-- =========================
CREATE TABLE IF NOT EXISTS topic_subscriptions (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (topic_id, user_id)
);

-- =========================
-- Logs d'activite utilisateur
-- =========================
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(60) NOT NULL,
  entity_type VARCHAR(40),
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- =========================
-- Vue admin: historique global des messages
-- =========================
CREATE OR REPLACE VIEW v_admin_message_history AS
SELECT
  m.id,
  m.conversation_id,
  c.user_id,
  u.pseudo,
  u.status AS user_status,
  m.sender_type,
  m.sender_id,
  m.content,
  m.message_type,
  m.metadata,
  m.topic_id,
  m.is_read,
  m.deleted_at,
  m.edited_at,
  m.created_at
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
JOIN users u ON u.id = c.user_id
ORDER BY m.created_at DESC;

