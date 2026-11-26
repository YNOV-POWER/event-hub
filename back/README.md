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

Au démarrage, le conteneur `back` applique les migrations (`prisma migrate deploy`) puis lance `tsx watch`. `src/`, `prisma/` et `openapi.yaml` sont montés depuis l'hôte : le serveur redémarre à chaque modification (le watcher fonctionne en polling, cf. `compose.yaml`). Après une sauvegarde, attendre le message `EventHub API listening on port 3000` avant de relancer une requête, sinon elle reste sans réponse pendant le redémarrage.

## Variables d'environnement

Validées au démarrage dans `src/config/env.ts` : le serveur refuse de démarrer si l'une d'elles est invalide.

| Variable | Rôle |
|---|---|
| `PORT` | Port HTTP (défaut `3000`) |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `JWT_SECRET` | Secret de signature des jetons d'accès, 32 caractères minimum |

`compose.yaml` fournit une valeur par défaut de `JWT_SECRET` pour le développement uniquement. En production, la définir via une vraie variable d'environnement, jamais dans le dépôt. Changer le secret invalide tous les jetons déjà émis.

## Commandes utiles

| Commande | Effet |
|---|---|
| `docker compose exec back npm run db:seed` | Seed de développement, idempotent (ids fixes + upsert) |
| `docker compose exec back npx prisma migrate dev --name <nom>` | Crée et applique une migration après modification de `prisma/schema.prisma` |
| `docker compose exec back npm run db:reset` | Supprime toutes les données et rejoue les migrations (Prisma 7 ne relance pas le seed : enchaîner avec `db:seed`) |
| `docker compose logs -f back` | Logs de l'API |
| `docker compose down` | Arrête la stack (ajouter `-v` supprime aussi les données PostgreSQL) |

Sur l'hôte (après `npm ci` et `npm run prisma:generate`) : `npm run typecheck`, `npm run lint`, `npm run build`. Sans `prisma:generate`, le dossier `generated/prisma` n'existe pas et TypeScript comme ESLint remontent des centaines d'erreurs sans rapport avec le code.

> Les dépendances (`bcrypt`, `jose`, `zod`…) doivent être déclarées dans `package.json` et installées au build de l'image. Ne pas les installer avec `docker exec ... npm i` : elles seraient perdues à la prochaine reconstruction. Ajouter une dépendance depuis `back/` sur l'hôte, puis `docker compose up -d --build back`.

## Architecture

```
src/
  app.ts                  composition : middlewares, routes, injection des dépendances
  server.ts               bootstrap HTTP, arrêt propre (SIGTERM/SIGINT)
  config/env.ts           variables d'environnement validées (Zod)
  lib/prisma.ts           PrismaClient + adapter pg
  errors/app-error.ts     AppError, erreurs métier et codes du contrat (§5.1)
  http/
    problem-details.ts    construction des réponses RFC 9457
    parse-body.ts         validation d'un corps de requête avec un schéma Zod -> ValidationError (422)
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
  modules/auth/
    auth.routes.ts        routes Express (createAuthRouter)
    auth.controller.ts    couche HTTP : valide le body, appelle le service, enveloppe la réponse dans { data }
    auth.schema.ts        schémas Zod de register et login
    auth.service.ts       hachage bcrypt, création de l'utilisateur, vérification des identifiants, signature du JWT
```

Le service `events` dépend de l'interface `EventRepository`, pas de Prisma : il peut être testé avec un faux dépôt. Le service `auth` appelle pour l'instant Prisma directement et reçoit `JWT_SECRET` par son constructeur ; extraire un dépôt `auth.repository.ts` suivra la même logique si besoin.

## Endpoints implémentés

| # | Route | Notes |
|---|---|---|
| E1 | `GET /api/events` | `PUBLISHED` uniquement, `from` = maintenant par défaut, filtres `from`, `to`, `category`, `q`, tri `sort`, pagination `page` / `pageSize`. Paramètre inconnu ou invalide : `400 INVALID_QUERY_PARAM` |
| E2 | `GET /api/events/{id}` | `DRAFT` invisible (404) : aucun middleware d'authentification n'existe encore, donc un `DRAFT` renvoie toujours 404. Id non UUID : 404 |
| A1 | `POST /api/auth/register` | Crée un compte `PARTICIPANT` (US01). Ne connecte pas l'utilisateur |
| A2 | `POST /api/auth/login` | Vérifie les identifiants et renvoie un jeton d'accès (US02) |

Pas encore implémentés : `GET /api/me` (A3) et le middleware qui vérifie l'en-tête `Authorization: Bearer <jeton>` (`401 UNAUTHENTICATED`). Un jeton est donc délivré par le login mais aucune route ne l'exige pour l'instant.

Les réponses de succès des routes `auth` sont enveloppées dans `{ "data": ... }`, conformément au contrat.

### `POST /api/auth/register`

Corps JSON :

```json
{ "email": "ada@example.com", "password": "correct horse battery", "displayName": "Ada" }
```

| Champ | Règle |
|---|---|
| `email` | format email valide, 254 caractères max, normalisé (espaces retirés, minuscules) |
| `password` | 12 caractères minimum, 72 octets maximum (limite de bcrypt), aucune règle de composition |
| `displayName` | 2 à 80 caractères, espaces retirés |

Tout champ inconnu est refusé (`422`, code de champ `UNKNOWN_FIELD`), y compris `role` : le rôle n'est jamais fourni par le client. Tout compte créé est `PARTICIPANT`. Les organisateurs sont créés par un autre chemin (seed, administration).

Réponses :

| Statut | Code | Cas |
|---|---|---|
| `201` | — | Compte créé. Corps : `{ "data": { id, email, displayName, role, createdAt } }`. Le hash n'est jamais renvoyé |
| `422` | `VALIDATION_FAILED` | Corps invalide ou champ inconnu. `errors` liste chaque champ fautif (`field`, `code`, `message`) |
| `409` | `EMAIL_ALREADY_USED` | Un compte existe déjà avec cet email (contrainte d'unicité en base, code Prisma `P2002`) |

Le mot de passe est haché avec bcrypt (12 tours) avant stockage.

### `POST /api/auth/login`

Corps JSON :

```json
{ "email": "ada@example.com", "password": "correct horse battery" }
```

Réponses :

| Statut | Code | Cas |
|---|---|---|
| `200` | — | Corps : `{ "data": { accessToken, tokenType: "Bearer", expiresIn: 3600, user: { id, displayName, role } } }` |
| `422` | `VALIDATION_FAILED` | Corps invalide ou champ inconnu |
| `401` | `INVALID_CREDENTIALS` | Email inconnu ou mot de passe incorrect |

Le jeton est un JWT signé en HS256 avec `JWT_SECRET`, valable 1 heure (`sub` = id de l'utilisateur, `role` = rôle). Le même `401` est renvoyé que l'email existe ou non : pas d'énumération de comptes. Quand l'email est inconnu, un hash factice est tout de même comparé pour que le temps de réponse ne révèle pas non plus l'existence du compte.

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

`code`, `requestId` et `errors` sont des membres d'extension. Le front se base sur `code`, jamais sur le message. `requestId` est aussi renvoyé dans le header `X-Request-Id`. Aucune stack trace ni requête SQL n'est exposée.

> Le contrat d'API v0.1 (§5) décrit un autre corps d'erreur (`{ "error": { code, message, status, details, requestId } }`). Le back répond pour l'instant en RFC 9457, comme ci-dessus : à aligner avec le contrat ou à faire acter côté front.

Erreurs applicatives disponibles dans `src/errors/app-error.ts` :

| Classe | Statut | Code |
|---|---|---|
| `NotFoundError` | 404 | `NOT_FOUND` |
| `InvalidQueryParamError` | 400 | `INVALID_QUERY_PARAM` |
| `ValidationError` | 422 | `VALIDATION_FAILED` |
| `EmailAlreadyUsedError` | 409 | `EMAIL_ALREADY_USED` |
| `InvalidCredentialsError` | 401 | `INVALID_CREDENTIALS` |

Pour en ajouter une, déclarer son code dans `ErrorCode` puis créer une classe qui étend `AppError` : le gestionnaire d'erreurs la sérialise sans modification.

## Base de données

Tables `users`, `events`, `registrations` (migration `prisma/migrations/*_init`). Pas de table `venues` : le contrat v0.1 (décision n° 1) a remplacé la ressource Venue par le champ texte `events.location`.

Contraintes `CHECK` ajoutées à la main dans la migration (non exprimables dans `schema.prisma`) : `capacity >= 1`, `ends_at > starts_at`, `position` renseignée uniquement en liste d'attente.

`users.email` est unique : c'est cette contrainte, et non une lecture préalable, qui garantit qu'un email n'est inscrit qu'une fois, même sous requêtes simultanées.

## Seed

6 utilisateurs (2 organisateurs, 4 participants), 13 événements (publiés, brouillons, annulé, passé, un complet avec liste d'attente) et 11 inscriptions. Les dates sont relatives au moment du seed.

Le login existe, mais les comptes seedés ont encore un `password_hash` factice : ils ne peuvent pas se connecter tant que le seed n'a pas été mis à jour avec de vrais hashes bcrypt (mot de passe de développement d'au moins 12 caractères). Pour tester le login, utiliser un compte créé via `POST /api/auth/register`.
