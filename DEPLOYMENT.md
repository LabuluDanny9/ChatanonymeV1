# Déploiement ChatAnonyme / SilenceHub

## Architecture

- **Frontend** (React) → Vercel
- **Backend** (Node.js/Express) → Railway ou Render
- **Base de données** → Supabase (PostgreSQL) ou JSON local

---

## Ordre recommandé

1. **Supabase** : créer la base et exécuter `init-db.sql`
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
3. Exécute `backend/server/scripts/init-db.sql` dans le SQL Editor
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
