# Rapport de fin de Sprint 1 — Release PR #24

**Date** : 27/11/2026 · **Pull Request de release** : [`#24 — Release Sprint 1`](https://github.com/YNOV-POWER/event-hub/pull/24) (`develop` → `main`, HEAD `7a8270c`) · **Sprint** : `SCRUM Sprint 1` (23–27 nov. 2026) · **Statut PR** : Ouverte *(CI verte, en attente de revue et merge vers `main`)*

---

## 1. Synthèse exécutive & indicateurs clés

La Pull Request **#24 (`develop` → `main`)** consolide l'ensemble des livrables intégrés sur `develop` durant le Sprint 1 afin de livrer sur `main` :
- la **chaîne d'authentification Back-end complète** conforme au contrat d'API v0.1 (`register`, `login`, `me`, middleware JWT) ;
- l'intégralité des **10 écrans desktop Figma (`01` à `10`)** côté Front-end (authentification, espace participant et espace organisateur), documentés dans **Storybook** ;
- un **Design System unifié et enrichi** (nouvelles primitives UI et registre d'icônes centralisé) ;
- des **pipelines CI complets** couvrant le Back-end, le Front-end, Storybook et un nouveau job automatisé **RGAA & SEO** ;
- la **documentation d'architecture et de suivi** (`ADR 0001`, contrats OpenAPI, comptes rendus quotidiens).

### Indicateurs de la PR #24 (`main..develop`)

| Indicateur | Valeur |
|---|---|
| **Volume de code** | **150 fichiers modifiés** (`+11 021` / `-770` lignes) |
| **Commits intégrés** | **31 commits** regroupant **16 Pull Requests** (`#6`, `#8`–`#11`, `#13`–`#23`) |
| **Contributeurs** | **5 membres** : Pierre (`PierreTDX`), Axel (`axel-vair`), Soukina (`Soukina-NOUNOU`), Loïc Rabault (`LoicRab`), Ismail (`ismail-bouasria`) |
| **Tests automatisés Front** | **11 fichiers / 62 tests Vitest + Testing Library + `axe-core`** *(100 % passés)* |
| **Couverture Storybook** | **46 fichiers `.stories.tsx`** *(contre 17 à l'initialisation Front du 23/11)* |
| **CI GitHub Actions (PR #24)** | **3/3 jobs actifs verts** (`Back CI`, `Front CI & Storybook`, `Rapport RGAA & SEO`) |
| **Avancement Jira (`SCRUM Sprint 1`)** | **21/30 tickets `Terminé`** *(+ 2 tickets Front `SCRUM-31`, `SCRUM-35` livrés en attente de clôture ; 5 tickets SEO créés le 27/11 suite au nouvel audit CI)* |

> **Rappel du socle déjà livré sur `main` en début de Sprint 1 (avant la PR #24)** : initialisation du Back Express 5 / Prisma 7 / PostgreSQL 18 (`#1`, endpoints `GET /api/events` et `GET /api/events/{id}`), maquettes et wireframes (`#2`, `#5`), initialisation Front Next.js 16 / Storybook 10 / catalogue & détail (`#3`, `#4`), et premières primitives UI `Modal`, `SkeletonRow`, `Toast` (`#7`, resynchronisées sur `develop` via `#8`).

---

## 2. Périmètre livré dans la PR #24

### 2.1 Back-end (`back/`)
- **Authentification conforme au contrat v0.1 (`#10`, `#15`, `#16`)** :
  - `POST /api/auth/register` (`US01`) : création de compte `PARTICIPANT`, hashage `bcrypt` (coût 12, limite 72 octets), gestion des doublons `409 EMAIL_ALREADY_USED`, validation stricte Zod (`parse-body.ts`, mot de passe ≥ 12 caractères, enveloppe `{ data }`, erreurs `422 VALIDATION_FAILED` avec codes champ normalisés `MIN_LENGTH`, `MAX_LENGTH`, `INVALID_FORMAT`, `INVALID_TYPE`, `UNKNOWN_FIELD`).
  - `POST /api/auth/login` (`US02`) : vérification des identifiants et émission d'un JWT HS256 (`jose`, `JWT_SECRET` configuré dans `env.ts` et `compose.yaml`).
  - `GET /api/me` (`A3`) et middleware réutilisable `requireAuth` (`Authorization: Bearer`, vérification `sub`/`exp`, en-tête `WWW-Authenticate: Bearer`, relecture de l'utilisateur en base).
- **Contrat & documentation API (`#10`, `#15`, `#16`)** : ajout de la spécification complète des routes d'authentification dans `back/openapi.yaml` (`+371` lignes) et mise à jour de `back/README.md`.
- **CI Back-end (`#6`)** : création de `.github/workflows/back-ci.yml` exécutant `prisma:generate`, `lint`, `typecheck`, `build`, puis `db:deploy` et `db:seed` sur un conteneur PostgreSQL 18 éphémère.

### 2.2 Front-end (`front/`)
- **Authentification — Écrans `02` et `03` (`#9`)** :
  - Pages `/register` et `/login` alignées sur Figma avec mise en page commune `AuthLayout`, composant `LoginForm`, redirection sécurisée (`src/auth/safe-redirect.ts`) et 13 tests unitaires + accessibilité.
- **Espace participant — Écran `06 · Mes inscriptions` (`#13`)** :
  - Page `/me/registrations` (`MyRegistrationsPage`, `MyRegistrationsView`, `RegistrationRow`, hooks `useMyRegistrations` et `useCancelRegistration`) avec états chargement (`SkeletonRow`), vide, erreur, sections *À venir* / *Passées*, bandeau de promotion, désinscription optimiste avec modale de confirmation et rollback, toast et export calendrier `.ics`.
- **Espace organisateur — Écrans `07`, `08`, `09` et `10` (`#18`, `#19`)** :
  - **`07 · Mes événements`** (`/me/events` — `US05`, `US06`, `US08`, `US26`) et **`10 · Tableau de bord organisateur`** (`/dashboard` — `US27`, navigation organisateur `US04`) avec filtres URL, pagination, indicateurs KPI et actions organisateur (`publish`, `cancel`, `duplicate`).
  - **`08 · Créer / modifier un événement`** (`/admin/events/new`, `/admin/events/[id]/edit` — `US05`, `US07`) : validation client, règle `R6`, blocage d'édition sur événement annulé et aperçu en direct de la carte.
  - **`09 · Inscrits d'un événement`** (`/admin/events/[id]/registrations` — `US15`, `US23`) : KPIs de remplissage, tableau paginé dans l'URL, états vide / `403` / chargement et export CSV protégé contre l'injection de formules (`src/i18n/csv.ts`).
  - *Note : les écrans `08` et `09` s'appuient sur des données de démo locales (`src/mocks/organizerDemo.ts`) en attendant les endpoints Back `E4`/`E5`/`US15`.*
- **Design System, refactoring & identité (`#14`, `#18`, `#19`, `#21`)** :
  - Nouvelles primitives UI documentées dans Storybook : `ActionList`, `CapacityMeter`, `DataTable`, `PageHeader`, `StatCard`, `Textarea`.
  - Évolutions rétrocompatibles des primitives existantes : `Button` polymorphe (`href`), `EmptyState` (`tone="danger"`, `actionIcon`), `Pagination` (`summary`), `Navbar` filtrée `ORGANIZER`, affinements `Alert`, `Avatar`, `Badge`, `Input`, `Select`, `EventCard`.
  - Unification de toutes les icônes dans `src/components/ui/Icon.tsx` avec règle ESLint `no-restricted-imports` interdisant les imports directs de `lucide-react` (`#14`).
  - Mise à jour du titre applicatif (`front/src/app/layout.tsx`) et du `PRODID` iCalendar (`front/src/i18n/calendar.ts`) vers **Ynov Connect** (`#21`).
- **Contrat API, mocks & tests** :
  - Enrichissement de `front/openapi.contract.yaml` (`+456` lignes), régénération des types (`src/api/generated/schema.d.ts`), ajout des opérations dans `src/api/client.ts`, mise à jour des fixtures/handlers MSW et ajout de 6 suites de tests (`LoginForm`, `MyRegistrationsPage`, `MyEventsPage`, `OrganizerDashboardPage`, `EventFormView`, `RegistrantsView`).

### 2.3 CI / Outillage & hygiène du dépôt
- **Pipeline d'audit RGAA & SEO (`#22`, `#23`)** :
  - Ajout du job `Rapport RGAA & SEO` dans `.github/workflows/front-ci.yml` : démarrage de la stack Docker (`db`, `back`, `prism`), build & démarrage du front en production, audit d'accessibilité automatique `axe-core` (tags `RGAAv4`), audit SEO Lighthouse, et contrôles complémentaires (`robots.txt`, `sitemap.xml`, favicon, URL canonique, balises `og:title` / `og:description` / `og:image`).
  - Génération d'une synthèse Markdown dans le *Job Summary* GitHub Actions et conservation des artefacts pendant 30 jours *(non bloquant pour les alertes d'audit)*.
- **Hygiène du dépôt (`#22`)** : ajout d'un `.gitignore` à la racine et suppression du dossier `.idea/` du suivi Git.
- **Gouvernance Git** : branche par défaut basculée sur `develop` (règle de revue obligatoire sur `develop` et `main`) ; déploiement GitHub Pages de Storybook déclenché automatiquement au merge sur `main`.

### 2.4 Documentation (`doc/`, `README.md`)
- Ajout de l'**ADR 0001** (`doc/adr/0001-architecture-et-stack-technique.md`, format Michael Nygard, statut *Accepté*) formalisant le monorepo contract-first et les choix techniques (`#17`).
- Ajout des comptes rendus quotidiens du **25/11/2026** (`doc/2026-11-25_daily-report.md`, `#11`) et du **26/11/2026** (`doc/2026-11-26_daily-report.md`, `#20`).
- Ajout du lien vers la maquette Figma dans le `README.md` (`#11`).

---

## 3. Historique des Pull Requests intégrées dans la PR #24

| PR | Date de merge | Auteur | Branche → Cible | Résumé | Tickets Jira |
|---|---|---|---|---|---|
| **#6** | 25/11/2026 | Soukina | `feature/souki-backend` → `develop` | Workflow CI Back (`.github/workflows/back-ci.yml`) sur PostgreSQL 18 | `SCRUM-20` |
| **#8** | 25/11/2026 | Pierre | `main` → `develop` | Resynchronisation de la PR `#7` (`Modal`, `SkeletonRow`, `Toast`, `CalendarChip`, `EmptyState`, `Button`) | `SCRUM-93` |
| **#9** | 25/11/2026 | Loïc Rabault | `feature/front` → `develop` | Écrans `02 · Inscription` et `03 · Connexion` (`AuthLayout`, `LoginForm`, `safe-redirect.ts`, 13 tests) | `SCRUM-23`, `SCRUM-25` |
| **#10** | 25/11/2026 | Axel | `feat/auth` → `develop` | Endpoint initial `POST /api/auth/register` (`bcrypt`, Zod, `409 EMAIL_ALREADY_USED`) | `SCRUM-22` |
| **#11** | 25/11/2026 | Pierre | `docs/daily-report-2026-11-25` → `develop` | Compte rendu du 25/11/2026 et lien Figma dans `README.md` | — |
| **#14** | 25/11/2026 | Pierre | `refactor/ui-icon-registry` → `develop` | Registre d'icônes centralisé `ui/Icon.tsx` + règle ESLint anti-`lucide-react` | `SCRUM-94` |
| **#13** | 25/11/2026 | Pierre | `feature/my-registrations-ui` → `develop` | Écran `06 · Mes inscriptions` (`/me/registrations`), annulation optimiste, export `.ics` *(remplace doublon `#12`)* | `SCRUM-43`, `SCRUM-46`, `SCRUM-48`, `SCRUM-73` |
| **#15** | 26/11/2026 | Axel | `feat/login` → `develop` | Endpoint `POST /api/auth/login` (`jose` JWT HS256) et alignement `register` sur v0.1 (`min(12)`, `422`, `{ data }`) | `SCRUM-24` |
| **#18** | 26/11/2026 | Pierre | `feat-organizer-screens` → `develop` | Écrans `07 · Mes événements` et `10 · Tableau de bord`, primitives DS (`DataTable`, `StatCard`, `PageHeader`, `CapacityMeter`, `ActionList`), mocks & tests | `SCRUM-29`, `SCRUM-31` *(volet 07)*, `SCRUM-33`, `SCRUM-37`, `SCRUM-69`, `SCRUM-71` |
| **#16** | 26/11/2026 | Soukina | `feature/create-an-account` → `develop` | Finalisation Auth Back (`requireAuth`, `GET /api/me`, codes champ normalisés) et documentation `back/openapi.yaml` | `SCRUM-22`, `SCRUM-95` |
| **#19** | 26/11/2026 | Loïc Rabault | `feature/front-event-form-registrants` → `develop` | Écrans `08 · Formulaire événement` et `09 · Inscrits` (+ export CSV sécurisé, `Textarea`, passage à 62 tests) | `SCRUM-31`, `SCRUM-35` *(+ `SCRUM-50`, `SCRUM-64` hors sprint)* |
| **#17** | 26/11/2026 | Ismail | `docs/adr-architecture-stack` → `develop` | `ADR 0001` — Architecture et stack technique d'EventHub | Transverse |
| **#20** | 27/11/2026 | Pierre | `docs/daily-report-2026-11-26` → `develop` | Compte rendu du 26/11/2026 | — |
| **#21** | 27/11/2026 | Pierre | `fix/Title` → `develop` | Mise à jour du titre applicatif et du `PRODID` iCalendar vers **Ynov Connect** | — |
| **#22** | 27/11/2026 | Axel | `feat/front-ci-rgaa-seo` → `develop` | Job CI `Rapport RGAA & SEO`, `.gitignore` racine et retrait de `.idea/` | Transverse |
| **#23** | 27/11/2026 | Axel | `fix/pipeline-rgaa-seo` → `develop` | Contrôles complémentaires CI : `robots.txt`, `sitemap.xml`, favicon, URL canonique et balises Open Graph | Transverse |

---

## 4. Vérifications CI & Audit Qualité (PR #24)

### 4.1 Résultats des workflows GitHub Actions sur la PR #24

| Workflow / Job | Statut | Durée | Détail |
|---|---|---|---|
| **Back CI** — `Lint, Typecheck, Build & Migrations` | **Vert (`pass`)** | 37 s | `prisma:generate`, `lint`, `typecheck`, `build`, `db:deploy` et `db:seed` sur PostgreSQL 18 éphémère |
| **Front CI & Storybook** — `Lint, Typecheck, Tests & Build` | **Vert (`pass`)** | 1 min 28 s | `api:generate`, `lint` (0 erreur), `typecheck` (0 erreur), **11 fichiers / 62 tests Vitest + `axe-core`**, `next build`, `build-storybook` (46 fichiers `.stories.tsx`) |
| **Front CI & Storybook** — `Rapport RGAA & SEO` | **Vert (`pass`)** | 3 min 03 s | Démarrage Docker (`db`, `back`, `prism`), build prod Front, `axe-core` (`RGAAv4`), Lighthouse SEO, contrôles partage & publication de l'artefact `rapport-rgaa-seo` |
| **Front CI & Storybook** — `Publish Storybook on GitHub Pages` | **Ignoré sur PR** | — | Déclenchement automatique configuré au merge sur `main` (`github.ref == 'refs/heads/main'`) |

### 4.2 Synthèse de l'audit automatisé RGAA & SEO (commit `7a8270c`)

Exécuté sur la page d'entrée `/` (redirigée vers `/events`) par le nouveau job CI :
- **RGAA (`axe-core`, tags `RGAAv4`)** : **0 règle en échec**, **25 règles réussies**, **1 point à vérifier manuellement** (critère `3.2.1` — ratio de contraste sur 1 élément). *Un audit RGAA manuel reste nécessaire pour établir un taux de conformité officiel.*
- **SEO (Lighthouse)** : score de **100/100**.
- **Contrôles complémentaires (SEO & partage)** : `robots.txt` (`404`), déclaration de sitemap (`absent`), `/sitemap.xml` (`404`), `/favicon.ico` (`404`), URL canonique (`absente`), `og:title` / `og:description` / `og:image` (`absents`). Ces constats ont immédiatement été transformés en 5 tickets Jira (`SCRUM-96`, `SCRUM-98` à `SCRUM-101`).

---

## 5. Bilan Jira (`SCRUM Sprint 1`)

État du tableau Jira au 27/11/2026 (**30 tickets** dans `SCRUM Sprint 1`) :

| Statut Jira | Nombre | Tickets | Commentaire |
|---|---|---|---|
| **Terminé** | **21** | `SCRUM-20`, `SCRUM-21`, `SCRUM-22`, `SCRUM-23`, `SCRUM-24`, `SCRUM-25`, `SCRUM-29`, `SCRUM-33`, `SCRUM-37`, `SCRUM-39`, `SCRUM-43`, `SCRUM-46`, `SCRUM-48`, `SCRUM-56`, `SCRUM-69`, `SCRUM-71`, `SCRUM-73`, `SCRUM-81`, `SCRUM-93`, `SCRUM-94`, `SCRUM-95` | Intégralement livrés et intégrés dans la PR `#24` (ou sur `main` en début de sprint). |
| **En cours** | **1** | `SCRUM-30` (`[BE] US05 - Créer un événement et lister mes événements`, Soukina) | Travail Back en cours ; à livrer en priorité au démarrage du Sprint 2. |
| **À faire — Front déjà livré** | **2** | `SCRUM-31` (`[FE] US05`, Loïc), `SCRUM-35` (`[FE] US07`, Loïc) | Écrans `07` et `08` livrés dans `#18` et `#19` (avec données de démo en attendant le Back) : **prêts à passer en `Terminé`** (ou à découper avec une tâche de branchement API Sprint 2). |
| **À faire — Back à reporter** | **1** | `SCRUM-34` (`[BE] US07 - Modifier un événement`, Soukina) | À reporter au Sprint 2 dans la continuité de `SCRUM-30`. |
| **À faire — SEO / Partage (27/11)** | **5** | `SCRUM-96` (favicon, Axel), `SCRUM-98` (sitemap.xml, Axel), `SCRUM-99` (robots.txt), `SCRUM-100` (URL canonique), `SCRUM-101` (Open Graph) | Créés ce matin à la suite du premier rapport du job CI `Rapport RGAA & SEO` (`#22`/`#23`) ; à planifier en Sprint 2. |

---

## 6. Écarts de contrat, dettes techniques & priorités Sprint 2

### 6.1 Suivi des écarts Front/Back

| # | Sujet | Statut fin Sprint 1 | Action Sprint 2 |
|---|---|---|---|
| **C1** | Mot de passe `min(8)` vs `min(12)` | **Résolu** (`#15`, `#16`) | Aligné sur 12 caractères min / 72 octets max. |
| **C2** | Validation `400` vs `422` et codes champ Zod | **Résolu** (`#15`, `#16`) | `422 VALIDATION_FAILED` avec codes normalisés du contrat. |
| **C3** | Enveloppe `{ data }` & documentation Auth dans `back/openapi.yaml` | **Résolu** (`#15`, `#16`) | Enveloppe harmonisée et 3 routes Auth documentées (`SCRUM-95`). |
| **C4** | Branchement Front Auth sur le Back réel | **Ouvert (débloqué)** | Basculer `/api/auth/*` et `/api/me` de Prism vers `API_EVENTS_BASE` dans `front/next.config.ts` et brancher `LoginForm` + restauration `GET /api/me` dans `auth-context.tsx`. |
| **C5** | Mots de passe du seed Back factices | **Ouvert** | Générer de vrais hashs `bcrypt` dans `back/prisma/seed.ts` pour permettre la connexion des comptes de démo (`ada@example.com`, `grace@example.com`). |
| **C6** | Contrôle de rôle `403 FORBIDDEN` & visibilité `DRAFT` sur `GET /events/{id}` | **Ouvert** | Ajouter le middleware de rôle `ORGANIZER` (`US03`) et la lecture optionnelle du JWT sur `GET /events/{id}` avec `SCRUM-30` / `SCRUM-26`. |
| **C7** | Format d'erreur RFC 9457 dans `api-contract-v0.md` §5 | **Ouvert** | Mettre à jour `api-contract-v0.md` §5 pour acter officiellement `errors[]` (RFC 9457) déjà implémenté des deux côtés. |
| **C8** | Navigation organisateur responsive (`11 · Mobile`) | **Ouvert** | Implémenter le menu mobile / burger pour éviter le débordement des 4 entrées organisateur sur mobile/tablette. |

### 6.2 Dettes techniques identifiées
- **Tests automatisés Back-end** : les endpoints `events` et `auth` ont été vérifiés par lint/typecheck/migrations CI et tests manuels `curl` ; mettre en place une suite de tests automatisés dans `back/` (ex. Vitest + Supertest) exécutée dans `back-ci.yml`.
- **Unification OpenAPI** : maintenir la synchronisation entre `back/openapi.yaml` et `front/openapi.contract.yaml` (risque relevé dans l'`ADR 0001`), puis converger vers une source OpenAPI unique à mesure que le Back couvre les endpoints.
- **Endpoints encore mockés** : le Front consomme le Back réel pour `GET /api/events` et `GET /api/events/{id}`, Prism pour `/api/auth/*`, `/api/me/*` et les mutations d'inscription/événement, et `organizerDemo.ts` pour les écrans `08` et `09`.

### 6.3 Actions immédiates & priorités d'ouverture du Sprint 2
1. **Finaliser la release Sprint 1** : faire relire et **merger la PR `#24` (`develop` → `main`)** afin de déclencher la publication automatique du Storybook complet (écrans `01` à `10` + Design System) sur GitHub Pages, puis clôturer le sprint sur Jira (`SCRUM-31` et `SCRUM-35` à mettre à jour).
2. **Brancher l'authentification de bout en bout (`C4`, `C5`)** : corriger les hashs `bcrypt` du seed Back et connecter `/register`, `/login` et `GET /api/me` au Back réel.
3. **Livrer les endpoints Back organisateur et participant** : terminer `SCRUM-30` (`POST /events`, `GET /me/events`), `SCRUM-34` (`PATCH /events/{id}`), le middleware de rôle (`C6`), puis les inscriptions (`US11`–`US15`) afin de retirer progressivement les mocks Prism et `organizerDemo.ts`.
4. **Traiter les améliorations qualité & SEO** : implémenter les 5 tickets SEO/partage (`SCRUM-96`, `SCRUM-98`–`SCRUM-101`), vérifier le contraste `3.2.1` relevé par `axe-core`, implémenter le responsive organisateur (`C8`) et introduire les tests automatisés Back.
