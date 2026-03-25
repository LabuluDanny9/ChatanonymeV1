-- Paramètres plateforme (fonctionnalités activables par l'admin principal)
-- features : clés booléennes (forum, privateChat, broadcasts, registrations)

CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platform_settings (id, features)
VALUES ('global', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
