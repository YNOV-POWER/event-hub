"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@/api/client";
import { configureHttpClient } from "@/api/http";

export interface AuthUser {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: UserRole;
}

interface AuthSession {
  readonly token: string;
  readonly user: AuthUser;
}

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly sessionExpired: boolean;
  readonly signInDemo: (role: UserRole) => void;
  readonly signOut: () => void;
  readonly clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USERS: Record<UserRole, AuthUser> = {
  PARTICIPANT: {
    id: "00000000-0000-4000-8100-000000000003",
    displayName: "Ada",
    email: "ada@example.com",
    role: "PARTICIPANT",
  },
  ORGANIZER: {
    id: "00000000-0000-4000-8100-000000000001",
    displayName: "Grace",
    email: "grace@example.com",
    role: "ORGANIZER",
  },
};

/**
 * État client partagé (non serveur) : session utilisateur courante.
 * Les données métier (événements, inscriptions) vivent uniquement dans TanStack Query.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const signInDemo = useCallback((role: UserRole) => {
    setSession({
      token: `demo-jwt-${role.toLowerCase()}`,
      user: DEMO_USERS[role],
    });
    setSessionExpired(false);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  useEffect(() => {
    configureHttpClient({
      getToken: () => session?.token ?? null,
      onUnauthorized: () => {
        setSession(null);
        setSessionExpired(true);
      },
    });
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      sessionExpired,
      signInDemo,
      signOut,
      clearSessionExpired,
    }),
    [session, sessionExpired, signInDemo, signOut, clearSessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
