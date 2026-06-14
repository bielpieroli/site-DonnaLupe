import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authAPI, permissionsAPI } from '@/api'
import { TOKEN_KEY } from '@/api/client'
import type { AuthUser, Permission, StoredSession } from '@/types/APIResponseType'

type AuthContextValue = {
  isAuthenticated: boolean
  user: AuthUser | null
  permissions: Permission[]
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
}

const SESSION_KEY = 'semcomp-backoffice-auth'

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): { user: AuthUser; permissions: Permission[] } | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<StoredSession>
    if (!data.email) return null
    return {
      user: { email: data.email, name: data.name ?? data.email },
      permissions: data.permissions ?? [],
    }
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function deriveDisplayName(email: string): string {
  const prefix = email.trim().toLowerCase().split('@')[0] ?? 'Administrador'
  return (
    prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ') || 'Administrador'
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = readStoredSession()
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null)
  const [permissions, setPermissions] = useState<Permission[]>(stored?.permissions ?? [])

  // Persist session to localStorage whenever user or permissions change.
  useEffect(() => {
    if (!user) {
      window.localStorage.removeItem(SESSION_KEY)
      window.localStorage.removeItem(TOKEN_KEY)
      return
    }
    const session: StoredSession = {
      email: user.email,
      name: user.name,
      token: window.localStorage.getItem(TOKEN_KEY) ?? '',
      permissions,
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }, [user, permissions])

  // Refresh permissions from the API on every mount so new resources added
  // to the backend are reflected without requiring the user to re-login.
  useEffect(() => {
    if (!user) return
    permissionsAPI.getByUser(user.email)
      .then((res) => setPermissions(res.permissions))
      .catch(() => { /* keep cached permissions on error */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      user,
      permissions,

      login: async (email: string, password: string): Promise<string | null> => {
        try {
          const res = await authAPI.login(email, password)
          // TOKEN_KEY já foi persistido dentro de authAPI.login()
          const name = deriveDisplayName(res.user.email)
          setPermissions(res.permissions)
          setUser({ email: res.user.email, name })
          return null
        } catch (err) {
          if (err instanceof Error) return err.message
          return 'Erro inesperado ao fazer login'
        }
      },

      logout: () => {
        setUser(null)
        setPermissions([])
        window.localStorage.removeItem(SESSION_KEY)
        window.localStorage.removeItem(TOKEN_KEY)
      },
    }),
    [user, permissions],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useHasPermission(resource: string, level: 'read' | 'write'): boolean {
  const { permissions } = useAuth()
  const order = { none: 0, read: 1, write: 2 } as const
  const perm = permissions.find((p) => p.resource === resource)
  return (order[perm?.level ?? 'none'] ?? 0) >= order[level]
}
