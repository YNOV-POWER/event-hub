# Compte rendu : initialisation du back EventHub

**Date** : 20/11/2026 · **Branche** : `feature/init-backend`

## Livré

- Back Node.js / Express dans `back/`, architecture en couches, dockerisé avec PostgreSQL (`compose.yaml` à la racine).
- Schéma Prisma et première migration : `users`, `events`, `registrations`.
- Endpoints `GET /api/events` (E1, US09) et `GET /api/events/{id}` (E2, US10), conformes au contrat v0.1.
- Gestionnaire d'erreurs RFC 9457, seed de développement, Swagger UI sur `/docs`.

## Choix techniques

| Choix | Justification |
|---|---|
| **Express 5.3** | Framework Node le plus répandu : écosystème de middlewares mûr (Swagger UI s'y branche en une ligne) et prise en main immédiate pour l'équipe. Minimaliste, il nous laisse définir notre propre découpage en couches, là où NestJS imposerait le sien (décorateurs, modules, injection), ce qui est trop lourd pour une dizaine d'endpoints. Fastify aurait été plus rapide, mais le débit n'est pas un enjeu pour ce MVP. La v5 transmet d'elle-même les promesses rejetées au gestionnaire d'erreurs : pas de wrapper `async` à maintenir. |
| **TypeScript 6.0, mode strict** | Les types du contrat (enums, ressource `Event`) et ceux de Prisma sont vérifiés à la compilation. Pas de TS 7 : typescript-eslint ne le supporte pas encore (`typescript < 6.1`). |
| **PostgreSQL 18** | Le domaine est relationnel (un événement a un organisateur et des inscriptions) : les clés étrangères garantissent la cohérence. Les transactions ACID et le verrouillage de lignes seront nécessaires au Sprint 2 pour ne pas dépasser la capacité lors d'inscriptions simultanées, et pour annuler un événement et ses inscriptions d'un bloc (R7). Plusieurs besoins sont couverts nativement : enums, contraintes `CHECK`, type `uuid`, `timestamptz` (stockage UTC, comme l'exige le contrat) et recherche insensible à la casse (`ILIKE`). La v18 est la dernière majeure ; chaque majeure est maintenue 5 ans. |
| **Prisma 7.10** | Le schéma déclaratif est la source unique des modèles : Prisma en génère les migrations SQL (versionnées et modifiables, ce qui a permis d'ajouter les `CHECK`) et un client entièrement typé. Les enums de la base sont donc les mêmes que dans le code TypeScript. Les requêtes sont paramétrées (pas d'injection SQL), et `confirmedCount` est calculé dans la même requête que l'événement (comptage filtré des inscriptions). En v7, les requêtes passent par le driver `pg` (`@prisma/adapter-pg`) : l'image prod tourne sans moteur natif ni OpenSSL. 7.10 est la dernière version stable (la 8.0 est en RC). Limites rencontrées : les `CHECK` ne s'expriment pas dans le schéma, et `contains` n'échappe pas les jokers `LIKE`. |
| **Couches contrôleur / service / dépôt** | Le contrôleur gère le HTTP, le service les règles métier (visibilité des brouillons, pagination), le dépôt l'accès aux données. Le service dépend d'une interface de dépôt : testable sans base, ORM remplaçable. |
| **Zod** | Valide les paramètres de query et les variables d'environnement. Ses erreurs structurées alimentent directement le tableau `errors[]` des réponses 400. |
| **Erreurs RFC 9457** | Standard IETF, déjà outillé côté clients. Extensible : on y ajoute `code` (code métier du contrat), `requestId` et `errors`. Décidé à la place du format `{ error }` du contrat §5. |
| **OpenAPI 3.1 + swagger-ui-express** | Un seul document décrit l'API ; le front peut s'en servir pour ses mocks ou un client typé. |
| **Docker Compose à la racine** | Une commande lance toute la stack ; le front pourra s'y ajouter. Dockerfile multi-stage : cible `dev` (hot reload, migrations au démarrage) et cible `prod` (dépendances de prod seulement, utilisateur non root). |
| **Contraintes `CHECK` en base** | `capacity ≥ 1`, fin après le début, `position` réservée à la liste d'attente : les invariants tiennent aussi hors API (seed, scripts, futurs endpoints). |
| **Seed idempotent à ids fixes** | Relançable sans doublon (upsert). Les ids stables sont réutilisables par le front, et les dates relatives gardent un catalogue à venir. |

## Écarts avec la demande et le contrat

- **Pas de table `venues`** : décision n°1 du contrat (le lieu est `events.location`). Une table `users` a été ajoutée, nécessaire pour l'organisateur.
- **Format d'erreur** : RFC 9457 au lieu du §5 du contrat.
- **`page` bornée à 1 000 000 000**, absent du contrat, pour garder un calcul de pagination exact.
- **URL mal encodée** : renvoie `400 MALFORMED_REQUEST`, cas non prévu par le contrat.

## Vérifications

- `typecheck`, `lint` et `build` passent ; l'image prod démarre et répond.
- `prisma migrate diff` : aucun écart entre le schéma et la base. Le seed relancé deux fois donne le même résultat.
- Tests manuels (curl) de E1 et E2 : pagination, filtres, tri, toutes les erreurs 400 et 404, JSON invalide.
- Contraintes `CHECK` testées en base.
- Deux bugs trouvés et corrigés pendant les tests :
  - la recherche `q` traitait `%` et `_` comme des jokers ;
  - la contrainte sur `position` laissait passer une liste d'attente sans position.

## Points ouverts

- Mettre à jour le contrat §5 avec le format RFC 9457 : le front lit `code` au premier niveau.
- Trancher le préfixe : `/api` (retenu) ou `/api/v1` (exemple du contrat).
- Aucun test automatisé : framework à choisir.
- Le document OpenAPI n'a pas encore été validé par un linter.
- `npm audit` signale 3 vulnérabilités « high » dans `effect`, une dépendance de l'outil en ligne de commande Prisma (dev uniquement). Le seul correctif proposé ramène Prisma en 6.12 : non appliqué.
- Les comptes du seed ne peuvent pas se connecter : à reprendre avec l'authentification (US01/US02).
- La visibilité d'un brouillon par son organisateur sera branchée avec l'authentification (US02/US03).
- Migrations en production : une étape dédiée est à prévoir, l'image prod ne les joue pas.
