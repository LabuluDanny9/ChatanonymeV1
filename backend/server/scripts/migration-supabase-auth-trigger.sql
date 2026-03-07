-- =============================================================================
-- Migration: Sync Supabase Auth -> public.users
-- Quand un utilisateur s'inscrit via Supabase Auth (anon key), créer la ligne users
-- Exécuter dans Supabase SQL Editor
-- =============================================================================
-- PRÉREQUIS Supabase Dashboard:
-- 1. Authentication > Providers > Email > désactiver "Confirm email"
-- 2. Cela permet l'inscription immédiate sans vérification email
-- =============================================================================

-- Rendre password_hash nullable pour les users créés via Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Fonction trigger: créer users depuis auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pseudo TEXT;
  v_email TEXT;
BEGIN
  v_pseudo := COALESCE(NEW.raw_user_meta_data->>'pseudo', split_part(NEW.email, '@', 1), 'user_' || substr(NEW.id::text, 1, 8));
  v_email := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'email', '')), '');
  
  INSERT INTO public.users (id, pseudo, password_hash, phone, email, photo, status)
  VALUES (
    NEW.id,
    v_pseudo,
    'supabase_auth',
    NULL,
    v_email,
    COALESCE(NEW.raw_user_meta_data->>'photo', NULL),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (Supabase gère auth schema)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

COMMENT ON FUNCTION public.handle_new_auth_user IS 'Sync Supabase Auth signup -> public.users (pseudo dans raw_user_meta_data)';
