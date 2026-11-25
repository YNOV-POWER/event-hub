# EventHub

Plateforme de gestion et d'inscription aux événements (projet fil rouge M2 Full Stack — Coordination Front/Back).

- **Back** (`back/`) : API REST Node.js / Express 5, TypeScript, PostgreSQL 18 + Prisma 7, erreurs RFC 9457, Swagger UI.
- **Front** (`front/`) : Next.js 16 (App Router), TypeScript strict, TanStack Query, React Hook Form + Zod, i18next, client typé généré depuis OpenAPI, Storybook 10 (`@storybook/nextjs-vite`) + `addon-a11y` + MSW.
- **Mock API** : Prism 5 branché sur `front/openapi.contract.yaml` pour les endpoints pas encore implémentés côté Back.

---

## Prérequis

- **Docker** et **Docker Compose** (recommandé pour lancer toute la stack)
- *(Optionnel, pour exécution hors Docker)* **Node.js ≥ 24** et npm

---

## Démarrage rapide avec Docker Compose

Toutes les commandes ci-dessous s'exécutent depuis la racine du dépôt (`compose.yaml`).

### 1. Lancer toute la stack (PostgreSQL + Back + Prism + Front + Storybook)

```bash
docker compose --profile "*" up -d --build
docker compose exec back npm run db:seed
```

### 2. Lancer uniquement certains services

| Besoin | Commande |
|---|---|
| **Back + DB uniquement** | `docker compose up -d --build` |
| **Back + Front + Prism** *(sans Storybook)* | `docker compose --profile mock --profile front up -d --build` |
| **Storybook seul** | `docker compose --profile storybook up -d --build storybook` |
| **Front + Mock Prism seul** *(sans Back)* | `API_EVENTS_BASE=http://prism:4010 docker compose --profile mock --profile front up -d --build --no-deps prism front` |

### 3. URLs exposées en local

| Service | URL | Port surchargeable |
|---|---|---|
| **Front (EventHub)** | <http://localhost:3001/events> | `FRONT_PORT` (défaut `3001`) |
| **Storybook** | <http://localhost:6006> | `STORYBOOK_PORT` (défaut `6006`) |
| **API Back** | <http://localhost:3000/api> | `BACK_PORT` (défaut `3000`) |
| **Swagger UI (OpenAPI)** | <http://localhost:3000/docs> | `BACK_PORT` (défaut `3000`) |
| **Mock API (Prism)** | <http://localhost:4010> | `PRISM_PORT` (défaut `4010`) |
| **PostgreSQL** | `localhost:5432` (`eventhub` / `eventhub`) | `DB_PORT` (défaut `5432`) |

> **Routage du proxy Front (`front/next.config.ts`) :** par défaut en mode Docker complet, `/api/events` et `/api/events/:id` sont servis par le **Back réel** (`http://back:3000/api`), tandis que les routes pas encore livrées côté Back (`POST /api/events/:id/registrations`, `POST /api/auth/register`) passent par **Prism** (`http://prism:4010`).

---

## Commandes Docker utiles

| Action | Commande |
|---|---|
| Peupler la base de dev *(idempotent)* | `docker compose exec back npm run db:seed` |
| Réinitialiser la base puis re-seeder | `docker compose exec back npm run db:reset && docker compose exec back npm run db:seed` |
| Suivre les logs d'un service | `docker compose logs -f back` *(ou `front`, `storybook`, `prism`)* |
| Voir l'état des conteneurs | `docker compose --profile "*" ps` |
| Arrêter toute la stack | `docker compose --profile "*" down` |
| Arrêter et supprimer les données PostgreSQL | `docker compose --profile "*" down -v` |

---

## Développement en local (sans Docker pour le Front / Storybook)

Utile pour itérer rapidement sur le Front ou lancer les tests tout en gardant `db` + `back` dans Docker :

```bash
# 1. Démarrer la DB et le Back dans Docker
docker compose up -d --build
docker compose exec back npm run db:seed

# 2. Installer les dépendances Front
cd front
npm install
npm run api:generate

# 3. Lancer le mock Prism (pour les routes Sprint 2) + le Front connecté au Back réel
npm run mock:prism   # Terminal 1 -> http://127.0.0.1:4010
npm run dev:back     # Terminal 2 -> http://localhost:3001/events

# (Alternative 100 % mock Prism, sans Back Docker)
npm run dev:mock

# Lancer Storybook en local
npm run storybook    # http://localhost:6006
```

### Qualité, tests et builds

```bash
# Front (`cd front`)
npm run lint             # ESLint (jsx-a11y + zéro fetch hors src/api/http.ts)
npm run typecheck        # next typegen + tsc --noEmit
npm test                 # Vitest + Testing Library + contrôle axe-core
npm run build            # Build production Next.js
npm run build-storybook  # Build statique Storybook (storybook-static/)

# Back (`cd back`)
npm run typecheck
npm run lint
npm run build
```

---

## Stratégie de branches & contribution

| Branche | Environnement / rôle | Règles de protection |
|---|---|---|
| **`main`** | **Production** *(déploie Storybook sur GitHub Pages)* | Protégée (admins inclus) : aucun commit direct, PR obligatoire, **≥ 1 validation d'un pair**, force-push et suppression interdits |
| **`develop`** | **Préproduction / intégration** | Protégée (admins inclus) : aucun commit direct, PR obligatoire, **≥ 1 validation d'un pair**, force-push et suppression interdits |
| `feature/<nom>`, `fix/<nom>`, `docs/<nom>` | Développement d'une tâche / US | Créée depuis `develop`, fusionnée vers `develop` via PR |

### Flux de travail

1. Créer une branche depuis `develop` :
   ```bash
   git checkout develop && git pull
   git checkout -b feature/<nom-court>
   ```
2. Ouvrir une **Pull Request vers `develop`** et obtenir **au moins une validation** d'un pair (toute nouvelle poussée révoque les validations obsolètes).
3. Pour livrer en production : ouvrir une **Pull Request de `develop` vers `main`** (validation d'un pair requise).

---

## Structure du dépôt

```text
.
├── compose.yaml                          # Orchestration Docker (db, back, prism, front, storybook)
├── api-contract-v0.md                    # Contrat d'API v0.1
├── back/                                 # API Express 5 + Prisma 7 + OpenAPI (`back/README.md`)
├── front/                                # App Next.js 16 + Storybook 10 (`front/README.md`)
├── doc/
│   ├── maquettes/                        # Maquettes : captures Figma + wireframes HTML
│   ├── 2026-11-20_backend-init-report.md # Compte rendu initialisation Back
│   └── 2026-11-23_front-atelier-6-report.md # Compte rendu Front (Atelier 6) et écarts Sprint 2
└── .github/workflows/
    ├── front-ci.yml                      # CI Front + publication Storybook sur GitHub Pages
    └── back-ci.yml                       # CI Back : lint, typecheck, build, migrations + seed sur PostgreSQL 18
```

## Documentation complémentaire

- Back : [`back/README.md`](back/README.md)
- Front : [`front/README.md`](front/README.md)
- Contrat d'API : [`api-contract-v0.md`](api-contract-v0.md)
- Compte rendu : [`doc/`](doc/)
- Suivi Jira : [`Cours/Jira.md`](Cours/Jira.md)
