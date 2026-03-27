-- =============================================================================
-- L'Aparté / ChatAnonyme - Schéma complet PostgreSQL / Supabase
-- Exécuter dans Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =============================================================================
--
-- Tables du projet (ordre de création, respect des FK) :
--   1. users         - Utilisateurs (messagerie anonyme)
--   2. admins        - Administrateurs (forum, chat, broadcasts)
--   3. conversations - Conversations 1-to-1 user ↔ admin
--   4. topics        - Sujets forum (avant messages, FK topic_id)
--   5. messages      - Messages du chat (texte, vocal, image, etc.)
--   6. topic_comments - Commentaires forum (réponses aux topics)
--   7. broadcasts    - Messages collectifs admin → tous les users
--   8. audit_logs    - Logs d'audit (actions admin)
--
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. USERS - Utilisateurs de la plateforme (messagerie anonyme)
-- Pseudo unique, mot de passe, infos optionnelles (phone, email, photo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudo VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  photo TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_pseudo ON users(LOWER(pseudo));
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

COMMENT ON TABLE users IS 'Utilisateurs de la messagerie anonyme - pseudo, mot de passe, statut';

-- -----------------------------------------------------------------------------
-- 2. ADMINS - Administrateurs (forum, chat, broadcasts)
-- Email unique, mot de passe, photo optionnelle
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  photo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email ON admins(LOWER(email));

COMMENT ON TABLE admins IS 'Administrateurs - créent les topics forum, répondent au chat, envoient des broadcasts';

-- -----------------------------------------------------------------------------
-- 3. CONVERSATIONS - Discussions 1-to-1 (un user = une conversation)
-- Chaque utilisateur a une conversation unique avec l'équipe admin
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

COMMENT ON TABLE conversations IS 'Conversations privées user ↔ admin (messagerie anonyme)';

-- -----------------------------------------------------------------------------
-- 4. TOPICS - Sujets forum publiés par l'administrateur
-- (Créé avant messages pour la FK topic_id)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_published_at ON topics(published_at DESC);

COMMENT ON TABLE topics IS 'Sujets forum - créés par l''admin, visibles par tous';

-- -----------------------------------------------------------------------------
-- 5. MESSAGES - Contenu du chat (texte, vocal, image, vidéo, fichier)
-- Liés aux conversations, optionnellement à un topic (contexte)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID NOT NULL,
  content TEXT DEFAULT '',
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'video', 'file')),
  metadata JSONB DEFAULT '{}',
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_topic_id ON messages(topic_id);

-- Colonnes additionnelles (migration douce si table existante)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;

COMMENT ON TABLE messages IS 'Messages du chat - texte, vocal, image, vidéo, fichier';

-- -----------------------------------------------------------------------------
-- 6. TOPIC_COMMENTS - Commentaires forum (réponses aux topics)
-- Permet aux users de commenter et répondre en fil
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topic_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_type VARCHAR(10) NOT NULL CHECK (author_type IN ('user', 'admin')),
  author_name VARCHAR(100) NOT NULL,
  author_photo TEXT,
  parent_id UUID REFERENCES topic_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_comments_topic_id ON topic_comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_comments_parent_id ON topic_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_topic_comments_created_at ON topic_comments(created_at ASC);

COMMENT ON TABLE topic_comments IS 'Commentaires forum - réponses imbriquées aux topics';

-- Migration : ajout author_photo si table existante
ALTER TABLE topic_comments ADD COLUMN IF NOT EXISTS author_photo TEXT;

-- -----------------------------------------------------------------------------
-- 7. BROADCASTS - Messages collectifs admin → tous les utilisateurs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON broadcasts(created_at DESC);

COMMENT ON TABLE broadcasts IS 'Messages de diffusion admin → tous les users';

-- -----------------------------------------------------------------------------
-- 8. AUDIT_LOGS - Logs d'audit (actions admin, sécurité)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMENT ON TABLE audit_logs IS 'Logs d''audit - actions admin, sécurité, débogage';

-- -----------------------------------------------------------------------------
-- 9. PEER (optionnel) - Messagerie directe entre deux utilisateurs (admin: userToUserChat)
-- -----------------------------------------------------------------------------
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

-- =============================================================================
-- Fin du schéma
-- =============================================================================
