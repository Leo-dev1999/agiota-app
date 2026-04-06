import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchLoans } from '../../api/loans.api'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { LoanForm } from './LoanForm'
import { formatCurrency, formatDate } from '../../utils/format'
import { BillingTypeLabel, BillingType, LoanStatus } from '@agiota/shared'

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: LoanStatus.PENDENTE, label: 'Pendente' },
  { value: LoanStatus.ATRASADO, label: 'Atrasado' },
  { value: LoanStatus.PAGO, label: 'Pago' },
  { value: LoanStatus.QUITADO, label: 'Quitado' },
]

export function LoansPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [billingType, setBillingType] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', status, billingType],
    queryFn: () => fetchLoans({ status: status || undefined, billingType: billingType || undefined }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empréstimos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                status === opt.value
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={billingType}
          onChange={(e) => setBillingType(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1 text-xs text-gray-300 focus:outline-none"
        >
          <option value="">Todos os tipos</option>
          {Object.values(BillingType).map((t) => (
            <option key={t} value={t}>{BillingTypeLabel[t]}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : loans.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum empréstimo encontrado.</p>
      ) : (
        <div className="space-y-2">
          {loans.map((loan: any) => {
            const nextPayment = loan.payments?.[0]
            return (
              <Link
                key={loan.id}
                to={`/emprestimos/${loan.id}`}
                className="card flex items-center justify-between gap-3 hover:border-gray-700 transition-colors block"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{loan.client?.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(loan.principal)} → {formatCurrency(loan.totalReturn)}
                    {' · '}{BillingTypeLabel[loan.billingType as BillingType] ?? loan.billingType}
                  </p>
                  {nextPayment && (
                    <p className="text-xs text-gray-500">
                      Próx. venc.: {formatDate(nextPayment.dueDate)} · {formatCurrency(nextPayment.amount)}
                    </p>
                  )}
                </div>
                <StatusBadge status={loan.status} />
              </Link>
            )
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Novo Empréstimo">
        <LoanForm
          onSuccess={() => {
            setShowForm(false)
            qc.invalidateQueries({ queryKey: ['loans'] })
          }}
        />
      </Modal>
    </div>
  )
}
