# Déploiement ChatAnonyme / SilenceHub

## Architecture

- **Frontend** (React) + **API** (Express serverless) → Vercel (tout-en-un)
- **Backend** (Node.js/Express) → Railway ou Render (optionnel, architecture séparée)
- **Base de données** → Supabase (PostgreSQL)

---

## Déploiement tout-en-un sur Vercel (recommandé)

### 1. Créer les tables dans Supabase (OBLIGATOIRE)

1. Va sur [supabase.com](https://supabase.com) → ton projet
2. **SQL Editor** → **New query**
3. Copie-colle le contenu de `backend/server/scripts/init-db-complet.sql`
4. Clique **Run** — les tables `users`, `admins`, `conversations`, etc. seront créées
5. (Optionnel) Exécuter `backend/server/scripts/seed-user-admin.sql` pour créer un utilisateur **demo** (mdp: Demo123!) et un admin **admin@laparte.app** (mdp: Admin123!)

### 2. Variables d'environnement sur Vercel

Dans **Vercel** → ton projet → **Settings** → **Environment Variables**, ajoute :

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `DATABASE_URL` | URL PostgreSQL Supabase (voir ci-dessous) | **Oui** |
| `JWT_SECRET` | Chaîne aléatoire sécurisée | **Oui** |
| `CORS_ORIGIN` | URL de ton frontend | Oui |
| `REACT_APP_SUPABASE_URL` | `https://xxx.supabase.co` (Supabase > Settings) | Pour inscription via anon |
| `REACT_APP_SUPABASE_ANON_KEY` | Clé anon (Supabase > Settings > API) | Pour inscription via anon |
| `SUPABASE_JWT_SECRET` | JWT Secret (Supabase > Settings > API) | Pour accepter tokens Supabase |

**Obtenir DATABASE_URL :** Supabase → **Settings** → **Database** → **Connection string** → **Transaction pooler** (port **6543**). Le suffixe `?workaround=supabase-pooler.vercel` est ajouté automatiquement par l'app.

### 3. Redéployer

Après avoir ajouté les variables, **Redeploy** le projet sur Vercel.

### Inscription via Supabase Auth (recommandé — évite les 500)

Pour contourner les erreurs 500 à l'inscription, utilise l'authentification Supabase (anon key) :

1. **Supabase** → **Authentication** → **Providers** → **Email** → activer **Enable Email Signup** (OBLIGATOIRE)
2. **Supabase** → **Authentication** → **Providers** → **Email** → désactiver **Confirm email**
3. **Supabase** → **SQL Editor** → exécuter `backend/server/scripts/migration-supabase-auth-trigger.sql`
4. **Vercel** → ajouter les variables :
   - `REACT_APP_SUPABASE_URL` = `https://xxx.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY` = clé anon (Settings > API)
   - `SUPABASE_JWT_SECRET` = JWT Secret (Settings > API)

L'inscription et la connexion passent alors directement par Supabase, sans appeler l'API.

**Limite Supabase :** Par défaut, Supabase limite à ~4 inscriptions/heure (SMTP intégré). En cas de « email rate limit exceeded » :
- **Solution 1** : Supabase → **Project Settings** → **Auth** → **SMTP** → configurer un SMTP personnalisé (Gmail, SendGrid, etc.)
- **Solution 2** : L'app tente automatiquement l'API en secours si Supabase échoue

### Erreur « Erreur serveur » à l'inscription (sans Supabase Auth) ?

1. **DATABASE_URL manquant** → Vérifie qu'elle est définie sur Vercel
2. **Tables absentes** → Exécute `init-db-complet.sql` dans Supabase SQL Editor
3. **Connexion refusée** → Utilise l'URL du **pooler** (port 6543) plutôt que 5432

---

## Ordre recommandé (architecture séparée)

1. **Supabase** : créer la base et exécuter `init-db-complet.sql`
2. **Backend** : déployer sur Railway ou Render
3. **Frontend** : déployer sur Vercel avec l’URL du backend

---

## 1. Déployer le frontend sur Vercel

### Via l’interface Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte-toi avec GitHub
2. **Add New** → **Project**
3. Importe le dépôt `LabuluDanny9/ChatanonymeV1`
4. **Root Directory** : laisse vide (le projet est à la racine)
5. **Build Command** : `cd frontend && npm ci && npm run build`
6. **Output Directory** : `frontend/build`
7. **Environment Variables** (obligatoire) :
   - `REACT_APP_API_URL` = URL de ton backend (ex. `https://ton-backend.railway.app`)
   - `REACT_APP_WS_PATH` = `/ws` (par défaut)
8. Clique sur **Deploy**

### Via Vercel CLI

```bash
npm i -g vercel
cd c:\ChatAnonyme
vercel
```

Puis ajoute les variables d’environnement dans le dashboard Vercel.

---

## 2. Déployer le backend (Railway ou Render)

### Option A : Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi avec GitHub
2. **New Project** → **Deploy from GitHub repo** → sélectionne `ChatanonymeV1`
3. **Root Directory** : `backend`
4. **Start Command** : `npm start`
5. **Variables d’environnement** :
   - `NODE_ENV` = production
   - `PORT` = 5001 (Railway fournit `PORT` automatiquement)
   - `DATABASE_URL` = URL Supabase ou `json:./data/silencehub.json`
   - `JWT_SECRET` = une chaîne aléatoire sécurisée
   - `CORS_ORIGIN` = URL de ton frontend Vercel (ex. `https://chatanonyme.vercel.app`)
6. Génère un domaine public (Settings → Generate Domain)

### Option B : Render

1. Va sur [render.com](https://render.com) et connecte-toi avec GitHub
2. **New** → **Web Service**
3. Connecte le repo `ChatanonymeV1`
4. **Root Directory** : `backend`
5. **Build Command** : `npm install`
6. **Start Command** : `npm start`
7. **Variables d’environnement** : mêmes que Railway
8. Crée le service et récupère l’URL

---

## 3. Base de données en production

Utilise **Supabase** (PostgreSQL) :

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Récupère l’URL de connexion (Settings → Database)
3. Exécute `backend/server/scripts/init-db-complet.sql` dans le SQL Editor
4. Définis `DATABASE_URL` dans Railway/Render

---

## 4. Ordre de déploiement

1. **Backend** (Railway/Render) → récupère l’URL
2. **Frontend** (Vercel) → configure `REACT_APP_API_URL` avec l’URL du backend
3. **CORS** → dans le backend, `CORS_ORIGIN` doit être l’URL du frontend Vercel

---

## 5. Vérification

- Frontend : `https://ton-projet.vercel.app`
- Backend : `https://ton-backend.railway.app/health` → doit retourner `{"status":"ok"}`
