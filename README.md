# MPCoach — piattaforma formativa Marco Petta

Piattaforma di one-to-one coaching chitarra per Marco Petta (metodo P.G.T.) — cliente CR Consulting.

Repo: `team285/piattaforma-formativa-marcopetta`

## Struttura

```
.
├── apps/
│   ├── web/          # React + Vite + TypeScript + Tailwind (sito)
│   └── mobile/       # React Native + Expo (da Fase 4)
├── packages/
│   └── shared/       # Tipi, client Supabase, logica condivisa
└── supabase/         # Schema SQL, migrations, RLS policies, Edge Functions
```

## Prerequisiti

- Node >= 20 (testato con v24.14.1)
- npm (workspaces nativi, no pnpm)
- Git

## Setup

```bash
npm install
npm run dev:web
```

Servirà anche un file `apps/web/.env.local` (non committato) con:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Decisioni architetturali

- **Backend:** Supabase (Postgres + Auth + Storage + Realtime)
- **Auth:** magic link invite-only, niente signup pubblica
- **Video:** Supabase Storage puro (no Mux) — aggiunto in futuro solo se egress supera ~€80/mese
- **Pagamenti:** NON nell'app — Marco vende fuori (gestionale esterno), app è solo strumento didattico
- **Mobile:** React Native + Expo con NativeWind, build via EAS Cloud
- **Deploy web:** Vercel

## Riferimenti

- Prototipo di design + spec funzionale: `../App Marco Petta/`
- Roadmap completa: `../App Marco Petta/project-memory/roadmap-online.md`
- Design system: `../App Marco Petta/project-memory/design-system.md`
- Demo script (golden path): `../App Marco Petta/project-memory/demo-script.md`
