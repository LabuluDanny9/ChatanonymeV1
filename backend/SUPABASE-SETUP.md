# Connecter Supabase au backend SILENCEHUB

Le backend supporte déjà PostgreSQL/Supabase. Il suffit de configurer l’URL de connexion et d’initialiser le schéma.

---

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous.
2. Créez un nouveau projet : **New project**.
3. Choisissez un nom, un mot de passe pour la base, et une région.
4. Attendez la fin de la création du projet.

---

## 2. Récupérer l’URL de connexion

1. Dans le projet Supabase : **Project Settings** (icône engrenage).
2. Menu **Database** dans la sidebar.
3. Section **Connection string**.
4. Onglet **URI**.
5. Choisissez **Transaction** (recommandé pour Node.js).
6. Copiez l’URL, par exemple :
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
7. Remplacez `[YOUR-PASSWORD]` par le mot de passe du projet.

---

## 3. Configurer le backend

Créez ou modifiez le fichier `.env` à la racine du dossier `backend` :

```env
# Base de données Supabase
DATABASE_URL=postgresql://postgres.xxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# Autres variables (déjà présentes)
JWT_SECRET=votre-secret-jwt-securise
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

> Si la connexion échoue, ajoutez `?sslmode=require` à la fin de l’URL :
> `...postgres?sslmode=require`

---

## 4. Créer les tables dans Supabase

1. Dans Supabase : **SQL Editor**.
2. Ouvrez le fichier `backend/server/scripts/init-db.sql`.
3. Copiez tout le contenu et collez-le dans l’éditeur SQL.
4. Cliquez sur **Run** pour exécuter le script.

---

## 5. Créer un admin initial (optionnel)

Le backend peut créer un admin au premier démarrage si aucun n’existe. Configurez dans `.env` :

```env
ADMIN_EMAIL=admin@silencehub.local
ADMIN_PASSWORD=ChangeMe123!
```

Ou créez-en un manuellement via SQL :

```sql
-- Remplacez le hash par le résultat de bcrypt pour votre mot de passe
INSERT INTO admins (email, password_hash, photo) 
VALUES ('admin@example.com', '$2b$10$...', '');
```

---

## 6. Démarrer le backend

```bash
cd backend
npm install
npm run dev
```

Pour vérifier que Supabase est bien utilisé :

- Si `DATABASE_URL` est défini et ne commence pas par `json:` → PostgreSQL/Supabase.
- Si `DATABASE_URL` est vide ou commence par `json:` → stockage JSON local.

---

## Résumé du flux d’authentification

| Action          | Endpoint             | Base de données |
|-----------------|----------------------|-----------------|
| Inscription utilisateur | `POST /api/auth/register` | Table `users`  |
| Connexion utilisateur   | `POST /api/auth/login`    | Table `users`  |
| Connexion admin         | `POST /api/admin/login`   | Table `admins` |
| JWT                     | Backend Node + JWT_SECRET | Vérification   |

L’authentification est gérée par votre backend (JWT). Supabase sert uniquement de base PostgreSQL pour les données.

---

## Dépannage

| Problème | Cause possible | Solution |
|----------|----------------|----------|
| `connect ECONNREFUSED` | Mauvais host/port | Vérifier l’URL, utiliser le port **6543** (pooler) |
| `password authentication failed` | Mauvais mot de passe | Réinitialiser le mot de passe DB dans Project Settings > Database |
| `SSL required` | Connexion non sécurisée | Ajouter `?sslmode=require` à l’URL |
| `relation "users" does not exist` | Tables non créées | Exécuter `init-db.sql` dans le SQL Editor |
