# SILENCEHUB — Design System Figma

> Spécification complète pour créer le Design System dans Figma.  
> Plateforme SaaS d'échanges anonymes, administration centrale.

---

## 1️⃣ FOUNDATIONS (TOKENS)

### 🎨 Color System

#### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary 900 | `#081F2C` | Background secondaire |
| Primary 800 | `#0B3C5D` | Background principal |
| Primary 600 | `#0FA3B1` | Actions primaires |
| Primary 400 | `#22D3EE` | Accent / hover |

#### Neutral Scale
| Token | Hex | Usage |
|-------|-----|-------|
| Neutral 900 | `#0B0F19` | Background dark |
| Neutral 800 | `#1F2937` | Cards, surfaces |
| Neutral 600 | `#4B5563` | Text secondary |
| Neutral 400 | `#9CA3AF` | Text muted |
| Neutral 200 | `#E5E7EB` | Borders |
| Neutral 100 | `#F5F7FA` | Text light mode |

#### Semantic Colors
| Token | Hex |
|-------|-----|
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#3B82F6` |

**Figma :** Créer Color styles + Variables (Mode Dark/Light)

---

### ✍ Typography System

**Police :** Proxima Nova (fallback Inter)

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Display | 40px | Bold (700) | 48px |
| H1 | 32px | Bold (700) | 40px |
| H2 | 24px | SemiBold (600) | 32px |
| H3 | 18px | Medium (500) | 26px |
| Body | 16px | Regular (400) | 24px |
| Small | 14px | Regular (400) | 20px |
| Caption | 12px | Light (300) | 16px |

**Figma :** Text styles nommés

---

### 📐 Spacing System

Base : 8pt

| Token | Value |
|-------|-------|
| 4 | 4px |
| 8 | 8px |
| 12 | 12px |
| 16 | 16px |
| 24 | 24px |
| 32 | 32px |
| 40 | 40px |
| 48 | 48px |
| 64 | 64px |
| 96 | 96px |

---

### 🟦 Radius & Elevation

| Border Radius | Value |
|---------------|-------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |

| Elevation | Shadow |
|-----------|--------|
| Level 1 | 0 1px 3px rgba(0,0,0,0.12) |
| Level 2 | 0 4px 12px rgba(0,0,0,0.15) |
| Level 3 | 0 1px 3px rgba(0,0,0,0.12) (modal) |

**Glass :** blur 12px, opacity 4%

---

## 2️⃣ COMPONENTS LIBRARY

### 🔘 Buttons
- **Variants :** Primary, Secondary, Ghost, Danger
- **States :** Default, Hover, Active, Disabled, Loading
- **Props :** Icon left/right, Icon only

### 🧾 Inputs
- Default, Focus, Error, Disabled
- With icon, With helper text

### 🗂 Cards
- KPI Card, Info Card, Conversation Card, Topic Card
- Variants : Elevated, Flat, Glass

### 🧭 Navigation
- Sidebar : Default, Active, Collapsed, With badge
- Topbar : Search, Profile, Notification badge

### 💬 Chat
- Message bubble (admin/user)
- Typing indicator
- Message status (sent/delivered/seen)
- Chat input
- Conversation list item (Active, Unread, Closed, Banned)

### 📊 Data Display
- Table, Pagination, Badge, Tooltip, Modal, Toast, Dropdown

---

## 3️⃣ LAYOUT

| Breakpoint | Columns | Max Width |
|------------|---------|-----------|
| Desktop | 12 | 1280px |
| Tablet | 8 | - |
| Mobile | 4 | - |

---

## 4️⃣ ICONOGRAPHY

- Style : Outline
- Stroke : 2px
- Grid : 24px
- Lucide / Heroicons compatible

---

## 5️⃣ NAMING CONVENTION

```
Component/Variant/State
Ex: Button/Primary/Default
Ex: Card/KPI/Elevated
```

---

## 6️⃣ ACCESSIBILITY

- WCAG AA minimum
- Contrast 4.5:1 text
- Focus states visibles (2px outline turquoise)
