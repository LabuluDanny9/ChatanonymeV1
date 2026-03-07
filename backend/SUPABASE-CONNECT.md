# Connecter Supabase (projet drnfinkocgtfjfzcrnus)

## 1. Récupérer l’URL de connexion

1. Allez sur [supabase.com](https://supabase.com) → votre projet
2. **Project Settings** (icône engrenage) → **Database**
3. Section **Connection string** → onglet **URI**
4. Choisissez **Transaction** (pooler, port 6543) — recommandé pour Node.js
5. **Copiez l’URL** (elle ressemble à :  
   `postgresql://postgres.[drnfinkocgtfjfzcrnus]:[YOUR-PASSWORD]@aws-0-XX-XXXX-X.pooler.supabase.com:6543/postgres`)
6. Remplacez `[YOUR-PASSWORD]` par le mot de passe de la base (celui défini à la création du projet)

> Si le mot de passe contient des caractères spéciaux (@, |, #, etc.), encodez-les en URL :
> - `@` → `%40`
> - `|` → `%7C`
> - `#` → `%23`

## 2. Configurer le backend

Éditez `backend/.env` et mettez à jour :

```env
DATABASE_URL=postgresql://postgres.drnfinkocgtfjfzcrnus:VOTRE_MOT_DE_PASSE@aws-0-XX-XXXX-X.pooler.supabase.com:6543/postgres
```

Collez l’URL exacte copiée depuis Supabase (avec votre mot de passe).

## 3. Créer les tables

```powershell
cd c:\ChatAnonyme\backend
npm run init-db
```

## 4. Option : exécuter le script SQL dans Supabase

Si `npm run init-db` échoue (connexion réseau), vous pouvez créer les tables manuellement :

1. Supabase → **SQL Editor**
2. Ouvrez `backend/server/scripts/init-db.sql`
3. Copiez tout le contenu et collez-le dans l’éditeur
4. Cliquez sur **Run**

## 5. Vérifier

Démarrez le backend :

```powershell
cd c:\ChatAnonyme\backend
npm start
```

Si la base est bien connectée, le serveur démarre sans erreur « ENOTFOUND » ou « ETIMEDOUT ».
