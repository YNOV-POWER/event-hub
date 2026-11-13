# EventHub : Contrat d'API v0.1

| | |
|---|---|
| **Version** | v0.1 (v0 + décisions de la séance intégrées) |
| **Périmètre** | Sprint 1 : auth, events, catalogue. Les endpoints `registrations` sont réservés (§9) |
| **Base URL** | `/api/` |
| **Format** | JSON, `Content-Type: application/json` |
| **Statut des informations** | Les choix marqués **[À TRANCHER]** restent ouverts (§10) |

---

## 1. Ressources

Trois ressources dans le périmètre du Sprint 1 : **User**, **Event** et **Registration** (cette dernière réservée au Sprint 2). Il n'y a **pas de ressource Venue** : le lieu est un champ texte `location` de l'événement.

### 1.1 User

| Champ | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `email` | string | Unique. Jamais exposé aux autres utilisateurs, sauf à l'organisateur propriétaire dans la liste des inscrits (Sprint 2) |
| `displayName` | string | 2 à 80 caractères |
| `role` | enum | `PARTICIPANT` \| `ORGANIZER` |
| `createdAt` | string (ISO 8601 UTC) | |

Le mot de passe n'apparaît dans aucune réponse.

### 1.2 Event

| Champ | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `title` | string | 3 à 120 caractères |
| `description` | string | 0 à 5000 caractères |
| `category` | enum | `CONFERENCE` \| `WORKSHOP` \| `CONCERT` \| `OTHER` **[À TRANCHER : liste, voir §10]** |
| `location` | string | 1 à 200 caractères, texte libre |
| `startsAt` | string (ISO 8601 UTC) | |
| `endsAt` | string (ISO 8601 UTC) | Strictement après `startsAt` |
| `capacity` | integer | ≥ 1 (R1) |
| `confirmedCount` | integer | Lecture seule, calculé par le serveur |
| `remainingSeats` | integer | Lecture seule, `capacity - confirmedCount` |
| `status` | enum | `DRAFT` \| `PUBLISHED` \| `CANCELLED` |
| `organizer` | object | Résumé embarqué : `{ id, displayName }` |
| `createdAt`, `updatedAt` | string (ISO 8601 UTC) | |

Le résumé d'`organizer` est embarqué pour que le catalogue et le détail n'aient besoin d'aucun appel supplémentaire.

`status` et `category` sont deux champs distincts : `status` porte le cycle de vie (`DRAFT`, `PUBLISHED`, `CANCELLED`), `category` porte le type d'événement.

### 1.3 Registration (réservée Sprint 2)

`id`, `eventId`, `userId`, `status` (`CONFIRMED` \| `WAITLISTED` \| `CANCELLED`), `position` (null hors liste d'attente), `createdAt`. Endpoints en §9.

---

## 2. Authentification

- **Décidé** : header `Authorization: Bearer <accessToken>`.
- Sans jeton valide sur une route protégée : `401 UNAUTHENTICATED`.
- Jeton valide mais rôle ou propriété insuffisants : `403 FORBIDDEN`.
- Le client ne peut jamais fournir de `role` à l'inscription : le champ est refusé (`422`). Le mécanisme d'attribution de `ORGANIZER` reste à décider (US04, §10).
- **Politique de mot de passe (décidé)** : 12 caractères minimum, aucune règle de composition imposée.

---

## 3. Endpoints du Sprint 1

Légende accès : **Public** = sans jeton, **Auth** = utilisateur connecté, **ORG** = rôle `ORGANIZER`, **ORG (owner)** = organisateur propriétaire de la ressource.

Codes transverses non répétés dans le tableau : `400 MALFORMED_REQUEST` (JSON invalide), `500 INTERNAL_ERROR`. `429 TOO_MANY_REQUESTS` sera ajouté sur les routes sensibles avec US24 (Should).

### 3.1 Auth et profil

| # | Méthode | URL | Accès | Succès | Erreurs | US |
|---|---|---|---|---|---|---|
| A1 | `POST` | `/auth/register` | Public | `201` | `422 VALIDATION_FAILED`, `409 EMAIL_ALREADY_USED` | US01 |
| A2 | `POST` | `/auth/login` | Public | `200` | `422 VALIDATION_FAILED`, `401 INVALID_CREDENTIALS` | US02 |
| A3 | `GET` | `/me` | Auth | `200` | `401 UNAUTHENTICATED` | US02, US03 |

### 3.2 Events

| # | Méthode | URL | Accès | Succès | Erreurs | US |
|---|---|---|---|---|---|---|
| E1 | `GET` | `/events` | Public | `200` | `400 INVALID_QUERY_PARAM` | US09 |
| E2 | `GET` | `/events/{id}` | Public | `200` | `404 NOT_FOUND` | US10 |
| E3 | `GET` | `/me/events` | ORG | `200` | `401`, `403 FORBIDDEN`, `400 INVALID_QUERY_PARAM` | US05 |
| E4 | `POST` | `/events` | ORG | `201` + header `Location` | `401`, `403`, `422 VALIDATION_FAILED` | US05 |
| E5 | `PATCH` | `/events/{id}` | ORG (owner) | `200` | `401`, `403`, `404`, `422 VALIDATION_FAILED`, `409 CAPACITY_BELOW_CONFIRMED`, `409 EVENT_NOT_EDITABLE` | US07 |
| E6 | `POST` | `/events/{id}/publish` | ORG (owner) | `200` | `401`, `403`, `404`, `422 VALIDATION_FAILED`, `409 INVALID_STATE_TRANSITION` | US06 |
| E7 | `POST` | `/events/{id}/cancel` | ORG (owner) | `200` | `401`, `403`, `404` | US08 |

Soit **10 endpoints** au Sprint 1.

**Règles de comportement**

- **E2** : un événement `DRAFT` n'est visible que de son organisateur. Pour tout autre appelant, `404` (et non `403`), afin de ne pas révéler son existence. Un événement `PUBLISHED` ou `CANCELLED` est lisible par tous.
- **E4** : l'événement est créé en `DRAFT`. `startsAt` doit être dans le futur, `endsAt > startsAt`, `capacity >= 1`, `location` non vide. Le `organizerId` vient du jeton, jamais du corps.
- **E5** : champs modifiables : `title`, `description`, `category`, `location`, `startsAt`, `endsAt`, `capacity`. Un événement `CANCELLED` n'est pas modifiable (`409 EVENT_NOT_EDITABLE`). Réduire `capacity` sous `confirmedCount` est refusé (R6). Pour un événement dont l'appelant n'est pas propriétaire : `403` s'il est `PUBLISHED` ou `CANCELLED`, `404` s'il est `DRAFT`.
- **E6** : transition `DRAFT → PUBLISHED` uniquement. Les règles de validité (date future, `location` renseignée) sont revérifiées à la publication. Publier un événement déjà `PUBLISHED` ou `CANCELLED` renvoie `409 INVALID_STATE_TRANSITION`.
- **E7** : transition vers `CANCELLED`, **idempotente** (un second appel renvoie `200` avec le même état). Depuis `DRAFT` ou `PUBLISHED`. En Sprint 2, annule aussi toutes les inscriptions dans la même transaction (R7).

### 3.3 Exemples

**A1 : `POST /auth/register`**

```json
// requête
{ "email": "ada@example.com", "password": "correct horse battery", "displayName": "Ada" }

// 201
{
  "data": {
    "id": "7c0f6b1e-6d0a-4f4b-9f3b-2a5d1f8e9a10",
    "email": "ada@example.com",
    "displayName": "Ada",
    "role": "PARTICIPANT",
    "createdAt": "2026-11-16T09:00:00Z"
  }
}
```

**A1 : mot de passe trop court**

```json
// 422
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed.",
    "status": 422,
    "details": [
      { "field": "password", "code": "MIN_LENGTH", "message": "password must contain at least 12 characters." }
    ],
    "requestId": "req_01HXYZ..."
  }
}
```

**A2 : `POST /auth/login`**

```json
// requête
{ "email": "ada@example.com", "password": "correct horse battery" }

// 200
{
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": { "id": "7c0f6b1e-...", "displayName": "Ada", "role": "PARTICIPANT" }
  }
}
```

**E4 : `POST /events`**

```json
// requête
{
  "title": "TypeScript Workshop",
  "description": "Hands-on session.",
  "category": "WORKSHOP",
  "location": "Hub Central, 12 rue de la République, Lyon",
  "startsAt": "2026-12-10T18:00:00Z",
  "endsAt": "2026-12-10T21:00:00Z",
  "capacity": 30
}

// 201, Location: /api/v1/events/b1a2c3d4-...
{
  "data": {
    "id": "b1a2c3d4-...",
    "title": "TypeScript Workshop",
    "description": "Hands-on session.",
    "category": "WORKSHOP",
    "location": "Hub Central, 12 rue de la République, Lyon",
    "startsAt": "2026-12-10T18:00:00Z",
    "endsAt": "2026-12-10T21:00:00Z",
    "capacity": 30,
    "confirmedCount": 0,
    "remainingSeats": 30,
    "status": "DRAFT",
    "organizer": { "id": "9d8e7f6a-...", "displayName": "Grace" },
    "createdAt": "2026-11-16T09:05:00Z",
    "updatedAt": "2026-11-16T09:05:00Z"
  }
}
```

---

## 4. `GET /events` : pagination, filtres, tri

Endpoint public. Retourne uniquement les événements `PUBLISHED` dont `startsAt` est dans le futur, sauf si les paramètres de date demandent explicitement autre chose.

### 4.1 Pagination (décidé : offset)

| Paramètre | Type | Défaut | Contraintes |
|---|---|---|---|
| `page` | integer | `1` | ≥ 1 |
| `pageSize` | integer | `20` | 1 à 100 |

Réponse :

```json
{
  "data": [ { "...": "Event" } ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 134, "totalPages": 7 }
}
```

Limite connue de l'offset : performances dégradées sur de très grands volumes et résultats instables si des données changent entre deux pages. Acceptable pour ce MVP.

### 4.2 Filtres

| Paramètre | Type | Sémantique | Priorité |
|---|---|---|---|
| `from` | ISO 8601 UTC | `startsAt >= from`. Défaut : maintenant | Must |
| `to` | ISO 8601 UTC | `startsAt <= to` | Must |
| `category` | enum | Une ou plusieurs valeurs séparées par des virgules (`category=WORKSHOP,CONCERT`) | Should (US19) |
| `q` | string | Recherche texte sur `title`, `description` et `location`, 2 à 100 caractères | Should (US19) |

Les filtres combinés s'appliquent en `ET`. Un paramètre inconnu ou invalide renvoie `400 INVALID_QUERY_PARAM` (pas d'ignorance silencieuse).

### 4.3 Tri

| Paramètre | Valeurs autorisées | Défaut |
|---|---|---|
| `sort` | `startsAt`, `-startsAt`, `createdAt`, `-createdAt`, `title`, `-title` | `startsAt` (ascendant) |

Le préfixe `-` indique l'ordre descendant. Un seul critère de tri est accepté en v0. Un tie-breaker déterministe sur `id` est appliqué côté serveur pour garantir une pagination stable.

### 4.4 Cas de `GET /me/events` (E3)

Même pagination et même tri que E1. Filtre supplémentaire `status` (`DRAFT`, `PUBLISHED`, `CANCELLED`, valeurs multiples séparées par des virgules). Pas de filtre implicite sur la date : l'organisateur voit ses événements passés.

### 4.5 Exemple

`GET /events?from=2026-12-01T00:00:00Z&category=WORKSHOP&sort=-startsAt&page=2&pageSize=10`

---

## 5. Format d'erreur commun

Toute réponse non 2xx a le même corps :

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed.",
    "status": 422,
    "details": [
      { "field": "capacity", "code": "MIN_VALUE", "message": "capacity must be >= 1." }
    ],
    "requestId": "req_01HXYZ..."
  }
}
```

| Champ | Obligatoire | Description |
|---|---|---|
| `code` | oui | Code métier **stable**, `UPPER_SNAKE_CASE`. Le front se base sur lui, jamais sur `message` |
| `message` | oui | Texte lisible en anglais, destiné au développeur, non affiché tel quel à l'utilisateur final |
| `status` | oui | Reprend le code HTTP |
| `details` | non | Tableau, rempli pour les erreurs de validation (`field` en notation pointée) |
| `requestId` | oui | Identifiant de corrélation, également renvoyé en header `X-Request-Id` |

Règles :

- Les erreurs `401 INVALID_CREDENTIALS` sont génériques : même réponse que l'email soit inconnu ou le mot de passe faux (pas d'énumération de comptes).
- Aucune stack trace, requête SQL ou chemin interne dans une réponse d'erreur.
- `400` : requête mal formée (JSON invalide, paramètre de query invalide). `422` : JSON bien formé mais données refusées par la validation.
- `409` : conflit d'état ou d'unicité (le front affiche un message dédié).

### 5.1 Catalogue des codes (v0.1)

| HTTP | `code` | Cas |
|---|---|---|
| 400 | `MALFORMED_REQUEST` | JSON invalide |
| 400 | `INVALID_QUERY_PARAM` | Paramètre de query inconnu ou hors contraintes |
| 401 | `UNAUTHENTICATED` | Jeton absent, invalide ou expiré |
| 401 | `INVALID_CREDENTIALS` | Échec de login |
| 403 | `FORBIDDEN` | Rôle ou propriété insuffisants |
| 404 | `NOT_FOUND` | Ressource inexistante ou non visible pour l'appelant |
| 409 | `EMAIL_ALREADY_USED` | Email déjà enregistré |
| 409 | `INVALID_STATE_TRANSITION` | Transition de statut interdite |
| 409 | `EVENT_NOT_EDITABLE` | Modification d'un événement annulé |
| 409 | `CAPACITY_BELOW_CONFIRMED` | Capacité inférieure aux inscrits confirmés (R6) |
| 422 | `VALIDATION_FAILED` | Données invalides (détail dans `details`) |
| 429 | `TOO_MANY_REQUESTS` | Réservé (US24) |
| 500 | `INTERNAL_ERROR` | Erreur serveur non prévue |

Codes réservés au Sprint 2 : `409 ALREADY_REGISTERED`, `409 EVENT_FULL`, `422 REGISTRATION_CLOSED` (cohérent avec la convention du backlog : 409 déjà inscrit ou complet, 422 événement non ouvert).

---

## 6. Conventions JSON de l'équipe

1. **Nommage** : clés en `camelCase`, valeurs d'enum en `UPPER_SNAKE_CASE`, identifiants en UUID sous forme de chaînes. Pas d'abréviations ambiguës.
2. **Dates** : toujours ISO 8601 en **UTC avec suffixe `Z`** (`2026-12-10T18:00:00Z`). Le serveur ne convertit jamais de fuseau ; l'affichage localisé est la responsabilité du front.
3. **Enveloppe et valeurs absentes** : toute réponse de succès est enveloppée dans `{ "data": ... }` (avec `meta` pour les collections). Un champ défini dans le contrat est **toujours présent** ; une valeur absente est `null`, jamais omise.

---

## 7. Couverture des écrans (vérification front)

Objectif : chaque écran est servi sans appel superflu. À valider par le dev front.

| Écran | Appels au chargement | Appels sur action | Remarque |
|---|---|---|---|
| Inscription | aucun | A1 | Redirection vers login ensuite |
| Login | aucun | A2 | A3 inutile après login : la réponse de A2 contient `user` |
| Catalogue (public) | E1 | E1 (page, filtres, tri) | Résumé `organizer` embarqué, `location` en texte |
| Détail événement | E2 | aucun | `remainingSeats` et `location` inclus : 1 appel |
| Mes événements (ORG) | E3 | E6, E7 | Pas de re-lecture : E6 et E7 renvoient l'événement à jour |
| Formulaire création (ORG) | aucun | E4 | Plus aucun appel de référentiel (pas de venues) |
| Formulaire édition (ORG) | E2 | E5 | |
| Restauration de session | A3 | aucun | Un seul appel pour retrouver l'utilisateur |

Point d'attention Sprint 2 : l'écran détail aura besoin de savoir si l'utilisateur connecté est déjà inscrit. Pour éviter un second appel, proposer un champ `myRegistration` (`null` ou `{ id, status, position }`) dans la réponse de E2 quand l'appelant est authentifié. **[À TRANCHER en Sprint 2]**.

---

## 8. Traçabilité avec les user stories

| Endpoints | US | Lot | MoSCoW |
|---|---|---|---|
| A1 | US01 | 1 | Must |
| A2, A3 | US02, US03 | 1 | Must |
| (middleware 401/403, tous les endpoints protégés) | US03 | 1 | Must |
| (attribution de `ORGANIZER`, hors endpoint en v0.1) | US04 | 1 | Must |
| E4, E3 | US05 | 2 | Must |
| E6 | US06 | 2 | Must |
| E5 | US07 | 2 | Must |
| E7 | US08 | 2 | Must |
| E1 | US09 | 2 | Must |
| E2 | US10 | 2 | Must |
| E1 : `category`, `q` | US19 | 4 | Should |

Écarts à valider avec le PO :

- **E3** (`/me/events`) n'a pas de US dédiée : il est rattaché à US05 mais mérite une mention explicite dans ses critères d'acceptation.
- **A3** (`GET /me`) est rattaché à US02 / US03 par déduction ; à confirmer.

---

## 9. Réservé : Sprint 2 (non contractuel en v0.1)

| Méthode | URL | Accès | Succès | Erreurs | US |
|---|---|---|---|---|---|
| `POST` | `/events/{id}/registrations` | Auth | `201` | `401`, `404`, `409 ALREADY_REGISTERED`, `409 EVENT_FULL`, `422 REGISTRATION_CLOSED` | US11, US12 |
| `DELETE` | `/events/{id}/registrations/me` | Auth | `204` | `401`, `404` | US13 |
| `GET` | `/me/registrations` | Auth | `200` | `401` | US14 |
| `GET` | `/events/{id}/registrations` | ORG (owner) | `200` | `401`, `403`, `404` | US15 |

`POST` d'inscription est idempotent : un second appel pour la même paire (événement, utilisateur) ne doit pas créer de doublon. Le comportement exact (200 ou 409) est à figer au Sprint 2 avec US11.

---

## 10. Décisions et points restants

### 10.1 Décisions actées

| # | Sujet | Décision | Effet sur le contrat |
|---|---|---|---|
| 1 | Venue et `displayName` | Pas de table `Venue` ; on garde `events.location` et `users.displayName` | Ressource Venue et endpoints V1/V2 supprimés ; `location` texte libre dans `Event` ; filtre `venueId` supprimé |
| 2 | Authentification | Header `Authorization: Bearer` | §2 |
| 3 | Pagination | Offset (`page`, `pageSize`) | §4.1 |
| 5 | Événement `DRAFT` d'un autre organisateur | `404` | §3.2, E2 et E5 |
| 7 | Lieux créés par les organisateurs | Sans objet (pas de table Venue) | Point clos |
| 8 | Mot de passe | 12 caractères minimum, aucune règle de composition | §2, exemple A1 |

### 10.2 Points restants

| # | Point | Défaut retenu dans ce contrat | Pourquoi c'est encore ouvert |
|---|---|---|---|
| 4 | **Liste des catégories** | `CONFERENCE`, `WORKSHOP`, `CONCERT`, `OTHER` | La réponse reçue (`published`, `canceled`, `draft`) correspond aux **statuts**, déjà couverts par `status` (écrits `CANCELLED` avec deux L, comme dans tout le backlog). Aucune liste de catégories n'a été donnée |
| 6 | **Attribution de `ORGANIZER`** (US04) | Hors contrat : rôle fixé en base, le client ne peut pas le fournir | Aucune décision reçue ; à trancher avant le lot 1 (risque d'élévation de privilège si choisi à l'inscription) |

---

## 11. Non vérifié

- Ce contrat n'a pas été validé par un outil OpenAPI : il doit être converti en `openapi.yaml` (ticket S1) et lint avant de servir de source pour les mocks front et le client typé.
- Aucune stack n'étant définie, rien ici ne dépend d'un framework ; les limites de longueur et les valeurs par défaut sont des propositions.
