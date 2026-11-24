# CLAUDE.md — bowling-tournament-app

## Overview
Next.js frontend for the bowling tournament management system.
Stack: Next.js 15 · TypeScript · Tailwind CSS v4 · Auth0 (`@auth0/nextjs-auth0`) · HeadlessUI · lucide-react · next-intl

Consumes: bowling-tourney-service API (default `http://localhost:3000`)

## Commands
- `npm run dev` — start dev server (port 3001)
- `npm run build` — production build (always verify before committing)
- `npm run lint` — ESLint

## Local Setup
- Copy `.env.example` to `.env.local` and fill in secrets
- Backend must be running on port 3000 (or update `APP_BASE_URL`)
- Auth0 tenant must be configured with matching domain/client credentials

## Architecture

### Auth
- `src/lib/auth0.ts` — Auth0 client config
- `src/middleware.ts` — protects all routes except static assets and API
- `Auth0Provider` in `layout.tsx` seeded with server-side session for SSR hydration
- Auth redirect: `/auth/login`, `/auth/logout`

### API Client
- `src/lib/api.ts` — typed API client with namespaces: `leagues`, `tournaments`, `teams`, `players`, `registrations`, `matches`, `scores`, `statistics`
- All API calls go through `ApiClient.request()` which handles auth headers and error formatting

### RBAC
- `src/lib/rbac.ts` — role definitions and permission checks
- `src/contexts/RBACContext.tsx` — provides current user role
- `src/hooks/usePermissions.ts` — permission helper hook
- Components: `PermissionGate`, `AdminOnly`, `AdminOrLeagueAdmin` in `src/components/rbac/`
- `ProtectedRoute` wraps authenticated pages; `EnhancedProtectedRoute` adds role checks

### Shared Components
- `LeagueTournamentPicker` — league → tournament cascade dropdown, used on Teams/Players/Matches/Statistics pages
- `Breadcrumb` — hierarchical navigation trail, used on all detail/deep pages
- `Navigation` — persistent top navbar with all 5 sections + language switcher

### i18n
- `next-intl` with messages in `src/messages/en.json` and `src/messages/es.json`
- Config in `src/i18n/request.ts`
- Use `useTranslations('namespace')` hook in components
- When adding UI text, add keys to both `en.json` and `es.json`

### Pages Structure
```
/                           — Dashboard
/tournaments                — List (with league filter)
/tournaments/[id]           — Detail (tabs: Overview, Standings, Statistics, Rosters)
/tournaments/[id]/edit
/tournaments/[id]/sessions
/tournaments/[id]/sessions/[n]/matches
/tournaments/[id]/sessions/[n]/score
/tournaments/[id]/detailed-statistics
/tournaments/[id]/schedule/{summary,preview,validate}
/teams, /teams/[id], /teams/[id]/edit
/players, /players/[id], /players/[id]/edit
/matches, /matches/[id]
/statistics
```

## Conventions
- `'use client'` on all interactive pages
- Tailwind utility classes — no custom CSS unless necessary
- lucide-react for icons
- Forms use controlled state with `useState`
- Loading states: spinner div with `animate-spin`
- Error display: red-bordered alert box

## PR Rules
- **Before starting feature work, ask the user for a branch name**
- **A single PR must not contain more than 10 committed files** — split into smaller PRs if needed
- Always present a plan and wait for approval before coding
- Include tests as part of any feature plan
- Run `npm run build` before committing to verify no type/build errors
