-- Conversations privées entre deux utilisateurs (style messagerie directe)
-- Distinct du chat utilisateur ↔ équipe (table conversations / messages existantes)

CREATE TABLE IF NOT EXISTS peer_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE INDEX IF NOT EXISTS idx_peer_conversations_user_a ON peer_conversations(user_a);
CREATE INDEX IF NOT EXISTS idx_peer_conversations_user_b ON peer_conversations(user_b);
CREATE INDEX IF NOT EXISTS idx_peer_conversations_updated ON peer_conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS peer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES peer_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  message_type VARCHAR(20) DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peer_messages_conversation_created ON peer_messages(conversation_id, created_at);
