import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "msw-storybook-addon"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  env: (config) => ({
    ...config,
    // Chemin relatif pour que le Service Worker MSW intercepte aussi les requêtes sous GitHub Pages (/event-hub/api/...)
    NEXT_PUBLIC_API_BASE_URL: "./api",
  }),
  staticDirs: ["../public"],
};

export default config;
