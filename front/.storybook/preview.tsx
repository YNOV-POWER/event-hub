import type { Preview } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupWorker } from "msw/browser";
import { mswLoader } from "msw-storybook-addon/csf3";
import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "../src/auth/auth-context";
import i18n from "../src/i18n";
import "../src/styles/tokens.css";
import "../src/styles/globals.css";

const preview: Preview = {
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker();
      await worker.start({
        serviceWorker: {
          url: "./mockServiceWorker.js",
        },
        onUnhandledRequest: "bypass",
      });
      return worker;
    }),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
    backgrounds: {
      default: "EventHub",
      values: [
        { name: "EventHub", value: "#F8FAFC" },
        { name: "Surface", value: "#FFFFFF" },
      ],
    },
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
        },
      });

      return (
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Story />
            </AuthProvider>
          </QueryClientProvider>
        </I18nextProvider>
      );
    },
  ],
};

export default preview;
