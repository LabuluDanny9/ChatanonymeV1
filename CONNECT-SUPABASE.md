# Connecter L'Aparté à Supabase (PostgreSQL)

## Projet Supabase

- **URL** : https://begavtmnxocgynudzoxe.supabase.co
- **Connexion directe** : `db.begavtmnxocgynudzoxe.supabase.co:5432`

## Étape 1 : Récupérer l'URL de connexion Supabase

1. Allez sur **[supabase.com](https://supabase.com)** et connectez-vous
2. Ouvrez votre projet (ID : `begavtmnxocgynudzoxe`)
3. **Project Settings** (icône engrenage) → **Database**
4. Section **Connection string** → onglet **URI**
5. Sélectionnez **Direct connection** (port 5432) ou **Transaction** (pooler, port 6543)
6. Cliquez sur **Copy** pour copier l'URL
7. Remplacez `[YOUR-PASSWORD]` par le mot de passe de votre base de données

> **Caractères spéciaux dans le mot de passe** : encodez-les en URL
> - `@` → `%40`
> - `|` → `%7C`
> - `]` → `%5D`
> - `#` → `%23`

## Étape 2 : Configurer le backend

Ouvrez `backend/.env` et **remplacez** la ligne `DATABASE_URL` par l'URL copiée depuis Supabase (avec le mot de passe encodé si nécessaire).

**Exemple** (mot de passe `L@bu24||Danny]` encodé) :
```env
DATABASE_URL=postgresql://postgres:L%40bu24%7C%7CDanny%5D@db.begavtmnxocgynudzoxe.supabase.co:5432/postgres
```

> Si vous voyez « password authentication failed », vérifiez le mot de passe dans **Project Settings > Database > Reset database password**.

## Étape 3 : Créer les tables dans Supabase

1. Dans Supabase : **SQL Editor** → **New query**
2. Ouvrez le fichier `backend/server/scripts/init-db-complet.sql`
3. Copiez **tout le contenu** et collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (ou Ctrl+Enter)

Les tables `users`, `admins`, `conversations`, `messages`, `topics`, `broadcasts`, `audit_logs` seront créées.

## Étape 4 : Créer le premier administrateur

Après avoir créé les tables, créez un admin via l'interface :

1. Démarrez la plateforme : `npm start` (backend) et `npm start` (frontend)
2. Allez sur **http://localhost:3000/admin**
3. Onglet **Créer un compte**
4. Entrez votre email et mot de passe

## Étape 5 : Vérifier la connexion

Démarrez le backend :

```powershell
cd c:\ChatAnonyme\backend
npm start
```

Si la connexion fonctionne, vous verrez : `ChatAnonyme backend listening on port 5001`  
Sans erreur "Tenant or user not found" ou "ETIMEDOUT".

## Dépannage

| Erreur | Solution |
|--------|----------|
| `Tenant or user not found` | L'URL ou la région est incorrecte. Copiez l'URL exacte depuis Supabase. |
| `ETIMEDOUT` | Problème réseau ou pare-feu. Essayez la connexion directe (port 5432) au lieu du pooler. |
| `password authentication failed` | Vérifiez le mot de passe. Réinitialisez-le dans Project Settings > Database. |
| `relation "users" does not exist` | Exécutez `init-db-complet.sql` dans le SQL Editor Supabase. |
