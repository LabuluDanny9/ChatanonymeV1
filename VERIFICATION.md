# Vérification SILENCEHUB

## 1. REACT_APP_API_URL (frontend/.env)

| Fichier | Valeur attendue | Statut |
|---------|-----------------|--------|
| `frontend/.env` | `REACT_APP_API_URL=http://localhost:5001` | ✅ Configuré |
| `backend/.env` | `PORT=5001` | ✅ Correspond |

**Règle** : L’URL du frontend doit utiliser le même port que le backend.

---

## 2. Permissions micro (navigateur)

- **Enregistrement vocal** : la page doit être servie en **HTTPS** ou **localhost**
- Au premier clic sur le micro, le navigateur demande l’autorisation
- Pour vérifier : F12 → Console → pas d’erreur "NotAllowedError"

**Si le micro ne fonctionne pas** :
- Vérifier les permissions du site (icône cadenas dans la barre d’adresse)
- Réinitialiser les permissions pour localhost si besoin

---

## 3. Fichiers uploadés (audio, images, etc.)

| Élément | Chemin | Statut |
|---------|--------|--------|
| Dossier uploads | `backend/server/uploads/` | Créé automatiquement |
| Route statique | `GET /uploads/:filename` | ✅ Dans App.js |
| URL complète | `http://localhost:5001/uploads/xxx` | ✅ Via REACT_APP_API_URL |

**Test manuel** :
1. Démarrer le backend : `cd backend && npm start`
2. Tester l’API : ouvrir `http://localhost:5001/health` → doit afficher `{"status":"ok"}`
3. Après un envoi vocal, tester : `http://localhost:5001/uploads/nom-du-fichier.webm`

---

## 4. CORS

| Option | Valeur |
|--------|--------|
| Backend CORS_ORIGIN | `http://localhost:3000` |
| Frontend (dev) | `http://localhost:3000` |

Les origines doivent correspondre pour éviter les erreurs CORS.

---

## 5. Résumé des ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5001 | http://localhost:5001 |
| Frontend React | 3000 | http://localhost:3000 |
| WebSocket | 5001/ws | ws://localhost:5001/ws |

---

## En cas d’erreur "Erreur lecture" (audio)

1. Vérifier que le backend tourne sur le port 5001
2. Vérifier `REACT_APP_API_URL` dans `frontend/.env`
3. Redémarrer le frontend après modification du `.env`
4. Ouvrir les DevTools (F12) → Network → vérifier les requêtes vers `/uploads/` (statut 200)
