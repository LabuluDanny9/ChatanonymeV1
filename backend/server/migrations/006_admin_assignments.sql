-- Assignations par thématique pour les administrateurs

CREATE TABLE IF NOT EXISTS admin_assignments (
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  theme_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (admin_id, theme_key)
);

CREATE INDEX IF NOT EXISTS idx_admin_assignments_theme_key ON admin_assignments(theme_key);

