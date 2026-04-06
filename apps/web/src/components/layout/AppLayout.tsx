import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/emprestimos', label: 'Empréstimos', icon: '💰' },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙️' },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-900 border-r border-gray-800 p-4 gap-1 shrink-0">
        <div className="mb-6 px-2">
          <h1 className="text-xl font-bold text-brand-500">Jurista System</h1>
          <p className="text-xs text-gray-600 mt-0.5">{user?.username}</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-500/20 text-brand-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Logout no rodapé da sidebar */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive ? 'text-brand-500' : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
