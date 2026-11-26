# 1. Architecture et stack technique d'EventHub

Date : 2026-11-26
Statut : Accepté

Sources : [SCRUM-19](https://ynov-eventhub.atlassian.net/browse/SCRUM-19) (S1, contrat OpenAPI), SCRUM-20 et SCRUM-21 (CI back et front), SCRUM-76 (socle Express dockerisé), SCRUM-77 (modèle de données), SCRUM-78 (erreurs RFC 9457), `doc/2026-11-20_backend-init-report.md`, `doc/2026-11-23_front-atelier-6-report.md`

## Contexte

EventHub est une plateforme de publication d'événements et d'inscription, développée comme projet fil rouge du M2 Full Stack. Le backlog Jira (épiques E0 à E8, lots 0 à 5) fixe le périmètre suivant : authentification et rôles `PARTICIPANT` / `ORGANIZER`, cycle de vie d'un événement (`DRAFT` → `PUBLISHED` → `CANCELLED`), catalogue public paginé, inscriptions à capacité limitée, liste d'attente FIFO et promotion automatique.

Contraintes :

- **Deux équipes en parallèle** (front et back) : le front doit avancer avant que les endpoints back existent. Par exemple, les écrans d'inscription (US11) sont « Terminé » côté FE alors que l'API est « À faire ».
- **Domaine relationnel avec des invariants forts** : R1 (`capacity ≥ 1`), dates cohérentes, unicité de l'inscription (R3) et **interdiction de dépasser la capacité sous concurrence** (US12, test à 50 requêtes parallèles).
- **Sprints courts et équipe étudiante** : il faut des outils répandus, rapides à prendre en main et lançables en une commande.
- **Qualité exigée par le backlog** : CI (lint, typecheck, tests, build), sécurité de base (US17), accessibilité et aucun secret dans le dépôt.

Alternatives étudiées :

- **Back** : NestJS (structure imposée, trop lourde pour une dizaine d'endpoints) ou Fastify (plus performant, mais le débit n'est pas un enjeu du MVP).
- **Données** : une base documentaire, écartée car le domaine est relationnel et a besoin de transactions et de verrous de ligne ; ou du SQL écrit à la main, écarté car il ne fournit ni typage ni migrations versionnées.
- **Organisation** : coder le front contre un back en cours de développement (blocages réciproques), ou un contrat d'API partagé et simulé (*contract-first*).

## Décision

Nous construisons EventHub comme un **monorepo** (`back/`, `front/`, `compose.yaml`) composé d'un front Next.js et d'une API REST indépendante, sur le principe **contract-first** :

1. **Contrat d'API d'abord.** `api-contract-v0.md` est converti en OpenAPI 3.1, qui devient la source de vérité. Le front en génère son client typé (`openapi-typescript`, appels réseau limités à `src/api/http.ts`), et **Prism** simule les routes que le back n'a pas encore livrées. Le proxy `rewrites()` de Next.js oriente chaque route vers le back réel ou vers Prism par variables d'environnement, sans changement de code.
2. **Back : Node.js 24, Express 5 et TypeScript strict**, organisé en couches routes → contrôleur → service → dépôt. Le service dépend d'une interface de dépôt et non de l'ORM. Zod valide les entrées et les variables d'environnement.
3. **Données : PostgreSQL 18 et Prisma 7** (adapter `pg`). Le schéma Prisma est la source des modèles et des migrations versionnées. Les invariants métier sont aussi des contraintes `CHECK` en base. `confirmedCount` est calculé et non stocké.
4. **Erreurs au format RFC 9457** (`application/problem+json`), complétées par `code`, `requestId` et `errors[]`. Ce format remplace le format `{ error }` du contrat initial.
5. **Front : Next.js 16 (App Router)**, avec TanStack Query (état serveur), React Hook Form et Zod (même version que le back), i18next, CSS Modules et tokens Figma. Les composants sont documentés dans Storybook 10 avec MSW et `addon-a11y`.
6. **Exécution : Docker Compose** à la racine, avec des profils (`mock`, `front`, `storybook`). Le Dockerfile multi-stage a une cible `dev` (hot reload, migrations au démarrage) et une cible `prod` (utilisateur non root).
7. **Livraison** : CI GitHub Actions séparée pour le back et le front, branches `develop` (préproduction) et `main` (production) protégées, PR obligatoire avec au moins une validation.

## Conséquences

**Positif**

- **Front et back avancent en parallèle** : le front livre des écrans complets contre Prism, puis bascule sur le back réel par simple configuration.
- **Typage de bout en bout** : contrat → types front, schéma Prisma → types back. Un écart de contrat se voit à la compilation ou au lint OpenAPI, pas en production.
- **La base porte les garanties critiques** : clés étrangères, `CHECK`, unicité et transactions ACID. Les verrous de ligne nécessaires à US12 sont natifs.
- **Prise en main rapide** : stack répandue, lancement en une commande, Swagger UI sur `/docs`, Storybook publié sur GitHub Pages.

**Négatif et risques acceptés**

- **Dérive entre deux fichiers de contrat** : `back/openapi.yaml` et `front/openapi.contract.yaml` coexistent. Les écarts sont déjà constatés (C1 à C4 du compte rendu du 25/11 : longueur du mot de passe, `400` ou `422`, enveloppe `{ data }`). Il faut les synchroniser à chaque endpoint, et à terme ne garder qu'un seul fichier vérifié en CI.
- **Prism masque des écarts** : il ignore `servers[].url` (préfixe `/api` absent) et ne reproduit pas les règles métier (concurrence, visibilité des brouillons). Les tests d'intégration contre le back réel (US16) restent indispensables.
- **Limites de Prisma** : les `CHECK` sont écrits à la main dans les migrations, `contains` n'échappe pas les jokers `LIKE` et `FOR UPDATE` passe par du SQL brut. Il faut donc aussi relire le SQL en revue.
- **Versions TypeScript divergentes** (6.0 côté back, 5.9 côté front) à cause des dépendances `typescript-eslint` et `openapi-typescript`. Elles seront à réaligner.
- **Stack dense pour un MVP** : Next.js, Storybook, MSW et Prism représentent beaucoup d'outillage à maintenir pour une petite équipe.
- **Migrations en production non automatisées** : l'image `prod` ne les joue pas, une étape de déploiement dédiée reste à prévoir.
