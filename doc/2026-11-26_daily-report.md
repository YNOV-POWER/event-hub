# Compte rendu du jour : Sprint 1 — Chaîne Auth Back, Écrans Organisateur (07 à 10) et ADR 0001

**Date** : 26/11/2026 · **Branche de référence** : `develop` (`c8e80a7`) · **Sprint** : `SCRUM Sprint 1` (23–27 nov. 2026)

---

## 1. Livré aujourd'hui (PR mergées le 26/11)

| PR | Auteur | Branche → Cible | Contenu livré | Ticket Jira |
|---|---|---|---|---|
| **#15** | Axel | `feat/login` → `develop` | Implémentation de `POST /api/auth/login` (`jose` JWT HS256, `JWT_SECRET` dans `env.ts` et `compose.yaml`), réalignement de `POST /api/auth/register` sur le contrat v0.1 (mot de passe ≥ 12 caractères, `422 VALIDATION_FAILED`, enveloppe `{ data }`, `parse-body.ts`) et mise à jour de `back/README.md`. | `SCRUM-24` *(Terminé)* |
| **#18** | Pierre | `feat-organizer-screens` → `develop` | Navigation organisateur (**US04**) et écrans **`07 · Mes événements`** (`/me/events` — US05, US06, US08, US26) et **`10 · Tableau de bord organisateur`** (`/dashboard` — US27) alignés sur Figma ; enrichissement rétrocompatible du Design System (`StatCard`, `PageHeader`, `DataTable`, `CapacityMeter`, `ActionList`, `Button` polymorphe `href`, `Pagination` `summary`, `EmptyState` `actionIcon`, `Navbar` filtrée `ORGANIZER`, `Icon` registry + migration `MyRegistrationsView`/`RegistrationRow`) ; contrat OpenAPI / client typé / mocks Prism & MSW (`GET /me/events`, `POST /events/{id}/publish|cancel|duplicate`) ; 51 tests Vitest + `axe-core` et Storybook mis à jour. | `SCRUM-29`, `SCRUM-33`, `SCRUM-37`, `SCRUM-69`, `SCRUM-71` *(Terminé)*, `SCRUM-31` *(volet 07)* |
| **#16** | Soukina | `feature/create-an-account` → `develop` | Finalisation complète de l'Auth Back conforme au contrat v0.1 : codes d'erreur par champ normalisés (`MIN_LENGTH`, `MAX_LENGTH`, `INVALID_FORMAT`, `INVALID_TYPE`, `UNKNOWN_FIELD`, limite 72 octets `bcrypt`), middleware réutilisable `requireAuth` (`Authorization: Bearer`, HS256, `sub`/`exp`, en-tête `WWW-Authenticate: Bearer`), endpoint **`GET /api/me`** (`A3`, relu en base), et documentation complète des routes Auth dans `back/openapi.yaml` (+371 lignes). | `SCRUM-22`, `SCRUM-95` *(Terminé)* |
| **#19** | Loïc Rabault | `feature/front-event-form-registrants` → `develop` | Écrans **`08 · Créer / modifier un événement`** (`/admin/events/new`, `/admin/events/{id}/edit` — US05, US07 : validation client, règle R6, édition désactivée si annulé, aperçu live de la carte) et **`09 · Inscrits d'un événement`** (`/admin/events/{id}/registrations` — US15, US23 : KPIs, tableau paginé dans l'URL, export CSV protégé contre l'injection de formules `i18n/csv.ts`, états vide/403/chargement) ; ajout de `Textarea`, alignement Figma des primitives partagées (`StatCard`, `DataTable`, `EmptyState` `tone="danger"`, `Badge`, `Avatar`, `Select`, `PageHeader`, `EventCard`) et passage à **62 tests Vitest + `axe-core`** *(données de démo locales `organizerDemo.ts` en attendant E4/E5/US15 côté Back)*. | `SCRUM-31`, `SCRUM-35` *(à passer Terminé)*, `SCRUM-50`, `SCRUM-64` *(hors sprint)* |
| **#17** | Ismail | `docs/adr-architecture-stack` → `develop` | Ajout du premier ADR du projet (`doc/adr/0001-architecture-et-stack-technique.md`, format Michael Nygard, statut Accepté) formalisant le monorepo contract-first, la stack Express 5 / PostgreSQL 18 / Prisma 7 / Next.js 16 / Storybook 10 et la gouvernance Docker/CI. | Transverse (`E0` / `E8`) |

### Complément post-CR du 25/11 (mergés le 25/11 après-midi)
Pour mémoire, entre la publication du précédent CR (`74a4d40`) et ce matin, 3 PR ont également été mergées sur `develop` :
- **PR #11** (`docs/daily-report-2026-11-25`, Pierre) : ajout du CR du 25/11 et lien Figma dans `README.md`.
- **PR #14** (`refactor/ui-icon-registry`, Pierre — `SCRUM-94`) : unification de toutes les icônes dans `ui/Icon.tsx` avec règle ESLint `no-restricted-imports` sur `lucide-react`.
- **PR #13** (`feature/my-registrations-ui`, Pierre — `SCRUM-43`, `SCRUM-46`, `SCRUM-48`, `SCRUM-73`) : livraison de l'écran **`06 · Mes inscriptions`** (`/me/registrations`).

> **Jalon atteint** : les **10 écrans desktop Figma** (`01` à `10`) sont désormais tous implémentés côté Front et documentés dans Storybook, sans conflit de merge grâce au découpage propre des routes (`#18` sur 07/10 et `#19` sur 08/09).

---

## 2. Coordination Git, Workflow & Jira

- **Branche par défaut GitHub corrigée** : la branche par défaut du dépôt `YNOV-POWER/event-hub` a été basculée de `main` vers **`develop`** afin que toutes les nouvelles PR ciblent `develop` par défaut (évitant les doublons vers `main` comme la PR `#12` fermée le 25/11). La publication GitHub Pages de Storybook (`front-ci.yml`) reste strictement conditionnée à `refs/heads/main`.
- **Mise à jour du tableau Jira (`SCRUM Sprint 1`)** :
  - **Terminé (21 tickets dans le sprint)** : `SCRUM-20` (Soukina), `SCRUM-21` (Pierre), `SCRUM-22` (Soukina), `SCRUM-23` (Loïc), `SCRUM-24` (Axel), `SCRUM-25` (Loïc), `SCRUM-29` (Pierre), `SCRUM-33` (Pierre), `SCRUM-37` (Pierre), `SCRUM-39` (Pierre), `SCRUM-43` (Pierre), `SCRUM-46` (Pierre), `SCRUM-48` (Pierre), `SCRUM-56` (Pierre), `SCRUM-69` (Pierre), `SCRUM-71` (Pierre), `SCRUM-73` (Pierre), `SCRUM-81` (Ismail), `SCRUM-93` (Pierre), `SCRUM-94` (Pierre), `SCRUM-95` (Soukina).
  - **En cours** : `SCRUM-30` (`[BE] US05 - Créer un événement et lister mes événements`, Soukina).
  - **À faire (dans le sprint)** : `SCRUM-34` (`[BE] US07 - Modifier un événement`, Soukina), `SCRUM-31` & `SCRUM-35` (assignés à Loïc — **prêts à passer en `Terminé` suite au merge de la PR `#19`**).

---

## 3. Vérifications effectuées (CI GitHub Actions & local)

| Vérification | Résultat |
|---|---|
| `Back CI` sur `develop` (PR `#15` et `#16` — `lint`, `typecheck`, `build`, `prisma migrate deploy`, `db:seed`) | **Vert** (2/2 runs sur `develop` en `success`) |
| `Front CI & Storybook` sur PR `#18` (`lint`, `typecheck`, `51` tests + `axe-core`, `next build`, `build-storybook`) | **Vert** (`success`) |
| `Front CI & Storybook` sur PR `#19` (`lint`, `typecheck`, `62` tests + `axe-core`, `next build`, `build-storybook`, comparaison pixel Figma ~1 %) | **Vert** (`success`) |
| Note CI PR `#16` | Un premier run `Front CI` avait échoué avant resynchro (règle `lucide-react` dans `MyRegistrationsView`/`RegistrationRow`, résolue par la PR `#18`), tandis que `Back CI` était vert sur les deux commits. |
| Stack Docker dev (`db`, `back`, `prism`, `front`, `storybook`) | Reconstruite après PR `#15` / `#18` : `:3000`, `:4010`, `:3001` (`/me/events`, `/dashboard`, `/api/me/events`) et `:6006` tous vérifiés en `200` *(à reconstruire côté `back` pour embarquer `bcrypt`, `jose` et `GET /api/me`)*. |

---

## 4. Suivi des écarts de contrat Front/Back & nouveaux points d'alignement

### Résolution des écarts du 25/11 (`C1`–`C4`)

| # | Écart du 25/11 | Statut au 26/11 | Détail |
|---|---|---|---|
| **C1** | Mot de passe `min(8)` au lieu de `min(12)` | **Résolu** (`#15`, `#16`) | Validation passée à `12` caractères min (et max `72` octets bcrypt) avec code `MIN_LENGTH` / `MAX_LENGTH`. |
| **C2** | Validation en `400` au lieu de `422` et codes Zod bruts | **Résolu** (`#15`, `#16`) | Renvoie `422 VALIDATION_FAILED` avec codes champ du contrat (`MIN_LENGTH`, `MAX_LENGTH`, `INVALID_FORMAT`, `INVALID_TYPE`, `UNKNOWN_FIELD`). |
| **C3** | Enveloppe `{ data }` & absence d'Auth dans `back/openapi.yaml` | **Résolu** (`#15`, `#16`) | Enveloppe `{ data }` alignée et 3 routes Auth (`register`, `login`, `me`) documentées dans `back/openapi.yaml` (`SCRUM-95`). |
| **C4** | Proxy `/api/auth/*` et `/api/me` encore sur Prism + session démo Front | **Ouvert (débloqué)** | Le Back expose désormais `A1`, `A2` et `A3` : il reste à basculer `front/next.config.ts` sur `API_EVENTS_BASE` et brancher `LoginForm` + restauration `GET /api/me` dans `auth-context.tsx`. |

### Nouveaux points d'alignement relevés aujourd'hui

| # | Point identifié | Détail | Action recommandée |
|---|---|---|---|
| **C5** | **Seed Back inutilisable pour le login réel** | Comme signalé dans la PR `#16`, les comptes seedés dans `back/prisma/seed.ts` ont un `password_hash` factice : aucun compte `ORGANIZER` (ex. Grace) ne peut encore se connecter contre le Back réel. | Générer un vrai hash `bcrypt` de dev dans `back/prisma/seed.ts` pour `ada@example.com` et `grace@example.com`. |
| **C6** | **Contrôle de rôle `403` & `DRAFT` sur `GET /events/{id}`** | `requireAuth` (`401`) est livré (`#16`), mais le middleware de rôle (`403 FORBIDDEN`, `US03`) et la lecture optionnelle du JWT sur `GET /events/{id}` (pour exposer un `DRAFT` à son propriétaire) restent à implémenter. | Livrer le middleware de rôle avec `SCRUM-30` (`POST /events`, `GET /me/events`) et `SCRUM-26`. |
| **C7** | **Format d'erreur `errors[]` (RFC 9457) vs `error.details[]` (§5)** | Back et Front implémentent tous deux RFC 9457 (`errors[]`), mais le document `api-contract-v0.md` §5 mentionne encore l'ancien format `error.details[]`. | Acter officiellement RFC 9457 dans `api-contract-v0.md` (aligné avec `SCRUM-78` et `ADR 0001`). |
| **C8** | **Navigation organisateur responsive (maquette `11 · Mobile`)** | Relevé dans la PR `#19` : en rôle `ORGANIZER`, la barre de navigation (4 entrées) déborde sur mobile et tablette. | Implémenter la navigation mobile / menu burger de la maquette `11 · Mobile`. |

---

## 5. Points ouverts & prochaines étapes

- **Synchronisation Jira** :
  - Passer `SCRUM-31` (`[FE] US05`) et `SCRUM-35` (`[FE] US07`) en **`Terminé`** suite au merge des PR `#18` + `#19` (et mettre à jour `SCRUM-50` / `SCRUM-64` pour l'écran `09 · Inscrits`).
- **Tests automatisés Back** : la PR `#16` a été validée manuellement via `curl` ; mettre en place un framework de tests automatisés dans `back/` (ex. Vitest + Supertest) pour couvrir `US01`–`US08` en CI.
- **Hygiène du dépôt** : `.idea/` reste présent à la racine (à retirer et ajouter au `.gitignore`).
- **Prochaines priorités de fin de Sprint 1 (vendredi 27/11)** :
  1. Corriger les mots de passe du seed Back (`C5`) et brancher le Front (`/register`, `/login`, `GET /me`, `Authorization: Bearer`) sur le Back réel (`C4`).
  2. Livrer les endpoints Back organisateur `SCRUM-30` (`POST /events`, `GET /me/events`) et `SCRUM-34` (`PATCH /events/{id}`) avec contrôle de rôle `ORGANIZER` (`C6`), puis relier les hooks Front de la PR `#19` (`useOrganizerEvent.ts` / `useSaveEvent.ts`) à l'API réelle.
  3. Préparer la PR de release **`develop` → `main`** pour publier le Storybook complet (écrans `01` à `10` + Design System) sur GitHub Pages.
