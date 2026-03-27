# Générer une APK Android (frontend web + backend API)

Ce projet utilise React (`frontend`) + API Node (`backend`).
Pour une APK, le plus simple est d'emballer le frontend avec **Capacitor**.

## 1) Build du frontend
```powershell
cd e:\DIL\ChatAnonyme\frontend
npm install
npm run build
```

## 2) Installer Capacitor dans le frontend
```powershell
cd e:\DIL\ChatAnonyme\frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init ChatAnonyme com.chatanonyme.app --web-dir=build
```

## 3) Configurer l'URL API pour mobile
### Option A (recommandée) — même version que Vercel (live)
Configure Capacitor pour charger directement ton URL Vercel :

```powershell
cd e:\DIL\ChatAnonyme\frontend
$env:CAPACITOR_SERVER_URL="https://votre-projet.vercel.app"
npx cap sync android
```

Dans ce mode, l'app mobile affiche exactement la même version que celle en ligne.

### Option B — build embarqué (offline partiel)
Dans Android Emulator, `localhost` ne pointe pas vers ton PC.
Utilise l'IP locale de ton backend, par ex `http://192.168.1.20:5001`.

Tu peux définir dans `frontend/.env.production`:
```env
REACT_APP_API_URL=http://TON_IP_LOCALE:5001
```

Puis rebuild:
```powershell
cd e:\DIL\ChatAnonyme\frontend
npm run build
```

## 4) Ajouter Android
```powershell
cd e:\DIL\ChatAnonyme\frontend
npx cap add android
npx cap sync android
```

## 5) Ouvrir Android Studio et générer APK
```powershell
cd e:\DIL\ChatAnonyme\frontend
npx cap open android
```

Dans Android Studio:
- `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.

## 6) Après modification frontend
```powershell
cd e:\DIL\ChatAnonyme\frontend
npm run build
npx cap sync android
```

Si tu utilises l'option A (live wrapper), pense à garder la variable :
```powershell
$env:CAPACITOR_SERVER_URL="https://votre-projet.vercel.app"
npx cap sync android
```

---

## Backend en parallèle (obligatoire)
L'APK appelle ton API Node:
```powershell
cd e:\DIL\ChatAnonyme\backend
npm install
npm start
```

Assure-toi que ton téléphone/émulateur peut atteindre l'API
(`http://TON_IP_LOCALE:5001/health`).

