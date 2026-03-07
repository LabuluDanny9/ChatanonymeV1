# Schéma des tables - L'Aparté / ChatAnonyme

Correspondance entre les tables de la base de données et les fonctionnalités du projet.

## Vue d'ensemble

| Table | Rôle dans le projet |
|-------|---------------------|
| **users** | Utilisateurs de la messagerie anonyme (pseudo, mot de passe, statut) |
| **admins** | Administrateurs (forum, chat, broadcasts) |
| **conversations** | Conversations 1-to-1 user ↔ admin |
| **messages** | Messages du chat (texte, vocal, image, vidéo, fichier) |
| **topics** | Sujets forum publiés par l'admin |
| **broadcasts** | Messages collectifs admin → tous les users |
| **audit_logs** | Logs d'audit (actions admin, sécurité) |
| **topic_comments** | Commentaires forum (réponses imbriquées aux topics) |

## Détail par table

### 1. users
- **Messagerie anonyme** : chaque utilisateur a un pseudo unique
- Colonnes : `id`, `pseudo`, `password_hash`, `phone`, `email`, `photo`, `status`, `created_at`
- Statuts : `active`, `banned`, `deleted`

### 2. admins
- **Forum + Chat + Broadcasts** : les admins créent les topics, répondent au chat, envoient des broadcasts
- Colonnes : `id`, `email`, `password_hash`, `photo`, `created_at`, `updated_at`

### 3. conversations
- **Messagerie 1-to-1** : un utilisateur = une conversation avec l'équipe admin
- Colonnes : `id`, `user_id` (FK users), `status`, `created_at`, `updated_at`
- Statuts : `open`, `closed`

### 4. messages
- **Contenu du chat** : texte, vocal, image, vidéo, fichier
- Colonnes : `id`, `conversation_id` (FK), `sender_type`, `sender_id`, `content`, `message_type`, `metadata`, `topic_id` (FK, optionnel), `is_read`, `deleted_at`, `edited_at`, `created_at`
- `topic_id` : lien optionnel vers un sujet (contexte de la discussion)

### 5. topics
- **Forum** : sujets créés par l'admin, visibles par tous
- Colonnes : `id`, `title`, `content`, `published_at`, `created_at`

### 6. topic_comments
- **Forum** : commentaires et réponses imbriquées aux topics
- Colonnes : `id`, `topic_id` (FK), `author_id`, `author_type`, `author_name`, `parent_id` (FK, pour les réponses), `content`, `likes_count`, `created_at`

### 7. broadcasts
- **Messages collectifs** : admin → tous les utilisateurs
- Colonnes : `id`, `admin_id` (FK), `content`, `created_at`

### 8. audit_logs
- **Sécurité et débogage** : traces des actions admin
- Colonnes : `id`, `admin_id` (FK), `action`, `target_type`, `target_id`, `details` (JSONB), `ip_address`, `created_at`

## Ordre de création (FK)

Pour éviter les erreurs de clés étrangères :

1. users  
2. admins  
3. conversations  
4. topics (avant messages)  
5. messages  
6. topic_comments  
7. broadcasts  
8. audit_logs  

## Exécution

```bash
# PostgreSQL / Supabase
# Copier le contenu de init-db-complet.sql dans Supabase SQL Editor
```
