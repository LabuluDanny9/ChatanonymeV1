-- Migration 003 - Commentaires forum (sujets)
-- Permet aux utilisateurs de commenter et répondre aux sujets

CREATE TABLE IF NOT EXISTS topic_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_type VARCHAR(10) NOT NULL CHECK (author_type IN ('user', 'admin')),
  author_name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES topic_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_comments_topic_id ON topic_comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_comments_parent_id ON topic_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_topic_comments_created_at ON topic_comments(created_at ASC);
