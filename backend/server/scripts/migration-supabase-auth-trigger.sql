-- =============================================================================
-- Migration: Sync Supabase Auth -> public.users ET public.admins
-- Quand un utilisateur s'inscrit via Supabase Auth (anon key), créer users ou admins
-- Exécuter dans Supabase SQL Editor
-- =============================================================================
-- PRÉREQUIS Supabase Dashboard:
-- 1. Authentication > Providers > Email > activer "Enable Email Signup"
-- 2. Authentication > Providers > Email > désactiver "Confirm email"
-- =============================================================================

-- Rendre password_hash nullable pour les users créés via Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Rendre password_hash nullable pour les admins créés via Supabase Auth
ALTER TABLE admins ALTER COLUMN password_hash DROP NOT NULL;

-- Fonction trigger: créer users OU admins depuis auth.users
-- Si raw_user_meta_data->>'is_admin' = 'true' → admins, sinon → users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pseudo TEXT;
  v_email TEXT;
  v_is_admin BOOLEAN;
  v_admin_count INT;
BEGIN
  v_is_admin := (NEW.raw_user_meta_data->>'is_admin')::text = 'true';

  IF v_is_admin THEN
    -- Vérifier la limite de 3 admins
    SELECT COUNT(*)::int INTO v_admin_count FROM public.admins;
    IF v_admin_count >= 3 THEN
      RAISE EXCEPTION 'Nombre maximum d''administrateurs (3) atteint.';
    END IF;
    -- Insérer dans admins (email réel depuis auth.users)
    INSERT INTO public.admins (id, email, password_hash, photo)
    VALUES (
      NEW.id,
      LOWER(NEW.email),
      'supabase_auth',
      COALESCE(NEW.raw_user_meta_data->>'photo', '')
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Insérer dans users (pseudo dans metadata)
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users (Supabase gère auth schema)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

COMMENT ON FUNCTION public.handle_new_auth_user IS 'Sync Supabase Auth signup -> public.users ou public.admins (is_admin dans raw_user_meta_data)';
