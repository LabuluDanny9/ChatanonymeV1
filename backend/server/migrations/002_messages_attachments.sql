-- Migration 002 - Pièces jointes et contexte sujet
-- Pour bases existantes sans message_type, metadata, topic_id

ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_topic_id ON messages(topic_id);

ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
