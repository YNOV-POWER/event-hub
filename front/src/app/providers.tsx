"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider, useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "@/auth/auth-context";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import i18n from "@/i18n";

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/events";
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {t("app.skipToContent")}
      </a>
      <Navbar currentPath={pathname} user={user} onSignOut={signOut} />
      <main id="main-content" className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
