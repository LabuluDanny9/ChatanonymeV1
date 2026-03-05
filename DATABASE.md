# Base de données ChatAnonyme / SilenceHub

Ce projet supporte **deux modes** de stockage :

## 1. Mode JSON (par défaut)

Pour le développement sans PostgreSQL :

```env
DATABASE_URL=json:./data/silencehub.json
```

- Données stockées dans `backend/data/silencehub.json`
- Aucune installation requise
- Idéal pour tests et développement local

---

## 2. Mode PostgreSQL

Pour la production ou un environnement plus proche de la prod.

### Option A : PostgreSQL local avec Docker

```bash
# Démarrer la base
docker compose up -d

# Initialiser le schéma
cd backend && npm run init-db

# Créer l'admin initial
npm run seed-admin
```

Puis dans `backend/.env` :

```env
DATABASE_URL=postgresql://silencehub:silencehub_dev@localhost:5432/silencehub
```

### Option B : Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer l’URL de connexion (Settings → Database)
3. Exécuter `backend/server/scripts/init-db.sql` dans le SQL Editor Supabase
4. Configurer `.env` :

```env
DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@db.xxx.supabase.co:5432/postgres
```

5. Lancer `npm run seed-admin` pour créer l’admin

---

## Schéma des tables

| Table          | Description                          |
|----------------|--------------------------------------|
| `users`        | Utilisateurs (pseudo, email, photo)  |
| `admins`       | Administrateurs                       |
| `conversations`| Conversations 1-to-admin              |
| `messages`     | Messages (texte, vocal, image, etc.) |
| `topics`       | Sujets publiés                        |
| `broadcasts`   | Messages collectifs                  |
| `audit_logs`   | Logs d’audit                         |

---

## Commandes utiles

```bash
# Initialiser le schéma PostgreSQL
npm run init-db

# Créer l’admin (email/mot de passe depuis .env)
npm run seed-admin

# Créer un admin interactif
npm run create-admin
```
