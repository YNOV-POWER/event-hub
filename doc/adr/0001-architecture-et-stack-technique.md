# 1. Architecture et stack technique d'EventHub

Date : 2026-11-26
Statut : Accepté

## Contexte

EventHub permet de publier des événements et de s'y inscrire, avec un nombre de places limité. Le front et le back sont développés en parallèle par deux équipes : le front doit pouvoir avancer avant que l'API existe. Le domaine est relationnel (utilisateurs, événements, inscriptions), et la capacité ne doit jamais être dépassée, même en cas d'inscriptions simultanées (US12). L'équipe est étudiante et les sprints sont courts.

Alternatives écartées : NestJS (trop lourd pour une dizaine d'endpoints), Fastify (la performance n'est pas un enjeu) et une base NoSQL (il nous faut des transactions et des contraintes).

## Décision

- **Contrat d'API d'abord** : un fichier OpenAPI sert de référence. Le front en génère ses types, et **Prism** simule les routes que le back n'a pas encore livrées.
- **Back** : Express 5 et TypeScript, organisé en couches (routes → contrôleur → service → dépôt). Erreurs au format RFC 9457.
- **Données** : PostgreSQL 18 avec Prisma 7. Les règles métier critiques sont aussi des contraintes en base.
- **Front** : Next.js 16, TanStack Query, React Hook Form et Zod. Les composants sont documentés dans Storybook.
- **Exécution** : Docker Compose lance toute la stack en une commande. Une CI tourne sur chaque PR vers `develop` et `main`.

## Conséquences

- **Positif** : le front et le back avancent en parallèle, le typage va du contrat jusqu'au code, et PostgreSQL garantit la cohérence des données.
- **Négatif** : il existe deux fichiers OpenAPI (front et back), qu'il faut garder synchronisés. Des écarts sont déjà constatés (longueur du mot de passe, code `400` ou `422`). Prism ne reproduit pas les règles métier, d'où le besoin de tests sur le vrai back. Enfin, l'outillage est lourd pour un MVP.
