"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { UserRole } from "@/api/client";
import { useAuth } from "./auth-context";
import { ErrorState } from "@/components/ui/ErrorState";

export interface RouteGuardProps {
  readonly requiredRole?: UserRole;
  readonly children: ReactNode;
}

/**
 * Garde de route côté Front (Slide 116).
 * Améliore l'UX (redirection vers /login?next=… ou écran 403) mais ne remplace jamais
 * l'autorisation côté Back (qui reste l'unique autorité 401/403).
 */
export function RouteGuard({ requiredRole, children }: RouteGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/events");
      router.replace(`/login?next=${next}`);
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <ErrorState
        variant="forbidden"
        title={t("errors.forbiddenTitle")}
        description={t("errors.forbiddenDescription")}
        homeHref="/events"
        homeLabel={t("errors.backHome")}
      />
    );
  }

  return <>{children}</>;
}
