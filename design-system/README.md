# SILENCEHUB Design System

Design System complet pour la plateforme SaaS d'échanges anonymes.

## Structure

```
design-system/
├── DESIGN-SYSTEM-SPEC.md    # Spécification complète
├── DESIGN-SYSTEM-FIGMA-GUIDE.md  # Guide Figma étape par étape
├── tokens.json              # Tokens JSON (export)
├── tokens.css               # CSS variables
├── tailwind-tokens.js       # Extension Tailwind
└── README.md
```

## Utilisation

### Dans Figma
1. Suivre `DESIGN-SYSTEM-FIGMA-GUIDE.md` pour créer le fichier Figma
2. Utiliser `tokens.json` pour importer via Tokens Studio (plugin)

### Dans le code
```css
/* index.css */
@import '../design-system/tokens.css';
```

```js
// tailwind.config.js
const designTokens = require('./design-system/tailwind-tokens.js');
module.exports = {
  theme: {
    extend: designTokens,
  },
};
```

## Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary 900 | #081F2C | Background secondaire |
| Primary 800 | #0B3C5D | Background principal |
| Primary 600 | #0FA3B1 | Actions primaires |
| Primary 400 | #22D3EE | Accent |
| Neutral 100 | #F5F7FA | Textes |
| Error | #EF4444 | Alertes |

## Thème

- **Dark** : mode par défaut
- **Light** : `[data-theme="light"]`
