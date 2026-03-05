# Configuration base de données — ChatAnonyme

L'application supporte **deux modes** de stockage :

## 1. Mode JSON (développement local, sans PostgreSQL)

Par défaut, les données sont stockées dans un fichier JSON.

```env
DATABASE_URL=json:./data/silencehub.json
```

- **Inscription** et **connexion** utilisateurs : ✅
- **Connexion** admin : ✅
- Aucune installation requise

## 2. Mode PostgreSQL (production, Supabase)

Pour une base de données persistante et scalable :

### Étape 1 — Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un projet
3. Récupérez l’URL de connexion : **Project Settings > Database > Connection string (URI)**

### Étape 2 — Configurer `.env`

```env
# Remplacez par votre URL Supabase
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Ou en mode direct (port 5432) :

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Étape 3 — Initialiser le schéma

```bash
cd backend
npm run init-db
```

Crée les tables : `users`, `admins`, `conversations`, `messages`, `topics`, etc.

### Étape 4 — Créer l’admin initial

```bash
npm run seed-admin
```

Utilise `ADMIN_EMAIL` et `ADMIN_PASSWORD` définis dans `.env`.

### Étape 5 — Démarrer le serveur

```bash
npm run dev
```

---

## Vérification de la connexion

Au démarrage, le serveur affiche :
- `ChatAnonyme backend listening on port 5001` → OK
- Erreurs `ENOTFOUND` ou `Connection timeout` → vérifier `DATABASE_URL` et la disponibilité de Supabase

## Variables `.env` utiles

| Variable | Description |
|---------|-------------|
| `DATABASE_URL` | `json:./data/...` ou URL PostgreSQL |
| `ADMIN_EMAIL` | Email de l’admin initial |
| `ADMIN_PASSWORD` | Mot de passe admin (min. 8 caractères) |
| `JWT_SECRET` | Clé secrète JWT (à changer en production) |
