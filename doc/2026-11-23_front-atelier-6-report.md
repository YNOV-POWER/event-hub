# Compte rendu : implémentation du Front EventHub (Atelier 6)

**Date** : 23/11/2026 · **Branche** : `feature/frontend-init-ui` · **Périmètre** : Séance 6 / Atelier 6 (slides 106–121)

---

## 1. Livré

- **Projet Front Next.js 16 (App Router) + TypeScript strict** dans `front/`, dockerisable (`front/Dockerfile`, profils `mock` et `front` ajoutés à `compose.yaml`).
- **Client d'API typé généré depuis OpenAPI** (`front/openapi.contract.yaml` → `src/api/generated/schema.d.ts` via `openapi-typescript`), encapsulé derrière une couche HTTP unique (`src/api/http.ts`) et les opérations métier (`src/api/client.ts`).
  - Règle ESLint `no-restricted-globals` / `no-restricted-properties` bloquant tout `fetch` hors de `src/api/http.ts`.
  - Conversion RFC 9457 (`application/problem+json`) en `ApiError` typée (`status`, `code`, `requestId`, `errors[]`) avec repli compatible `{ error: { code, details } }`.
  - Propagation de `X-Request-Id`, `Authorization: Bearer`, `Idempotency-Key` sur les mutations, timeout et nouvelle tentative sur `GET`.
- **Design System fidèle à la maquette Figma `Event-hub`** :
  - Tokens extraits de la page `🎨 Design system` dans `src/styles/tokens.css` (couleurs brand/surface/feedback, typographie Inter, échelle 4/8 px, rayons, ombres, dégradés par catégorie).
  - Primitives accessibles WCAG 2.2 AA (`Button`, `Badge`, `Alert`, `Input`, `Chip`, `Pagination`, `EmptyState`, `ErrorState`, `SkeletonCard`, `Navbar`, `Footer`).
- **Catalogue public `/events` (`SCRUM-39`, `SCRUM-56`)** :
  - Hook `useEvents` (TanStack Query, `staleTime: 30_000`, `placeholderData: keepPreviousData`).
  - Filtres et pagination synchronisés dans l'URL (`q`, `category`, `dates`, `sort`, `page`, `pageSize`) via `useEventFilters`.
  - **5 états d'interface explicites** : Chargement (`SkeletonCard`), Succès (`EventGrid` + `Pagination`), Vide (`EmptyState` + réinitialisation des filtres), Erreur (`ErrorState` selon `status`/`code` + `requestId` + « Réessayer »), Obsolète (`isFetching && !isPending` avec bandeau de revalidation et grille atténuée).
- **Page détail `/events/[id]` & formulaires d'inscription (`SCRUM-41`, `SCRUM-43`, `SCRUM-23`)** :
  - Détail d'événement (`useEvent`), gestion dédiée `404` et bandeau `CANCELLED`, affichage texte brut (protection XSS).
  - Formulaire d'inscription à un événement (`EventRegistrationForm` + `useRegisterToEvent`) et formulaire de création de compte (`/register` — `AccountRegistrationForm` + `useRegisterAccount`) avec **React Hook Form + Zod**, rattachement des erreurs serveur `422` par champ (`form.setError`), messages dédiés `409` (`EVENT_FULL`, `ALREADY_REGISTERED`, `EMAIL_ALREADY_USED`) et `422` (`REGISTRATION_CLOSED`, `VALIDATION_FAILED`), anti double-soumission (`disabled` + `Idempotency-Key`) et invalidation du cache TanStack Query.
  - Gardes de routes clients (`RouteGuard`) sur `/me/registrations` et `/admin/events/new` avec redirection `/login?next=…` (en rappelant que le Back reste la seule autorité `401`/`403`).
- **Storybook (`@storybook/nextjs-vite`) + CI GitHub Pages** :
  - 17 fichiers de stories (chaque composant de présentation dispose d'au moins 3 stories, avec `autodocs`, `@storybook/addon-a11y` et `msw-storybook-addon` pour `EventListPage`).
  - Workflow `.github/workflows/front-ci.yml` exécutant `api:generate`, `lint`, `typecheck`, `test`, `build`, `build-storybook` et le déploiement Storybook sur GitHub Pages.
- **Bascule Mock Prism ↔ Back réel sans changement de code** :
  - Proxy `rewrites()` dans `front/next.config.ts` piloté par `API_EVENTS_BASE` et `API_MOCK_BASE` (`npm run dev:mock` vs `npm run dev:back`).

---

## 2. Choix techniques

| Choix | Justification |
|---|---|
| **Next.js 16 (App Router) + TypeScript 5.9 strict** | Retenu par l'équipe ; `rewrites()` sert de proxy de dev sans CORS et `next/font/google` charge la police `Inter` du Design System. TypeScript 5.9.3 retenu (au lieu de 6.x) pour la compatibilité peer de `openapi-typescript@7`. |
| **`openapi-typescript` + `src/api/http.ts`** | Génère tous les types directement depuis OpenAPI sans surcouche opaque, tout en gardant un contrôle complet sur RFC 9457, `Idempotency-Key`, `X-Request-Id`, timeout et gestion `401`. |
| **TanStack Query v5** | Sépare strictement l'état serveur (cache, `staleTime`, invalidation, `keepPreviousData`) de l'état client (`AuthProvider`) et de l'état URL (`useSearchParams`). |
| **React Hook Form + Zod v4** | Même version de Zod que `back/` ; validation immédiate côté client alignée sur le contrat et rattachement natif des erreurs serveur `422` par champ. |
| **CSS Modules + `tokens.css`** | Zéro friction entre Next.js Turbopack et Storybook Vite, isolation stricte par composant, tokens Figma modifiables en un seul fichier. |
| **`i18next` + `Intl.DateTimeFormat`** | Aucun texte métier en dur ; codes d'erreur stables traduits côté Front ; dates UTC ISO 8601 converties en heure locale navigateur. |
| **Storybook 10 (`@storybook/nextjs-vite`) + MSW v3 + `addon-a11y`** | Support natif App Router, build statique rapide (4,2 s), contrôle d'accessibilité intégré et stories connectées alimentées par MSW. |

---

## 3. Vérifications effectuées

| Vérification | Résultat |
|---|---|
| `npm run api:generate` | Succès (`openapi.contract.yaml` → `src/api/generated/schema.d.ts`) |
| `npm run lint` (ESLint + `jsx-a11y` + règle anti-`fetch`) | **0 erreur, 0 avertissement** |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | **0 erreur** |
| `npm test` (Vitest + Testing Library + `axe-core`) | **5 suites, 23 tests passés — 0 violation `axe` critique ou sérieuse** |
| `npm run build` (Next.js production) | **8/8 routes compilées sans erreur** |
| `npm run build-storybook` | **Build statique `storybook-static/` réussi** |
| Test live **Mode 100 % Prism** (`API_EVENTS_BASE=http://127.0.0.1:4010`) | `GET /events` (`200`), `GET /api/events` (`200`, 3 événements d'exemple), `POST /registrations` `409` et `422` vérifiés |
| Test live **Mode Back réel + Prism hybride** (`API_EVENTS_BASE=http://127.0.0.1:3000/api`) | Sans changer de code : `GET /api/events` (`200`, `totalItems: 9`, header `X-Request-Id` Express réel), `GET /api/events/{id}` (`200`, `remainingSeats: 28`), `GET /api/events/not-a-uuid` (`404`), `POST /api/events/{id}/registrations` (`201` via Prism) |

---

## 4. Écarts constatés (à alimenter dans le backlog Sprint 2)

| # | Écart constaté | Impact côté Front | Action recommandée (backlog) |
|---|---|---|---|
| **E1** | **Format d'erreur divergent entre contrat et Back réel** : `api-contract-v0.md` §5 décrit `{ error: { code, details[] } }`, alors que `back/` renvoie du **RFC 9457** (`code`, `requestId`, `errors[]` au premier niveau). | Géré par `ApiError.fromHttpBody` (support RFC 9457 prioritaire + repli `error.details`). | Mettre à jour `api-contract-v0.md` §5 pour officialiser RFC 9457 comme unique format. |
| **E2** | **Endpoints non encore exposés côté Back réel** : `back/openapi.yaml` ne couvre que `GET /events` (E1) et `GET /events/{id}` (E2). `POST /events/{id}/registrations` (US11) et `POST /auth/register` (US01) manquent. | Contourné proprement par le proxy hybride Next.js (`API_MOCK_BASE` → Prism) et `front/openapi.contract.yaml`. | Implémenter `SCRUM-22` (US01 BE) et `SCRUM-42` (US11 BE), puis fusionner dans `back/openapi.yaml` et basculer `API_MOCK_BASE` sur `:3000/api`. |
| **E3** | **Corps de `POST /events/{id}/registrations` avant l'auth** : en Sprint 2, l'utilisateur viendra du JWT (`Authorization: Bearer`) ; pour l'Atelier 6 sans auth Back, le formulaire envoie `participantName`, `email` et `notes` (optionnel) afin de valider la gestion `422` par champ. | Contrat temporaire documenté dans `front/openapi.contract.yaml`. | Aligner le DTO exact de `POST /events/{id}/registrations` avec le Back lors du Sprint 2 (`US11`) et trancher le champ `myRegistration` sur `GET /events/{id}`. |
| **E4** | **Préfixe de route Prism vs Express** : Prism 5 ignore `servers[].url: /api` et expose `/events`, alors que Express monte ses routes sur `/api/events`. | Absorbé dans `next.config.ts` via `API_EVENTS_BASE` (`http://127.0.0.1:3000/api` vs `http://127.0.0.1:4010`). | Maintenir la séparation de préfixe dans la configuration d'environnement ; trancher `/api` vs `/api/v1` dans le contrat. |
| **E5** | **Absence d'en-tête `Cache-Control` explicite sur `GET /events`** : Express renvoie un `ETag` faible par défaut, mais aucun `Cache-Control` n'est contractualisé. | `staleTime: 30_000` fixé par défaut côté TanStack Query. | Définir `Cache-Control` côté Back et documenter la durée de fraîcheur dans le contrat. |
| **E6** | **Absence de middleware CORS côté Back** : `back/src/app.ts` ne positionne pas d'en-têtes CORS. | Sans impact en dev grâce au proxy same-origin Next.js `/api/*`. | Prévoir la configuration CORS côté Back si le Front est déployé sur une origine distincte en staging/prod. |
| **E7** | **Compteurs par catégorie de la maquette Figma** : la maquette `04 · Catalogue` affiche un compteur sur chaque chip de catégorie (`Atelier 42`, `Concert 27`…), mais `GET /api/events` ne retourne pas de facettes agrégées dans `meta`. | Chips affichés sans compteur pour éviter des appels superflus. | Décider au Sprint 2 si `meta.facets` est ajouté à E1 ou si les compteurs sont retirés de la maquette. |
| **E8** | **Statut Jira `SCRUM-41`** : `[FE] US10 - Détail d'un événement` est déjà en statut `Terminé` dans Jira alors que le Front n'était pas encore initialisé dans le dépôt. | Aucun impact technique, mais suivi Jira désynchronisé. | Vérifier le statut de `SCRUM-41` et mettre à jour `SCRUM-21`, `SCRUM-39`, `SCRUM-43`, `SCRUM-23`, `SCRUM-56` sur le board Jira. |
