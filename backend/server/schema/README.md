# Schéma de base de données - ChatAnonyme / SilenceHub

## Tables

### users
Utilisateurs de la plateforme (pseudo, mot de passe, infos optionnelles).

| Colonne       | Type         | Description                    |
|---------------|--------------|--------------------------------|
| id            | UUID         | Clé primaire                   |
| pseudo        | VARCHAR(100) | Identifiant unique             |
| password_hash | VARCHAR(255) | Mot de passe hashé (bcrypt)   |
| phone         | VARCHAR(50)  | Téléphone (optionnel)          |
| email         | VARCHAR(255) | Email (optionnel)              |
| photo         | TEXT         | URL photo (optionnel)          |
| status        | VARCHAR(20)  | active, banned, deleted        |
| created_at    | TIMESTAMPTZ  | Date de création               |

### admins
Administrateurs de la plateforme.

| Colonne       | Type         | Description          |
|---------------|--------------|----------------------|
| id            | UUID         | Clé primaire         |
| email         | VARCHAR(255) | Email unique         |
| password_hash | VARCHAR(255) | Mot de passe hashé   |
| photo         | TEXT         | Photo de profil      |
| created_at    | TIMESTAMPTZ  | Date de création     |
| updated_at    | TIMESTAMPTZ  | Dernière modification |

### conversations
Conversations 1-to-1 entre un utilisateur et l'admin.

| Colonne     | Type        | Description        |
|-------------|-------------|--------------------|
| id          | UUID        | Clé primaire       |
| user_id     | UUID        | Réf. users(id)     |
| status      | VARCHAR(20) | open, closed       |
| created_at  | TIMESTAMPTZ | Date de création   |
| updated_at  | TIMESTAMPTZ | Dernière mise à jour |

### messages
Messages échangés dans les conversations.

| Colonne          | Type        | Description                          |
|------------------|-------------|--------------------------------------|
| id               | UUID        | Clé primaire                         |
| conversation_id  | UUID        | Réf. conversations(id)               |
| sender_type      | VARCHAR(10) | user, admin                          |
| sender_id        | UUID        | ID de l'expéditeur                   |
| content          | TEXT        | Contenu texte                        |
| message_type     | VARCHAR(20) | text, voice, image, video, file      |
| metadata         | JSONB       | Métadonnées (URL fichier, etc.)      |
| topic_id         | UUID        | Réf. topics(id) si lié à un sujet    |
| is_read          | BOOLEAN     | Lu ou non                            |
| deleted_at       | TIMESTAMPTZ | Date de suppression (soft delete)    |
| edited_at        | TIMESTAMPTZ | Date de modification                 |
| created_at       | TIMESTAMPTZ | Date de création                     |

### topics
Sujets publiés (conseils, exhortation, contact).

| Colonne      | Type        | Description      |
|--------------|-------------|------------------|
| id           | UUID        | Clé primaire     |
| title        | VARCHAR(500)| Titre             |
| content      | TEXT        | Contenu          |
| published_at | TIMESTAMPTZ | Date de publication |
| created_at   | TIMESTAMPTZ | Date de création |

### broadcasts
Messages collectifs envoyés par l'admin à tous les utilisateurs.

| Colonne    | Type        | Description    |
|------------|-------------|----------------|
| id         | UUID        | Clé primaire   |
| admin_id   | UUID        | Réf. admins(id)|
| content    | TEXT        | Contenu        |
| created_at | TIMESTAMPTZ | Date d'envoi   |

### audit_logs
Logs d'audit des actions admin.

| Colonne    | Type        | Description      |
|------------|-------------|------------------|
| id         | UUID        | Clé primaire     |
| admin_id   | UUID        | Réf. admins(id)  |
| action     | VARCHAR(100)| Action effectuée  |
| target_type| VARCHAR(50) | Type de cible    |
| target_id  | UUID        | ID de la cible   |
| details    | JSONB       | Détails          |
| ip_address | INET        | Adresse IP       |
| created_at | TIMESTAMPTZ | Date             |

## Structure JSON (mode local)

En mode `DATABASE_URL=json:./data/silencehub.json`, les données sont stockées dans un fichier JSON avec les clés :

- `users`
- `admins`
- `conversations`
- `messages`
- `topics`
- `broadcasts`
- `audit_logs`
