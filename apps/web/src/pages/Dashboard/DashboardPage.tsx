import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDashboardSummary } from '../../api/dashboard.api'
import {
  fetchTodayPayments,
  fetchTomorrowPayments,
  fetchOverduePayments,
  markAsPaid,
} from '../../api/payments.api'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate, whatsappLink } from '../../utils/format'
import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'

export function DashboardPage() {
  const qc = useQueryClient()
  const { data: summary } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 60_000,
  })
  const { data: today = [] } = useQuery({ queryKey: ['payments', 'today'], queryFn: fetchTodayPayments })
  const { data: tomorrow = [] } = useQuery({ queryKey: ['payments', 'tomorrow'], queryFn: fetchTomorrowPayments })
  const { data: overdue = [] } = useQuery({ queryKey: ['payments', 'overdue'], queryFn: fetchOverduePayments })

  const [payingId, setPayingId] = useState<string | null>(null)
  const [payingAmount, setPayingAmount] = useState('')

  const markPaidMutation = useMutation({
    mutationFn: (id: string) =>
      markAsPaid(id, {
        paidDate: new Date().toISOString().split('T')[0],
        amountPaid: parseFloat(payingAmount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setPayingId(null)
      setPayingAmount('')
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Rodando"
          value={formatCurrency(summary?.totalActive ?? 0)}
          colorClass="text-brand-500"
        />
        <StatCard
          title="Retornando este mês"
          value={formatCurrency(summary?.monthlyReturns ?? 0)}
          colorClass="text-green-400"
        />
        <StatCard
          title="Vencimentos Hoje"
          value={String(summary?.dueTodayCount ?? 0)}
          colorClass={summary?.dueTodayCount ? 'text-yellow-400' : 'text-white'}
        />
        <StatCard
          title="Em Atraso"
          value={String(summary?.overdueCount ?? 0)}
          colorClass={summary?.overdueCount ? 'text-red-400' : 'text-white'}
        />
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
            🔴 Em Atraso ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((p: any) => (
              <PaymentRow key={p.id} payment={p} onPay={() => { setPayingId(p.id); setPayingAmount(String(p.amount)) }} />
            ))}
          </div>
        </section>
      )}

      {/* Today */}
      <section>
        <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-2">
          📅 Vencimentos Hoje ({today.length})
        </h2>
        {today.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum vencimento hoje ✓</p>
        ) : (
          <div className="space-y-2">
            {today.map((p: any) => (
              <PaymentRow key={p.id} payment={p} onPay={() => { setPayingId(p.id); setPayingAmount(String(p.amount)) }} />
            ))}
          </div>
        )}
      </section>

      {/* Tomorrow */}
      {tomorrow.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            📆 Amanhã ({tomorrow.length})
          </h2>
          <div className="space-y-2">
            {tomorrow.map((p: any) => (
              <PaymentRow key={p.id} payment={p} showPayButton={false} />
            ))}
          </div>
        </section>
      )}

      {/* Mark as paid modal */}
      <Modal open={!!payingId} onClose={() => setPayingId(null)} title="Registrar Pagamento">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Valor recebido (R$)</label>
            <input
              type="number"
              step="0.01"
              value={payingAmount}
              onChange={(e) => setPayingAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            onClick={() => payingId && markPaidMutation.mutate(payingId)}
            disabled={!payingAmount || markPaidMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {markPaidMutation.isPending ? 'Salvando...' : 'Confirmar Pagamento'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function PaymentRow({
  payment,
  onPay,
  showPayButton = true,
}: {
  payment: any
  onPay?: () => void
  showPayButton?: boolean
}) {
  const client = payment.loan?.client
  const waLink = whatsappLink(client?.phone ?? '', `Olá ${client?.name}, hoje é dia do pagamento de ${formatCurrency(payment.amount)}!`)

  return (
    <div className="card flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{client?.name}</p>
        <p className="text-xs text-gray-400">
          {formatCurrency(payment.amount)} · vence {formatDate(payment.dueDate)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={payment.status} />
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 text-lg"
          title="Abrir WhatsApp"
        >
          📱
        </a>
        {showPayButton && (
          <button
            onClick={onPay}
            className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            Pago ✓
          </button>
        )}
      </div>
    </div>
  )
}
