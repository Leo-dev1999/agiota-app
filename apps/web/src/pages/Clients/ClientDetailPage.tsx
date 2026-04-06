import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClient, deleteClient } from '../../api/clients.api'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate, formatPhone, whatsappLink } from '../../utils/format'
import { LoanForm } from '../Loans/LoanForm'
import { Modal } from '../../components/ui/Modal'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showLoanForm, setShowLoanForm] = useState(false)

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id!),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteClient(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      navigate('/clientes')
    },
  })

  if (isLoading) return <p className="text-gray-500">Carregando...</p>
  if (!client) return <p className="text-red-400">Cliente não encontrado.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/clientes" className="text-xs text-gray-500 hover:text-gray-300">
            ← Clientes
          </Link>
          <h1 className="text-2xl font-bold mt-1">{client.name}</h1>
          <a
            href={`tel:${client.phone}`}
            className="text-sm text-gray-400 hover:text-white"
          >
            {formatPhone(client.phone)}
          </a>
        </div>
        <div className="flex gap-2">
          <a
            href={whatsappLink(client.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            📱 WhatsApp
          </a>
          <button
            onClick={() => setShowLoanForm(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            + Empréstimo
          </button>
        </div>
      </div>

      {/* Client info */}
      <div className="card space-y-2 text-sm">
        {client.address && <p><span className="text-gray-400">Endereço:</span> {client.address}</p>}
        {client.referredBy && <p><span className="text-gray-400">Indicação:</span> {client.referredBy}</p>}
        {client.notes && <p><span className="text-gray-400">Obs:</span> {client.notes}</p>}
      </div>

      {/* Loans */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Empréstimos ({client.loans?.length ?? 0})
        </h2>
        {client.loans?.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum empréstimo ainda.</p>
        ) : (
          <div className="space-y-2">
            {client.loans?.map((loan: any) => (
              <Link
                key={loan.id}
                to={`/emprestimos/${loan.id}`}
                className="card flex items-center justify-between hover:border-gray-700 transition-colors block"
              >
                <div>
                  <p className="text-sm font-medium">{formatCurrency(loan.principal)} emprestado</p>
                  <p className="text-xs text-gray-400">
                    Retorno: {formatCurrency(loan.totalReturn)} · {loan.billingType}
                  </p>
                  <p className="text-xs text-gray-500">
                    Início: {formatDate(loan.startDate)}
                  </p>
                </div>
                <StatusBadge status={loan.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={() => {
          if (confirm(`Desativar cliente ${client.name}?`)) deleteMutation.mutate()
        }}
        className="text-xs text-red-500 hover:text-red-400"
      >
        Desativar cliente
      </button>

      <Modal open={showLoanForm} onClose={() => setShowLoanForm(false)} title="Novo Empréstimo">
        <LoanForm clientId={id!} onSuccess={() => {
          setShowLoanForm(false)
          qc.invalidateQueries({ queryKey: ['client', id] })
        }} />
      </Modal>
    </div>
  )
}
