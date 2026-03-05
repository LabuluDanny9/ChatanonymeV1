# Déployer maintenant — Guide rapide

## Tout sur Vercel (Frontend + API)

### 1. Supabase — Créer la base

1. Va sur [supabase.com](https://supabase.com) → ton projet `drnfinkocgtfjfzcrnus`
2. **SQL Editor** → Colle le contenu de `backend/server/scripts/init-db.sql` → **Run**
3. **Settings** → **Database** → **Connection string** (URI) → copie l’URL complète

### 2. Vercel — Variables d’environnement

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → Importe `ChatanonymeV1`
2. **Settings** → **Environment Variables** → ajoute :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | URL PostgreSQL Supabase (étape 1) |
| `JWT_SECRET` | Chaîne aléatoire (ex. `openssl rand -hex 32`) |
| `CORS_ORIGIN` | `https://ton-projet.vercel.app` (à mettre après le 1er déploiement) |
| `ADMIN_EMAIL` | Ton email admin |
| `ADMIN_PASSWORD` | Ton mot de passe admin |

3. **Deploy**

### 3. Après le déploiement

- Récupère l’URL (ex. `https://chatanonyme-v1.vercel.app`)
- Mets à jour `CORS_ORIGIN` dans Vercel avec cette URL
- Redéploie si besoin

**Note :** Les WebSockets (notifications temps réel) ne fonctionnent pas en mode serverless. Le chat reste utilisable via l’API REST.

---

## Alternative : Backend sur Railway

1. Va sur **[railway.app](https://railway.app)** → Login avec GitHub
2. **New Project** → **Deploy from GitHub repo** → `ChatanonymeV1`
3. Clique sur le service → **Settings** :
   - **Root Directory** : `backend`
   - **Start Command** : `npm start`
4. **Variables** → Add variables :
   - `NODE_ENV` = production
   - `DATABASE_URL` = ton URL Supabase (ou `json:./data/silencehub.json` pour test)
   - `JWT_SECRET` = génère une chaîne aléatoire (ex. `openssl rand -hex 32`)
   - `CORS_ORIGIN` = `https://ton-projet.vercel.app` (à mettre après le déploiement frontend)
   - `ADMIN_EMAIL` = ton email admin
   - `ADMIN_PASSWORD` = ton mot de passe admin
5. **Settings** → **Networking** → **Generate Domain**
6. **Copie l’URL** (ex. `https://chatanonyme-backend-production.up.railway.app`)

---

## Étape 3 : Frontend (Vercel)

### Option A : Via le site

1. Va sur **[vercel.com](https://vercel.com)** → Login avec GitHub
2. **Add New** → **Project** → Importe `ChatanonymeV1`
3. **Environment Variables** :
   - `REACT_APP_API_URL` = URL du backend Railway (étape 2)
   - `REACT_APP_WS_PATH` = `/ws`
4. **Deploy**

### Option B : Via CLI

```bash
cd c:\ChatAnonyme
npx vercel login
npx vercel --prod
```

Quand demandé, ajoute les variables :
- `REACT_APP_API_URL` = URL du backend
- `REACT_APP_WS_PATH` = /ws

---

## Étape 4 : Mettre à jour CORS

Retourne sur Railway → Variables → Modifie `CORS_ORIGIN` avec l’URL Vercel de ton frontend (ex. `https://chatanonyme-v1.vercel.app`).

---

## Base de données Supabase (recommandé en prod)

1. [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → Colle le contenu de `backend/server/scripts/init-db.sql` → Run
3. **Settings** → **Database** → Connection string (URI)
4. Utilise cette URL pour `DATABASE_URL` dans Railway
