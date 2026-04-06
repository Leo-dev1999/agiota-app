import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { fetchAdminUsers, fetchAdminTenants, createAdminUser, toggleAdminUser, changeAdminPassword } from '../../api/auth.api'
import { Modal } from '../../components/ui/Modal'

export function AdminPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newTenantId, setNewTenantId] = useState('')
  const [newRole, setNewRole] = useState<'tenant' | 'master'>('tenant')
  const [changingPasswordId, setChangingPasswordId] = useState<string | null>(null)
  const [newPwd, setNewPwd] = useState('')

  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: fetchAdminUsers })
  const { data: tenants = [] } = useQuery({ queryKey: ['admin-tenants'], queryFn: fetchAdminTenants })

  const createMutation = useMutation({
    mutationFn: () => createAdminUser({ username: newUsername, password: newPassword, role: newRole, tenantId: newTenantId || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowCreate(false)
      setNewUsername(''); setNewPassword(''); setNewTenantId(''); setNewRole('tenant')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleAdminUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const pwdMutation = useMutation({
    mutationFn: () => changeAdminPassword(changingPasswordId!, newPwd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setChangingPasswordId(null)
      setNewPwd('')
    },
  })

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold">Jurista System</span>
          <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">Master</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.username}</span>
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-red-400 transition-colors">
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Usuários */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Usuários</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Novo Usuário
            </button>
          </div>
          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{u.username}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'master' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {u.role}
                    </span>
                    {!u.isActive && <span className="text-xs text-red-400">Inativo</span>}
                  </div>
                  {u.tenant && <p className="text-xs text-gray-500 mt-0.5">Tenant: {u.tenant.name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setChangingPasswordId(u.id); setNewPwd('') }}
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Trocar senha
                  </button>
                  <button
                    onClick={() => toggleMutation.mutate(u.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700' : 'text-green-400 hover:text-green-300 border border-green-900 hover:border-green-700'}`}
                  >
                    {u.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tenants */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Tenants cadastrados</h2>
          <div className="space-y-2">
            {tenants.map((t: any) => (
              <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-gray-500">ID: {t.id} · {t.ownerName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {t.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal criar usuário */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Usuário">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Usuário</label>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="ex: joao" className="input" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Senha</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="mínimo 4 caracteres" className="input" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Perfil</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="input">
              <option value="tenant">Tenant (usuário comum)</option>
              <option value="master">Master (administrador)</option>
            </select>
          </div>
          {newRole === 'tenant' && (
            <div>
              <label className="text-sm text-gray-400 block mb-1">Tenant ID</label>
              <select value={newTenantId} onChange={(e) => setNewTenantId(e.target.value)} className="input">
                <option value="">Selecione o tenant</option>
                {tenants.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !newUsername || !newPassword || (newRole === 'tenant' && !newTenantId)}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {createMutation.isPending ? 'Criando...' : 'Criar Usuário'}
          </button>
          {createMutation.isError && <p className="text-red-400 text-sm text-center">Erro ao criar usuário.</p>}
        </div>
      </Modal>

      {/* Modal trocar senha */}
      <Modal open={!!changingPasswordId} onClose={() => setChangingPasswordId(null)} title="Trocar Senha">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Nova senha</label>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="mínimo 4 caracteres" className="input" />
          </div>
          <button
            onClick={() => pwdMutation.mutate()}
            disabled={pwdMutation.isPending || newPwd.length < 4}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {pwdMutation.isPending ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
