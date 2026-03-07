-- =============================================================================
-- Seed : 1 utilisateur + 1 admin (pour tests / dépannage)
-- Exécuter dans Supabase SQL Editor après init-db-complet.sql
-- =============================================================================
-- Utilisateur : pseudo "demo" / mot de passe "Demo123!"
-- Admin       : email "admin@laparte.app" / mot de passe "Admin123!"
-- =============================================================================

-- Utilisateur démo (pseudo: demo, mdp: Demo123!)
INSERT INTO users (id, pseudo, password_hash, phone, email, photo, status)
SELECT gen_random_uuid(), 'demo', crypt('Demo123!', gen_salt('bf', 12)), NULL, 'demo@laparte.app', NULL, 'active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(pseudo) = 'demo');

-- Admin (email: admin@laparte.app, mdp: Admin123!)
INSERT INTO admins (id, email, password_hash, photo)
SELECT gen_random_uuid(), 'admin@laparte.app', crypt('Admin123!', gen_salt('bf', 12)), ''
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE LOWER(email) = 'admin@laparte.app');

-- Vérification
SELECT 'Utilisateur' AS type, pseudo AS identifiant, 'Demo123!' AS mot_de_passe FROM users WHERE pseudo = 'demo'
UNION ALL
SELECT 'Admin', email, 'Admin123!' FROM admins WHERE email = 'admin@laparte.app';
