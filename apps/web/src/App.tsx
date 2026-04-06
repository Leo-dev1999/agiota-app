import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { ClientsPage } from './pages/Clients/ClientsPage'
import { ClientDetailPage } from './pages/Clients/ClientDetailPage'
import { LoansPage } from './pages/Loans/LoansPage'
import { LoanDetailPage } from './pages/Loans/LoanDetailPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import { LoginPage } from './pages/Auth/LoginPage'
import { LandingPage } from './pages/Auth/LandingPage'
import { AdminPage } from './pages/Admin/AdminPage'
import { useAuth } from './contexts/AuthContext'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isMaster } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isMaster) return <Navigate to="/admin" replace />
  return <>{children}</>
}

function RequireMaster({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isMaster } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isMaster) return <Navigate to="/" replace />
  return <>{children}</>
}

function RedirectIfAuth() {
  const { isAuthenticated, isMaster } = useAuth()
  if (isAuthenticated) return <Navigate to={isMaster ? '/admin' : '/'} replace />
  return null
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route
        path="/login"
        element={
          <>
            <RedirectIfAuth />
            <LoginPage />
          </>
        }
      />
      <Route path="/sobre" element={<LandingPage />} />

      {/* Master */}
      <Route path="/admin" element={<RequireMaster><AdminPage /></RequireMaster>} />

      {/* Tenant */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/:id" element={<ClientDetailPage />} />
        <Route path="/emprestimos" element={<LoansPage />} />
        <Route path="/emprestimos/:id" element={<LoanDetailPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
