# Compte rendu du jour : Sprint 1 — CI Back, Design System, Écrans Auth et endpoint d'inscription

**Date** : 25/11/2026 · **Branche de référence** : `develop` (`74a4d40`) · **Sprint** : `SCRUM Sprint 1` (23–27 nov. 2026)

---

## 1. Livré aujourd'hui (PR mergées)

| PR | Auteur | Branche → Cible | Contenu livré | Ticket Jira |
|---|---|---|---|---|
| **#6** | Soukina | `feature/souki-backend` → `develop` | Ajout du workflow de CI Back (`.github/workflows/back-ci.yml`) et mise à jour de `README.md`. | `SCRUM-20` *(Terminé)* |
| **#7** & **#8** | Pierre | `feature/ui-primitives` → `main`, puis resynchro `main` → `develop` | Enrichissement du Design System (`Modal`, `SkeletonRow`, `Toast` + stories Storybook), évolutions rétrocompatibles (`Button` en `forwardRef`, `CalendarChip` `tone`/`size`, `EmptyState` `actionHref`), stratégie `retry` TanStack Query dans `Providers`, helpers `i18n` (`CalendarEventInput`, `formatOrdinalFr`), bind-mount de `front/next.config.ts` dans `compose.yaml`. | `SCRUM-93` *(Terminé)* |
| **#9** | Loïc Rabault | `feature/front` → `develop` | Écrans **`02 · Créer un compte`** (`/register`) et **`03 · Se connecter`** (`/login`) alignés sur les maquettes Figma : `AuthLayout`, `LoginForm`, `safe-redirect.ts`, composant `Icon` + 7 icônes SVG Figma, affinements `Alert`/`Button`/`Input`/`Navbar`/`Footer`/`StrengthMeter`, 13 tests unitaires + accessibilité dans `LoginForm.test.tsx`. Connexion simulée sur la session démo en attendant `POST /api/auth/login`. | `SCRUM-23`, `SCRUM-25` *(En cours)* |
| **#10** | Axel | `feat/auth` → `develop` | Ajout du module Back d'inscription utilisateur `POST /api/auth/register` (`back/src/modules/auth/*`, hash `bcrypt` coût 12, gestion de doublon `409 EMAIL_ALREADY_USED`, documentation `back/README.md`). | `SCRUM-22` *(voir §5 sur `SCRUM-24`)* |

### Travaux en cours hors `develop`
- **Branche locale `feature/my-registrations-ui`** (`ed3380b`, Pierre — non poussée) :
  - Implémentation complète de l'écran **`06 · Mes inscriptions`** (`/me/registrations`) avec mock Prism (`GET /me/registrations`, `DELETE /events/{id}/registrations/me`), `RegistrationRow`, `MyRegistrationsView`, `MyRegistrationsPage`, mise à jour optimiste + rollback, export `.ics`, bandeau de promotion, modale de confirmation, toast, stories Storybook et 5 tests Vitest + `axe-core`.
  - Volontairement découpée des primitives UI (`PR #7`/`#8`) et conservée en local pour ne pas empiéter sur le périmètre d'un autre développeur avant synchronisation d'équipe.

---

## 2. Coordination Git, Workflow & Jira

- **Découpage propre des PR front** : séparation du socle UI transverse (`feature/ui-primitives`) et des écrans métier afin que toute l'équipe puisse réutiliser `Modal`, `Toast`, `SkeletonRow` et `CalendarChip` sans conflit sur `develop`.
- **Resynchronisation `main` ↔ `develop`** : la PR `#7` ayant été mergée directement sur `main`, la PR `#8` (`main` → `develop`, merge commit `60718ea`) a réaligné `develop` avec `main` tout en conservant l'historique commun.
- **Mise à jour du tableau Jira (`SCRUM Sprint 1`)** :
  - **Terminé** : `SCRUM-20` (Soukina), `SCRUM-21` (Pierre), `SCRUM-24` (Axel), `SCRUM-39` (Pierre), `SCRUM-56` (Pierre), `SCRUM-93` (Pierre — créé et clôturé aujourd'hui).
  - **En cours de revue** : `SCRUM-43` (Pierre), `SCRUM-81` (Ismail).
  - **En cours** : `SCRUM-23` et `SCRUM-25` (attribués aujourd'hui à Loïc Rabault).

---

## 3. Vérifications effectuées (sur `develop` `74a4d40`)

| Vérification | Résultat |
|---|---|
| `front` — `npm run lint` (ESLint + `jsx-a11y` + règle anti-`fetch`) | **0 erreur, 0 avertissement** |
| `front` — `npm run typecheck` (`next typegen && tsc --noEmit`) | **0 erreur** |
| `front` — `npm test` (Vitest + Testing Library + `axe-core`) | **6 fichiers, 36 tests passés** *(dont 13 nouveaux tests `LoginForm`)* |
| `feature/ui-primitives` (avant merge PR `#7`/`#8`) | `lint`, `typecheck`, 23 tests, `next build` et `build-storybook` **tous verts** |
| Stack Docker dev (`db`, `back`, `prism`, `front`, `storybook`) | Conteneurs recréés et vérifiés en `200` (`:3001`, `:4010`, `:6006`) |

---

## 4. Écarts de contrat Front/Back constatés (à aligner avant branchement réel Auth)

L'arrivée de `POST /api/auth/register` côté Back (`PR #10`) et des écrans Auth côté Front (`PR #9`) met en évidence quelques écarts à aligner avant de basculer `/api/auth/*` de Prism vers le Back réel :

| # | Écart constaté | Détail | Action recommandée |
|---|---|---|---|
| **C1** | **Longueur minimale du mot de passe (`US01`)** | `back/src/modules/auth/auth.schema.ts` valide `min(8)` alors que le contrat et le Front (`AccountRegistrationForm`) exigent **12 caractères minimum**. | Passer `registerSchema.password` à `.min(12)` côté Back. |
| **C2** | **Code HTTP de validation** | `ValidationError` (`back/src/errors/app-error.ts`) renvoie `400 VALIDATION_FAILED`, tandis que le contrat OpenAPI Front attend `422 VALIDATION_FAILED`. | Trancher `400` vs `422` dans le contrat partagé et aligner Back + Front (`openapi.yaml` / `AccountRegistrationForm`). |
| **C3** | **Format de réponse `201` de `/api/auth/register`** | `AuthController.register` retourne `{ id, email, displayName, role }` à plat (sans `createdAt`), alors que `front/openapi.contract.yaml` décrit `{ data: { id, email, displayName, role, createdAt } }`. | Harmoniser l'enveloppe (`{ data }` vs plat) et ajouter `POST /auth/register` dans `back/openapi.yaml`. |
| **C4** | **Proxy `/api/auth/*` encore sur Prism** | `front/next.config.ts` pointe `/api/auth/:path*` vers `API_MOCK_BASE` (Prism) et l'écran `/login` utilise encore la session démo en attendant `POST /api/auth/login` (`US02`). | Implémenter `POST /api/auth/login` + `GET /api/me` côté Back, puis basculer le proxy `/api/auth/*` sur `API_EVENTS_BASE`. |

---

## 5. Points ouverts & prochaines étapes

- **Synchronisation Jira** :
  - Vérifier `SCRUM-24` (`[BE] US02 - Se connecter`, marqué `Terminé`) vs `SCRUM-22` (`[BE] US01 - Créer un compte`, encore en `À faire` au backlog alors que la PR `#10` implémente `POST /api/auth/register`).
  - Statuer en équipe sur l'attribution de l'écran `06 · Mes inscriptions` (`SCRUM-48` / `SCRUM-46`) afin de décider du sort de la branche locale `feature/my-registrations-ui`.
- **Hygiène du dépôt** : retirer le dossier `.idea/` commité dans la PR `#10` et l'ajouter au `.gitignore` racine.
- **Environnement dev Windows** : un verrou transitoire sur `.git/HEAD` a parfois interrompu `git checkout` en cours de bascule ; relancer la commande ou `git symbolic-ref HEAD refs/heads/<branche>` après 2 s règle le blocage sans perte.
- **Prochaines priorités Sprint 1** :
  1. Aligner le contrat `POST /api/auth/register` (`C1`–`C3`) et livrer `POST /api/auth/login` + `GET /api/me` côté Back (`US02`).
  2. Brancher les écrans `/register` et `/login` (`SCRUM-23`, `SCRUM-25`) sur le Back réel.
  3. Ouvrir la mise en prod `develop` → `main` une fois la chaîne Auth validée.
