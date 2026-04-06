import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthUser {
  userId: string
  username: string
  role: string
  tenantId: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  signIn: (token: string, user: AuthUser) => void
  signOut: () => void
  isAuthenticated: boolean
  isMaster: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage(): { user: AuthUser | null; token: string | null } {
  try {
    const token = localStorage.getItem('auth_token')
    const raw = localStorage.getItem('auth_user')
    const user = raw ? (JSON.parse(raw) as AuthUser) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage()
  const [token, setToken] = useState<string | null>(stored.token)
  const [user, setUser] = useState<AuthUser | null>(stored.user)

  const signIn = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      signIn,
      signOut,
      isAuthenticated: !!token && !!user,
      isMaster: user?.role === 'master',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
