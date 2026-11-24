# EventHub · Front (Next.js App Router)

Application Front EventHub construite pour l'**Atelier 6** (Séance 6 : Architecture et implémentation du Front), alignée sur la maquette Figma **Event-hub** et le contrat OpenAPI 3.1 (`openapi.contract.yaml` / `back/openapi.yaml`).

## Prérequis

- Node.js `>= 24`
- (Optionnel) Docker Compose pour le Back réel (`compose.yaml` à la racine)

## Commandes principales

```bash
cd front
npm install
npm run api:generate     # Génère src/api/generated/schema.d.ts depuis openapi.contract.yaml
npm run lint             # ESLint (jsx-a11y + interdiction de `fetch` hors src/api/http.ts)
npm run typecheck        # next typegen + tsc --noEmit
npm test                 # Vitest + Testing Library + contrôle axe-core
npm run build            # Build production Next.js
npm run storybook        # Storybook dev (port 6006, avec addon-a11y & MSW)
npm run build-storybook  # Build statique Storybook (publié sur GitHub Pages en CI)
```

## Bascule Mock Prism ↔ Back réel (sans changement de code)

Le proxy `rewrites()` dans `next.config.ts` est piloté par variables d'environnement (`API_EVENTS_BASE` et `API_MOCK_BASE`). Aucun fichier `.env` n'est versionné (voir `.env.example`, `.env.mock.example`, `.env.integration.example`).

1. **Mode 100 % Mock Prism** :
   ```bash
   # Terminal 1
   npm run mock:prism
   # Terminal 2
   npm run dev:mock
   ```
   Ouvrir `http://localhost:3001/events`.

2. **Mode Intégration hybride (Back réel pour E1/E2 + Prism pour routes Sprint 2)** :
   ```bash
   # À la racine du repo (démarre PostgreSQL + Back réel sur :3000)
   docker compose up -d db back
   docker compose exec back npm run db:seed

   # Dans front/
   npm run mock:prism   # Terminal 1 (routes POST /registrations et /auth/register)
   npm run dev:back     # Terminal 2 (/api/events -> :3000, reste -> :4010)
   ```
   Ou via Docker Compose avec le profil `front` :
   ```bash
   docker compose --profile mock --profile front up --build
   ```

## Architecture en couches

- `src/api/` : client HTTP unique (`http.ts`, seul fichier autorisé à appeler `fetch`), erreurs RFC 9457 (`errors.ts`), opérations typées générées depuis OpenAPI (`client.ts`, `generated/schema.d.ts`).
- `src/hooks/` : état serveur via TanStack Query (`useEvents`, `useEvent`, `useRegisterToEvent`, `useRegisterAccount`) et état URL (`useEventFilters`).
- `src/components/ui/` : primitives du Design System Figma (`tokens.css` + CSS Modules), toutes documentées dans Storybook (≥ 3 stories chacune).
- `src/components/events/` & `src/components/auth/` : composants métier de présentation purs (aucun appel réseau).
- `src/app/` : pages conteneurs Next.js App Router et gardes d'accès (`RouteGuard`).
