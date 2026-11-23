import type { NextConfig } from "next";

/**
 * Proxy de développement permettant de basculer sans changement de code applicatif :
 * - Mode 100 % mock (Prism) : API_EVENTS_BASE=http://127.0.0.1:4010,     API_MOCK_BASE=http://127.0.0.1:4010
 * - Mode hybride (défaut)   : API_EVENTS_BASE=http://127.0.0.1:3000/api, API_MOCK_BASE=http://127.0.0.1:4010
 * - Mode 100 % back réel    : API_EVENTS_BASE=http://127.0.0.1:3000/api, API_MOCK_BASE=http://127.0.0.1:3000/api
 *
 * Note : Prism sert les chemins OpenAPI sans le préfixe `servers[].url` (`/events`),
 * tandis que le Back Express monte ses routes sous `/api` (`/api/events`).
 */
const apiEventsBase = (
  process.env["API_EVENTS_BASE"] ?? "http://127.0.0.1:3000/api"
).replace(/\/+$/, "");
const apiMockBase = (process.env["API_MOCK_BASE"] ?? "http://127.0.0.1:4010").replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Routes Sprint 2 / Auth non encore exposées côté Back réel -> Prism
      {
        source: "/api/events/:id/registrations",
        destination: `${apiMockBase}/events/:id/registrations`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${apiMockBase}/auth/:path*`,
      },
      // Routes livrées côté Back réel (E1 & E2)
      {
        source: "/api/events",
        destination: `${apiEventsBase}/events`,
      },
      {
        source: "/api/events/:id",
        destination: `${apiEventsBase}/events/:id`,
      },
      // Fallback générique
      {
        source: "/api/:path*",
        destination: `${apiMockBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
