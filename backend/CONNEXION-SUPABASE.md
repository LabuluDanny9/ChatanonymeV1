# Connecter ChatAnonyme à Supabase

Guide pour connecter la plateforme à une base de données Supabase (PostgreSQL).

---

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Cliquez sur **New project**
3. Choisissez un nom, un **mot de passe** (à retenir) et une région
4. Attendez la fin de la création (1 à 2 minutes)

---

## 2. Récupérer l’URL de connexion

1. **Connect** (le plus simple) : en haut de la page de votre projet, cliquez sur **Connect** — une fenêtre s'ouvre avec l'URL (choisissez **Transaction**, port 6543)
2. **Project Settings** : icône engrenage en bas à gauche → cherchez **Database** ou **Infrastructure** → **Connection string**
3. Copiez l'URL
5. **Copiez l’URL exacte** affichée (elle contient la bonne région : `aws-0-eu-west-1`, `aws-0-us-east-1`, etc.)
4. Remplacez `[YOUR-PASSWORD]` par le mot de passe de votre base

Format attendu :
```
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

> ⚠️ **Important** : Ne modifiez pas la région manuellement. Copiez l’URL telle quelle depuis le dashboard Supabase.

> **Mot de passe avec caractères spéciaux** : encodez-les dans l’URL :
> - `@` → `%40`
> - `|` → `%7C`
> - `#` → `%23`
> - `]` → `%5D`

---

## 3. Configurer le backend

Éditez le fichier `backend/.env` :

```env
# Remplacez par l’URL copiée depuis Supabase (avec votre mot de passe)
DATABASE_URL=postgresql://postgres.VOTRE_PROJECT_REF:VOTRE_MOT_DE_PASSE@aws-0-VOTRE_REGION.pooler.supabase.com:6543/postgres
```

**Important** : utilisez le **connection pooler** (port 6543), pas la connexion directe (port 5432), pour éviter les erreurs « Connection terminated due to connection timeout ».

---

## 4. Créer les tables

### Option A : Via la ligne de commande (recommandé)

```powershell
cd c:\ChatAnonyme\backend
npm run init-db
```

Si la connexion réussit, vous verrez :
```
Connexion à PostgreSQL...
Connexion OK.
OK: CREATE EXTENSION IF NOT EXISTS "pgcrypto"
...
Base de données initialisée avec succès.
```

### Option B : Via le SQL Editor Supabase (si Option A échoue)

1. Supabase → **SQL Editor** → **New query**
2. Ouvrez le fichier `backend/server/scripts/init-db-complet.sql`
3. Copiez tout le contenu et collez-le dans l’éditeur
4. Cliquez sur **Run**

---

## 5. Créer l’admin initial

Le backend crée automatiquement un admin au premier démarrage si aucun n’existe. Vérifiez dans `backend/.env` :

```env
ADMIN_EMAIL=admin@silencehub.local
ADMIN_PASSWORD=ChangeMe123!
```

Ou exécutez manuellement :
```powershell
cd c:\ChatAnonyme\backend
npm run seed-admin
```

---

## 6. Démarrer le backend

```powershell
cd c:\ChatAnonyme\backend
npm run dev
```

Si tout est correct :
```
ChatAnonyme backend listening on port 5001
```

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `Connection terminated due to connection timeout` | Utilisez le **pooler** (port 6543), pas la connexion directe (port 5432) |
| `Tenant or user not found` | La région dans l’URL est incorrecte. **Copiez l’URL exacte** depuis Supabase > Project Settings > Database > Connection string (Transaction) |
| `password authentication failed` | Vérifiez le mot de passe et l’encodage des caractères spéciaux |
| `relation "users" does not exist` | Exécutez `npm run init-db` ou le script SQL dans le SQL Editor |
| Projet Supabase en pause | Allez dans le dashboard Supabase et cliquez sur **Restore project** |

---

## Vérifier la connexion

- **Mode Supabase** : `DATABASE_URL` commence par `postgresql://` et ne contient pas `json:`
- **Mode JSON local** : `DATABASE_URL=json:./data/silencehub.json` ou vide
