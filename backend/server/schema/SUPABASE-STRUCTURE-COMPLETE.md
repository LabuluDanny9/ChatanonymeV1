# Structure complete PostgreSQL/Supabase

Ce schema te donne une base "reseau social" complete, tout en gardant la logique principale de la plateforme:
- conversation **unidirectionnelle et privee** utilisateur -> administration (puis reponse admin),
- forum public avec thematiques et interactions.

## Tables coeur (deja utilisees par l'application)

- `users`: comptes utilisateurs inscrits (`pseudo`, `password_hash`, `status`, etc.)
- `admins`: comptes administrateurs
- `conversations`: 1 conversation par utilisateur (`UNIQUE(user_id)`)
- `messages`: historique chat (`message_type`, `metadata`, `is_read`, `deleted_at`, `edited_at`)
- `topics`: publications forum
- `topic_comments`: commentaires/reponses forum
- `broadcasts`: annonces admin -> tous
- `audit_logs`: traces des actions admin

## Extension "reseau social"

Ajoutees via `backend/server/migrations/004_social_network_structure.sql`:

- `user_profiles`: profil social (display name, bio, avatar, visibilite)
- `user_follows`: abonnements utilisateur -> utilisateur
- `topic_reactions`: reactions sur publications
- `topic_comment_reactions`: reactions sur commentaires
- `topic_subscriptions`: abonnement a un sujet
- `user_activity_logs`: journal d'activite utilisateur

Champs ajoutes sur `topics`:
- `theme_category`
- `theme_subcategory`
- `visibility` (`public`, `followers`, `private`)
- `comments_enabled`

Vue SQL admin:
- `v_admin_message_history`: historique global des messages avec jointures user + conversation.

## Endpoints admin pour suivi

Deja disponibles:
- `GET /api/admin/users` -> voir les utilisateurs inscrits
- `GET /api/admin/conversations` -> lister les conversations
- `GET /api/admin/conversations/:id` -> historique d'une conversation

Ajoute:
- `GET /api/admin/messages/history?limit=200&offset=0&q=&senderType=`
  - `q`: filtre texte (pseudo, contenu, type)
  - `senderType`: `user` ou `admin`

## Execution sur Supabase

1. Executer `backend/server/scripts/init-db-complet.sql` si base vide.
2. Executer ensuite toutes les migrations:
   - `001_initial.sql`
   - `002_messages_attachments.sql`
   - `003_topic_comments.sql`
   - `004_social_network_structure.sql`

Si tu utilises le script Node:
- `npm run migrate`

## Logique "WhatsApp/Facebook" mais unidirectionnelle

- Les utilisateurs peuvent publier/reagir/commenter sur le forum (logique sociale).
- Le chat prive reste gouverne par `conversations + messages` avec 1 fil par utilisateur.
- L'admin garde la supervision via users, conversations, message history, audit logs.

