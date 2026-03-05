-- Migration: Messages avec pièces jointes et contexte
-- Exécuter dans Supabase SQL Editor

-- Colonnes pour type de message et métadonnées
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'video', 'file'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Contexte sujet (quand l'utilisateur écrit à propos d'un sujet)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;

-- Index pour requêtes par sujet
CREATE INDEX IF NOT EXISTS idx_messages_topic_id ON messages(topic_id);

-- Rendre content nullable pour les messages sans texte (ex: image seule)
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
