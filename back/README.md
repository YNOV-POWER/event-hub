# EventHub — Back

API REST Node.js / Express 5, PostgreSQL 18 via Prisma 7. Tout tourne dans Docker (`compose.yaml` à la racine du dépôt).

## Démarrer

```bash
docker compose up -d --build
docker compose exec back npm run db:seed
```

- API : <http://localhost:3000/api>
- Swagger UI : <http://localhost:3000/docs>
- PostgreSQL : `localhost:5432` (utilisateur, mot de passe et base : `eventhub`, surchargeables via `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DB_PORT`, `BACK_PORT`)

Au démarrage, le conteneur `back` applique les migrations (`prisma migrate deploy`) puis lance `tsx watch`. `src/`, `prisma/` et `openapi.yaml` sont montés depuis l'hôte : le serveur redémarre à chaque modification (le watcher fonctionne en polling, cf. `compose.yaml`).

## Commandes utiles

| Commande | Effet |
|---|---|
| `docker compose exec back npm run db:seed` | Seed de développement, idempotent (ids fixes + upsert) |
| `docker compose exec back npx prisma migrate dev --name <nom>` | Crée et applique une migration après modification de `prisma/schema.prisma` |
| `docker compose exec back npm run db:reset` | Supprime toutes les données et rejoue les migrations (Prisma 7 ne relance pas le seed : enchaîner avec `db:seed`) |
| `docker compose logs -f back` | Logs de l'API |
| `docker compose down` | Arrête la stack (ajouter `-v` supprime aussi les données PostgreSQL) |

Sur l'hôte (après `npm ci` et `npm run prisma:generate`) : `npm run typecheck`, `npm run lint`, `npm run build`.

## Architecture

```
src/
  app.ts                  composition : middlewares, routes, injection des dépendances
  server.ts               bootstrap HTTP, arrêt propre (SIGTERM/SIGINT)
  config/env.ts           variables d'environnement validées (Zod)
  lib/prisma.ts           PrismaClient + adapter pg
  errors/app-error.ts     AppError et codes métier du contrat (§5.1)
  http/
    problem-details.ts    construction des réponses RFC 9457
    middlewares/          request-id, 404, gestionnaire d'erreurs
  docs/openapi.ts         chargement de openapi.yaml pour Swagger UI
  modules/events/
    event.routes.ts       routes Express
    event.controller.ts   couche HTTP : parse la requête, appelle le service, sérialise
    event.query.ts        validation des paramètres de GET /events
    event.presenter.ts    modèle -> ressource Event du contrat
    event.service.ts      règles métier (visibilité DRAFT, pagination)
    event.repository.ts   accès aux données (Prisma), seule couche qui connaît la base
    event.model.ts        types du domaine
```

Le service dépend de l'interface `EventRepository`, pas de Prisma : il peut être testé avec un faux dépôt.

## Endpoints implémentés

| # | Route | Notes |
|---|---|---|
| E1 | `GET /api/events` | `PUBLISHED` uniquement, `from` = maintenant par défaut, filtres `from`, `to`, `category`, `q`, tri `sort`, pagination `page` / `pageSize`. Paramètre inconnu ou invalide : `400 INVALID_QUERY_PARAM` |
| E2 | `GET /api/events/{id}` | `DRAFT` invisible (404) : l'authentification n'existe pas encore, donc un `DRAFT` renvoie toujours 404. Id non UUID : 404 |

## Erreurs (RFC 9457)

Toute réponse non 2xx est servie en `application/problem+json` :

```json
{
  "type": "/problems/invalid-query-param",
  "title": "Invalid query parameter",
  "status": 400,
  "detail": "One or more query parameters are invalid.",
  "instance": "/api/events",
  "code": "INVALID_QUERY_PARAM",
  "requestId": "req_…",
  "errors": [{ "field": "pageSize", "code": "MAX_VALUE", "message": "pageSize must be <= 100." }]
}
```

`code`, `requestId` et `errors` sont des membres d'extension. Le front se base sur `code`. `requestId` est aussi renvoyé dans le header `X-Request-Id`. Aucune stack trace ni requête SQL n'est exposée.

## Base de données

Tables `users`, `events`, `registrations` (migration `prisma/migrations/*_init`). Pas de table `venues` : le contrat v0.1 (décision n° 1) a remplacé la ressource Venue par le champ texte `events.location`.

Contraintes `CHECK` ajoutées à la main dans la migration (non exprimables dans `schema.prisma`) : `capacity >= 1`, `ends_at > starts_at`, `position` renseignée uniquement en liste d'attente.

## Seed

6 utilisateurs (2 organisateurs, 4 participants), 13 événements (publiés, brouillons, annulé, passé, un complet avec liste d'attente) et 11 inscriptions. Les dates sont relatives au moment du seed.

Les comptes seedés ont un `password_hash` factice : ils ne pourront pas se connecter tant que l'US d'authentification n'aura pas fixé l'algorithme de hachage et mis à jour le seed.
