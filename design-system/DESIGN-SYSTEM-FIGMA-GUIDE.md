# Guide Figma — Création du Design System SILENCEHUB

Ce guide étape par étape permet de créer le Design System dans Figma.

---

## 1. Créer le fichier Figma

1. Nouveau fichier Figma
2. Nommer : `SILENCEHUB Design System`
3. Créer les pages :
   - `🎨 Foundations`
   - `🧩 Components`
   - `📐 Layout`
   - `📖 Documentation`

---

## 2. FOUNDATIONS — Variables

### Couleurs (Variables)
1. **Create** → **Variables** → **Mode** : `Dark` / `Light`
2. Collection `Colors` :
   - `primary/900` : #081F2C
   - `primary/800` : #0B3C5D
   - `primary/600` : #0FA3B1
   - `primary/400` : #22D3EE
   - `neutral/900` : #0B0F19
   - `neutral/800` : #1F2937
   - `neutral/600` : #4B5563
   - `neutral/400` : #9CA3AF
   - `neutral/200` : #E5E7EB
   - `neutral/100` : #F5F7FA
   - `semantic/success` : #22C55E
   - `semantic/warning` : #F59E0B
   - `semantic/error` : #EF4444
   - `semantic/info` : #3B82F6

### Spacing
- `spacing/4` : 4
- `spacing/8` : 8
- `spacing/12` : 12
- `spacing/16` : 16
- `spacing/24` : 24
- `spacing/32` : 32
- `spacing/48` : 48
- `spacing/64` : 64
- `spacing/96` : 96

### Typography
- **Text styles** : Display, H1, H2, H3, Body, Small, Caption
- **Police** : Proxima Nova (ou Inter si non disponible)

---

## 3. COMPONENTS — Structure

### Boutons
- Frame avec Auto-layout
- Variants : Primary, Secondary, Ghost, Danger
- States : Default, Hover, Active, Disabled
- Props : `Icon left`, `Icon right`, `Icon only`

### Inputs
- Champ texte + label + helper
- States : Default, Focus, Error, Disabled

### Cards
- KPI Card : icône + label + valeur
- Info Card : titre + contenu
- Conversation Card : avatar + nom + statut + date
- Topic Card : titre + extrait + date

### Navigation
- Sidebar item : icône + label + chevron
- Topbar : logo + search + actions

### Chat
- Bubble Admin : fond turquoise, align droit
- Bubble User : fond gris, align gauche
- Typing indicator : 3 points animés
- Input : textarea + send

---

## 4. Auto-layout

- **Padding** : utiliser les variables spacing
- **Gap** : 8, 12, 16
- **Resize** : Hug contents pour les boutons
- **Fill** : Horizontal pour les inputs

---

## 5. Naming Convention

```
DS/Button/Primary
DS/Button/Primary/Hover
DS/Card/KPI
DS/Input/Default
DS/Chat/Bubble/Admin
```

---

## 6. Export

- **Figma** : File → Export → Design tokens (JSON)
- **Style Dictionary** : pour générer CSS/SCSS/Tailwind
- **Tokens Studio** : plugin Figma pour sync tokens

---

## 7. Ressources

- **Proxima Nova** : Adobe Fonts (si disponible)
- **Inter** : Google Fonts (fallback)
- **Lucide Icons** : https://lucide.dev (2px stroke, 24px)
