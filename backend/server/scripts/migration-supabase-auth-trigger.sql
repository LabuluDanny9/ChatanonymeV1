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
  v_pseudo_base TEXT;
  v_email TEXT;
  v_is_admin BOOLEAN;
  v_admin_count INT;
BEGIN
  v_is_admin := (NEW.raw_user_meta_data->>'is_admin')::text = 'true';

  IF v_is_admin THEN
    -- Vérifier si l'email existe déjà (seed ou API)
    IF EXISTS (SELECT 1 FROM public.admins WHERE LOWER(email) = LOWER(NEW.email)) THEN
      RAISE EXCEPTION 'Cet email est déjà utilisé par un administrateur.';
    END IF;
    -- Vérifier la limite de 3 admins
    SELECT COUNT(*)::int INTO v_admin_count FROM public.admins;
    IF v_admin_count >= 3 THEN
      RAISE EXCEPTION 'Nombre maximum d''administrateurs (3) atteint.';
    END IF;
    -- Insérer dans admins (toutes les colonnes explicites pour éviter erreurs)
    INSERT INTO public.admins (id, email, password_hash, photo, created_at, updated_at)
    VALUES (
      NEW.id,
      LOWER(NEW.email),
      'supabase_auth',
      COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'photo'), ''), ''),
      NOW(),
      NOW()
    );
  ELSE
    -- Insérer dans users (pseudo dans metadata, unique)
    v_pseudo_base := COALESCE(NEW.raw_user_meta_data->>'pseudo', split_part(NEW.email, '@', 1), 'user');
    v_pseudo_base := regexp_replace(trim(v_pseudo_base), '[^a-zA-Z0-9_-]', '_', 'g');
    v_pseudo_base := NULLIF(regexp_replace(v_pseudo_base, '_+', '_', 'g'), '');
    v_pseudo_base := COALESCE(v_pseudo_base, 'user');
    -- Garantir unicité du pseudo (éviter conflit avec users créés via API)
    v_pseudo := v_pseudo_base;
    IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(pseudo) = LOWER(v_pseudo_base)) THEN
      v_pseudo := v_pseudo_base || '_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
    END IF;
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
