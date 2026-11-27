import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "storybook-static/**",
      "public/mockServiceWorker.js",
      "src/api/generated/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Critère Atelier 6 : aucun appel `fetch` hors de la couche unique `src/api/`
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "Aucun appel fetch direct dans l'UI : passez par src/api/client.ts.",
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "window",
          property: "fetch",
          message: "Aucun appel window.fetch direct dans l'UI : passez par src/api/client.ts.",
        },
        {
          object: "globalThis",
          property: "fetch",
          message: "Aucun appel globalThis.fetch direct dans l'UI : passez par src/api/client.ts.",
        },
      ],
      // Source de vérité unique pour les icônes : passer par src/components/ui/Icon.tsx
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "lucide-react",
              message:
                "Importez les icônes depuis @/components/ui/Icon plutôt que directement depuis lucide-react.",
            },
          ],
        },
      ],
    },
  },
  {
    // Seule la couche HTTP unique (et les tests dédiés) a le droit d'appeler fetch
    files: ["src/api/http.ts", "src/test/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-globals": "off",
      "no-restricted-properties": "off",
    },
  },
  {
    // Seul le composant Design System Icon.tsx a le droit d'importer lucide-react
    files: ["src/components/ui/Icon.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
