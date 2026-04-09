import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  LogOut,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/emprestimos', label: 'Empréstimos', icon: Wallet },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'JS'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-950">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900/95 border-r border-gray-800/60 shrink-0 shadow-dark">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-sm flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Jurista</h1>
              <p className="text-xs text-gray-500 leading-tight">Sistema</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 font-medium border border-brand-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/80 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-4 border-t border-gray-800/60 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs font-bold text-gray-200 flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm text-gray-400 truncate">{user?.username}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-ghost w-full justify-start gap-3 px-3 py-2 text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800/60 flex z-40 shadow-dark-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors ${
                  isActive ? 'text-brand-500' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
