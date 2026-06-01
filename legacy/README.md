# Handoff: Viaja — Planeador de viajes en grupo (PWA)

## Overview
**Viaja** is a mobile-first (PWA-ready) app that helps a small group plan a trip together. It solves six concrete problems the founders (Ricardo & Ale) described:

1. **Presupuesto difuso → Presupuesto en vivo.** A live, per-person budget that recalculates automatically from the options the group picks, with a "how many are coming?" slider (more people ⇒ cheaper per head because fixed costs split).
2. **Comparar opciones → Opciones + votación.** 3+ options per category (hospedaje, transporte, actividades, comida) with 1–5 star voting per guest, aggregate rating, and a side-by-side compare table.
3. **Info regada → Bandeja de Ideas.** Paste links / TikToks / flights / notes into one inbox; convert any item into a votable option.
4. **Versatilidad del plan.** People-count slider + per-trip scoping so plans flex with the group size.
5. **Motivación.** Tropical visual language (turquoise + coral + sun-gold), photo covers, count-up numbers, confetti on decisions, animated transitions.
6. **Control.** "Mis viajes" panel managing multiple trips; create-from-scratch wizard; invite flow; **organizer vs. guest** roles (guests view + vote, hosts decide).

## About the Design Files
The files in this bundle are **design references created in HTML/React (Babel-in-browser)** — a working prototype showing the intended look and behavior. They are **not** production code to ship as-is. The task is to **recreate these designs in the target codebase's environment** (recommended: React + Vite or Next.js for a real PWA, or React Native/Expo for native) using its established patterns, a real backend, and persistent storage. If no environment exists yet, React + Vite + TypeScript + a lightweight state store (Zustand) and Supabase/Firebase for realtime voting is a good fit.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, motion, and interaction patterns are all specified below and in the source files. Recreate the UI pixel-closely using the codebase's component library, then wire to a real backend.

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `--sand` | `#FBF6EE` | App background (warm off-white) |
| `--sand-2` | `#F4ECE0` | Subtle fills, meter tracks |
| `--card` | `#FFFFFF` | Card surfaces |
| `--ink` | `#143A35` | Primary text (deep teal-charcoal) |
| `--ink-2` | `#2E5A53` | Secondary text |
| `--ink-soft` | `#6B8C86` | Muted/caption text |
| `--line` | `#E9E0D2` | Borders / dividers |
| `--turq` | `#11BFB2` | Primary brand (turquoise) |
| `--turq-deep` | `#0B9A8F` | Primary pressed / text-on-light |
| `--turq-soft` | `#D6F4F0` | Primary tint backgrounds |
| `--coral` | `#FF6F5C` | Accent / primary CTA |
| `--coral-deep` | `#ED5440` | Accent pressed |
| `--coral-soft` | `#FFE2DC` | Accent tint |
| `--sun` | `#FFB43E` | Stars / ratings / "roadtrip" |
| `--sun-soft` | `#FFEFCF` | Sun tint |
| `--grape` | `#7C6CF0` | Tertiary (research, "city") |
| `--grape-soft` | `#E7E3FD` | Tertiary tint |

Accent colors are tuned to share lightness/chroma and vary only hue (turquoise/coral/sun/grape), per a harmonious palette.

### Typography
- **Display / headings:** `Outfit` (Google), weights 600–800, letter-spacing −0.02 to −0.03em.
- **Body / UI:** `Plus Jakarta Sans` (Google), weights 400–800.
- **Monospace (placeholder labels):** SF Mono / ui-monospace.
- Minimum body size 12–13px; large numbers (per-cápita hero) up to 50px.

### Radius / Shadow / Spacing
- Radius: `--r-lg 28px`, `--r-md 20px`, `--r-sm 14px`; buttons 16px; chips 11–14px; nav 26px.
- Shadows: `--sh-sm 0 2px 8px rgba(20,58,53,.06)`, `--sh-md 0 8px 24px /.10`, `--sh-lg 0 18px 44px /.16`; colored CTA shadows for coral/turquoise.
- Spacing rhythm: 6/8/10/12/14/16/18px gaps; screen padding 18px horizontal.
- Motion: ease `cubic-bezier(.22,1,.36,1)` for rises, `cubic-bezier(.34,1.56,.64,1)` for pop/spring. Screen-in 0.42s; star-pop 0.4s; confetti 1.1–1.8s; count-up 0.7s cubic ease-out.

### Photo placeholders
Covers and option photos use **tropical gradient placeholders** (SVG data-URI: 135° linear gradient per "tone" + a warm radial sun-glow). Tones: `pool, sunset, palm, grape, coral, night`. In the prototype these are also **drop targets** (`<image-slot>`) so a user can drag a real photo in; production should replace with a real image upload + CDN.

---

## Screens / Views

### 1. Home — "Mis viajes" (trips control panel)
- **Purpose:** manage all trips; jump into the active one.
- **Layout:** scroll view, 18px padding. Greeting row (`Hola {name} 🌴` + bell w/ unread dot). Featured trip = large card (186px photo cover with status chip top-left, days-left badge top-right, gradient-to-dark bottom with sub + name; then a row with dates + avatar stack on left and per-person price on right; then an "Avance de organización" progress meter). "Otros planes" list = horizontal mini-cards (64px square cover + name + status tag + sub + dates/people). Dashed "Nuevo viaje" CTA opens the create wizard.
- **Status tags:** planeando=turquoise "🌴 Planeando", idea=sun "💡 Idea", completado=grape "✓ Hecho".

### 2. Dashboard (per-trip home)
- **Purpose:** at-a-glance trip overview + module launcher.
- **Layout:** 300px hero photo (back "Viajes" button, ViewerChip + share/invite top-right; tag + title + dates/people bottom over a dark gradient). Overlapping (−26px) **countdown card** (progress ring + "Faltan N días" / "¡Define las fechas!"). 3 **stat cards** (per-persona, confirmados X/Y, decididas X/4). 2×2 **module grid** (Opciones, Presupuesto, Ideas, Itinerario). Then either a **getting-started checklist** (empty trips) or a **nudge** ("{name} aún no confirma") + **activity feed**.

### 3. Opciones (compare + vote)
- **Purpose:** compare options per category and vote.
- **Layout:** title + filter chips (Todas / per category). Per category: header (icon + label + "Comparar N"). **Option card**: 120px photo, title/subtitle, price (right, with unit `/persona`, `/persona/día`, or `total`), meta chips, source link, divider, **voting row** ("TU VOTO" = interactive 5 stars for the current viewer; right = aggregate avg ★ + voter avatar stack + count), then **host-only** "Elegir esta opción" / "Elegida para el plan" toggle (guests see "Elegida por el anfitrión" or "Tu voto ayuda a decidir ⭐").
- **Compare sheet:** bottom sheet with a grid table (rows: Precio, Rating, then each meta key) across all options in the category; winner column highlighted.
- **Winner logic:** hospedaje/transporte/comida = single winner (choosing one clears siblings); actividades = multiple winners allowed. Choosing fires confetti + toast.

### 4. Presupuesto (live budget)
- **Purpose:** live per-person cost.
- **Layout:** turquoise hero card with **count-up** per-cápita + "N personas · total $X". **People slider** (3–10; host-only; tip: "más personas, más barato"). **Goal meter** vs `--goal` (default $9,000/persona) with over/under message. **Category breakdown** cards (icon, label, winning option names, subtotal + per-person, share-of-total meter) — tap to jump to Opciones.
- **Cost model:** `total` = flat group cost; `pp` = price × N; `ppd` = price × N × DAYS (DAYS=5 demo). Per-cápita = sum ÷ N.

### 5. Ideas & links (research inbox)
- **Purpose:** one place for all research; convert to options.
- **Layout:** title + **paste bar** (host-only) opening "Guardar idea" sheet (textarea auto-detects type: tiktok/flight/link/note; category chips). Filter chips. **Research cards**: 84px gradient thumb + source glyph + type + "guardó {name}" + title + note + category tag + ("Es opción" badge | host-only "→ Opción" convert button). Converting creates a new votable option in that category and links it.

### 6. Itinerario
- **Purpose:** day-by-day plan.
- **Layout:** vertical timeline (2px line) with colored day markers (DÍA n) and cards (date, title, emoji+text items). Empty state for trips without an itinerary.

### 7. Invitados
- **Purpose:** manage the group; see who voted; split.
- **Layout:** header (confirmados/total) + "Ver como" (opens role switcher). Split summary card (cuota por persona + total). "El grupo" list: avatar + name + ANFITRIÓN/TÚ tags + voting-progress meter + confirmed check / PENDIENTE tag. "Invitar" opens the invite sheet.

### Overlays
- **Create-trip wizard** (`CreateTrip`): full-height sheet, 4 steps with progress dots. (1) name + destination + vibe grid (6 gradient swatches, each sets tone+emoji). (2) date inputs + people slider. (3) cover photo drop + live preview card. (4) invite link + "¡Todo listo!" → **Crear viaje** creates the trip (active, members=[hosts]) and lands on its dashboard.
- **Invite sheet** (`InviteSheet`): shareable link + copy, channel buttons (WhatsApp/Mensajes/Copiar), add-by-name input (adds a pending guest to the active trip).
- **Viewer switch** (`ViewerSwitch`): "Ver la app como…" list of group members; selecting changes the current viewer (host = full control; guest = view + vote only). Demonstrates the organizer/guest model.

---

## Interactions & Behavior
- **Voting:** tapping a star writes `votes[viewerId] = n`; aggregate avg + voter avatars update live; star-pop animation.
- **Choosing a winner:** host-only; single-winner categories clear siblings; confetti burst + toast; feeds the budget.
- **People slider:** updates `peopleCount`; budget per-cápita and per-category recompute instantly (count-up animation on the hero numbers).
- **Convert research → option:** host-only; appends an option (pre-seeded with viewer's 4★) and marks the research item converted; toast.
- **Create trip:** builds a trip object, sets it active, navigates to its (empty) dashboard with getting-started state.
- **Invite:** adds a guest (new avatar color from palette) to the active trip's members; toast.
- **Role switch:** flips `viewer`; non-hosts get a guest banner and lose host-only controls (choose, convert, paste, slider, invite write).
- **Empty states:** every module has a tailored empty state for newly created trips (no options/research/itinerary yet).
- **Navigation:** 5-tab glass bottom nav (Inicio/Opciones/Presupuesto/Ideas/Plan) inside a trip; hidden on Home. Dashboard "Viajes" button returns Home.

## State Management
Prototype keeps everything in React state in `app.jsx`. For production, model:
- `trips[]` — `{ id, name, sub, tone, emoji, dates, daysLeft, people, status, active, memberIds[] }`
- `people[]` — `{ id, name, initials, color, host?, confirmed? }`
- `options[]` — `{ id, trip, cat, tone, emoji, title, subtitle, price, unit(total|pp|ppd), priceNote, meta[[k,v]], link, winner, votes{personId:1..5} }`
- `research[]` — `{ id, trip, type(tiktok|flight|link|note), cat, tone, title, source, note, saved, converted(optionId|null) }`
- `itinerary[]` — `{ day, date, title, tone, items[[emoji,text]] }`
- UI state: `activeTripId, peopleCount, viewer, screen, toast, confetti, creating, inviteOpen, viewerOpen`.
- **Derived (memoized):** budget per trip = `{ byCat{subtotal,perPerson,note,winners}, total, perCap, decided, progress, optCount }`.
- **Realtime:** votes, options, and member confirmations should sync across guests (websocket/Firebase/Supabase realtime). Roles enforce write permissions server-side (hosts decide, guests vote).
- **Persistence:** photos in the prototype persist via `<image-slot>` sidecar; production should use real uploads + a `cover_url` per trip/option.

## Assets
- **Fonts:** Outfit + Plus Jakarta Sans (Google Fonts).
- **Icons:** inline SVG set in `components.jsx` (`Icon` component) — replace with the codebase's icon library (Lucide is a close match).
- **Imagery:** gradient SVG placeholders (`gradSrc` in `components.jsx`); no external image assets. Users supply real photos; the founders will upload later.
- **Emoji:** used intentionally as part of the playful brand (🌴🏝️🎉⭐💰). Keep or swap for illustration set.

## Files
Design source (all at project root):
- `Viaja.html` — entry; loads fonts, scripts, mounts into an iPhone frame.
- `styles.css` — full design system (tokens, components, animations).
- `data.js` — seed data (Puerto Escondido demo trip, people, options, research, itinerary, trips, category meta).
- `components.jsx` — shared primitives: `Icon, Photo, gradSrc, PhotoSlot, Av/AvStack, Stars, Meter, Ring, Confetti, Count, Sheet, SourceGlyph`.
- `screens-a.jsx` — `HomeScreen, Dashboard, Guests, StatCard`.
- `screens-b.jsx` — `Options, OptionCard, CompareSheet, Budget, Research, Itinerary`.
- `screens-c.jsx` — `EmptyState, GuestBanner, ViewerChip, ViewerSwitch, InviteSheet, CreateTrip`.
- `app.jsx` — state, budget engine, navigation, role logic, mounting.
- `ios-frame.jsx` — device bezel (prototype chrome only; drop in production).
- `image-slot.js` — drag-to-fill photo component (prototype; replace with real upload).

> Note: the prototype renders inside a simulated iPhone frame for presentation. In production, render the app full-bleed responsive and add a real PWA manifest/service worker (a starter `manifest.json` is included).
