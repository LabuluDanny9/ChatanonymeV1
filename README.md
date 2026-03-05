# SILENCEHUB

Plateforme web d’échange **totalement anonyme** avec un administrateur unique. Les utilisateurs ne se voient pas, n’ont pas d’email obligatoire et communiquent uniquement en privé avec l’admin.

---

## Fonctionnalités

### Utilisateurs (anonymes)
- **Aucune donnée personnelle** : pas de nom, pas d’email obligatoire
- **ID unique** généré automatiquement (stocké côté client pour persistance de session)
- **Chat privé 1-to-admin** : envoi et réception de messages avec l’équipe
- **Sujets publics** : consultation des publications globales de l’admin
- **Isolation totale** : aucun utilisateur ne voit les autres

### Administrateur (unique)
- Connexion **email + mot de passe** (hash bcrypt)
- **Dashboard** : statistiques (utilisateurs, conversations, sujets)
- **Utilisateurs** : liste, bannir, supprimer (soft)
- **Conversations** : voir toutes, répondre, fermer, supprimer des messages
- **Sujets** : créer, modifier, supprimer les sujets globaux
- **Logs d’audit** : enregistrement des actions sensibles

### Sécurité & confidentialité
- **JWT** : authentification anonyme (longue durée) et admin (session)
- **Rate limiting** : protection contre les abus
- **Helmet** : en-têtes HTTP sécurisés
- **Sanitization** : réduction des risques XSS sur les champs texte
- **CORS** : origine frontend configurable

---

## Architecture

```
ROGEGER/
├── backend/                 # Node.js + Express
│   ├── server/
│   │   ├── config/           # DB, env, config centralisée
│   │   ├── controllers/     # auth, user, message, topic, admin
│   │   ├── middleware/      # authAnonymous, authAdmin, rateLimit, errorHandler, sanitize
│   │   ├── models/          # User, Admin, Conversation, Message, Topic, AuditLog
│   │   ├── routes/          # API REST
│   │   ├── services/        # anonymousAuthService
│   │   ├── scripts/         # init-db.sql, seedAdmin.js
│   │   ├── app.js           # Application Express
│   │   ├── index.js         # Démarrage HTTP + WebSocket
│   │   └── websocket.js     # Socket.IO (temps réel)
│   ├── package.json
│   └── .env.example
├── frontend/                 # React
│   ├── src/
│   │   ├── components/      # Layout, AdminLayout
│   │   ├── context/         # AuthContext (anon + admin)
│   │   ├── lib/              # api (axios)
│   │   ├── pages/            # Welcome, Chat, Topics, TopicView
│   │   └── pages/admin/      # AdminLogin, Dashboard, Users, Conversations, Topics
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

- **Backend** : API REST + WebSocket (Socket.IO) sur `/ws`
- **Frontend** : React Router, Axios, Tailwind, Context API, socket.io-client
- **Base de données** : Supabase (PostgreSQL) — users, admins, conversations, messages, broadcasts, topics, audit_logs

---

## Prérequis

- **Node.js** 18+
- **Compte Supabase** (gratuit)
- **npm** ou **yarn**

---

## Installation

### 1. Base de données Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécuter le contenu de `backend/server/scripts/init-db.sql`
3. Copier l’URL de connexion : **Project Settings > Database > Connection string (URI)** (mode Session ou Transaction)

### 2. Backend

```bash
cd backend
cp .env.example .env
# Éditer .env : DATABASE_URL (URL Supabase), JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGIN
npm install
npm start
```

- Le serveur écoute sur le port **5000** (ou `PORT` dans `.env`).
- Au premier démarrage, un admin est créé si la table `admins` est vide (valeurs de `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Optionnel : REACT_APP_API_URL=http://localhost:5000, REACT_APP_WS_PATH=/ws
npm install
npm start
```

- L’app React est servie sur **http://localhost:3000** (proxy vers le backend si besoin).

---

## Variables d’environnement

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Port du serveur (défaut 5000) |
| `DATABASE_URL` | URL PostgreSQL (`postgresql://user:pass@host:5432/silencehub`) |
| `JWT_SECRET` | Secret pour signer les JWT (à générer en production) |
| `JWT_EXPIRES_IN` | Expiration JWT admin (ex. `7d`) |
| `JWT_ANONYMOUS_EXPIRES_IN` | Expiration JWT anonyme (ex. `365d`) |
| `ADMIN_EMAIL` | Email de l’admin initial (créé au premier run) |
| `ADMIN_PASSWORD` | Mot de passe admin initial |
| `CORS_ORIGIN` | Origine autorisée (ex. `http://localhost:3000`) |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | URL de l’API (ex. `http://localhost:5000`) |
| `REACT_APP_WS_PATH` | Chemin WebSocket (défaut `/ws`) |

---

## API (résumé)

- `POST /api/auth/anonymous` — Connexion anonyme (body optionnel : `anonymous_id`)
- `POST /api/auth/admin/login` — Connexion admin (email, password)
- `GET /api/users/me/conversation` — Ma conversation (auth anonyme)
- `GET /api/messages` — Mes messages (auth anonyme)
- `POST /api/messages` — Envoyer un message (auth anonyme)
- `GET /api/topics` — Liste des sujets publics
- `GET /api/topics/:id` — Détail d’un sujet
- `GET /api/admin/stats` — Statistiques dashboard (auth admin)
- `GET/DELETE/POST /api/admin/users/*` — Gestion utilisateurs
- `GET/GET/POST/PATCH /api/admin/conversations/*` — Conversations, réponses, fermeture
- `DELETE /api/admin/messages/:id` — Suppression message (admin)
- `GET/POST/PUT/DELETE /api/admin/topics/*` — CRUD sujets (admin)

WebSocket (Socket.IO) : path `/ws`, auth via `auth.token` (JWT). Événements : `message:new` (côté user et admin).

---

## Déploiement

- **Frontend** : Vercel — `vercel.json` configuré
- **Backend** : Railway ou Render — `railway.json` / `render.yaml` inclus
- **Guide complet** : voir [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Licence

Projet à usage interne / démo. Adapter selon vos besoins.
