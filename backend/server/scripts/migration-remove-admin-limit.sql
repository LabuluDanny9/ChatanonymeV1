-- =============================================================================
-- Migration: Supprimer la limite de 3 administrateurs du trigger Supabase
-- Exécuter dans Supabase SQL Editor après migration-supabase-auth-trigger.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pseudo TEXT;
  v_pseudo_base TEXT;
  v_email TEXT;
  v_is_admin BOOLEAN;
BEGIN
  v_is_admin := COALESCE(NEW.raw_user_meta_data->>'is_admin', '') = 'true';

  IF v_is_admin THEN
    -- Vérifier si l'email existe déjà (seed ou API)
    IF EXISTS (SELECT 1 FROM public.admins WHERE LOWER(email) = LOWER(COALESCE(NEW.email, ''))) THEN
      RAISE EXCEPTION 'Cet email est déjà utilisé par un administrateur.';
    END IF;
    -- Plus de limite sur le nombre d'admins
    INSERT INTO public.admins (id, email, password_hash, photo, created_at, updated_at)
    VALUES (
      NEW.id,
      LOWER(COALESCE(NEW.email, '')),
      NULL,
      COALESCE(NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'photo', '')), ''), ''),
      COALESCE(NOW(), CURRENT_TIMESTAMP),
      COALESCE(NOW(), CURRENT_TIMESTAMP)
    );
  ELSE
    -- Insérer dans users (pseudo dans metadata, unique)
    v_pseudo_base := COALESCE(NEW.raw_user_meta_data->>'pseudo', split_part(NEW.email, '@', 1), 'user');
    v_pseudo_base := regexp_replace(trim(v_pseudo_base), '[^a-zA-Z0-9_-]', '_', 'g');
    v_pseudo_base := NULLIF(regexp_replace(v_pseudo_base, '_+', '_', 'g'), '');
    v_pseudo_base := COALESCE(v_pseudo_base, 'user');
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'handle_new_auth_user: %', SQLERRM;
END;
$$;
