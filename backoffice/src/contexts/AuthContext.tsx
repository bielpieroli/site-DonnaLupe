import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MOCK_USERS } from "@/mocks/users";
type AuthUser = {
  email: string;
  name: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
};

const storageKey = "semcomp-backoffice-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthUser;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(storageKey, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      login: (email: string, password: string) => {
        const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
        if (!user) {
          return "Credenciais inválidas.";
        }

        const normalizedEmail = email.trim().toLowerCase();
        const fallbackName = normalizedEmail.split("@")[0] || "Administrador";

        setUser({
          email: normalizedEmail,
          name: fallbackName
            .split(/[._-]/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ") || "Administrador",
        });

        return null;
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}