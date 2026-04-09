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
import {
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  Calendar,
  CalendarDays,
} from 'lucide-react'

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
        paymentType: 'JUROS' as const,
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
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da carteira</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Rodando"
          value={formatCurrency(summary?.totalActive ?? 0)}
          colorClass="text-brand-400"
          icon={TrendingUp}
          iconBg="bg-brand-500/10"
        />
        <StatCard
          title="Retornando este mês"
          value={formatCurrency(summary?.monthlyReturns ?? 0)}
          colorClass="text-green-400"
          icon={DollarSign}
          iconBg="bg-green-500/10"
        />
        <StatCard
          title="Vencimentos Hoje"
          value={String(summary?.dueTodayCount ?? 0)}
          colorClass={summary?.dueTodayCount ? 'text-yellow-400' : 'text-gray-400'}
          icon={CalendarClock}
          iconBg="bg-yellow-500/10"
        />
        <StatCard
          title="Em Atraso"
          value={String(summary?.overdueCount ?? 0)}
          colorClass={summary?.overdueCount ? 'text-red-400' : 'text-gray-400'}
          icon={AlertTriangle}
          iconBg="bg-red-500/10"
        />
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <section>
          <h2 className="section-title text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            Em Atraso
            <span className="ml-auto text-gray-600 font-normal normal-case tracking-normal text-xs">
              {overdue.length} {overdue.length === 1 ? 'parcela' : 'parcelas'}
            </span>
          </h2>
          <div className="space-y-2">
            {overdue.map((p: any) => (
              <PaymentRow
                key={p.id}
                payment={p}
                variant="overdue"
                onPay={() => { setPayingId(p.id); setPayingAmount(String(p.amount)) }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Today */}
      <section>
        <h2 className="section-title text-yellow-400">
          <Calendar className="w-3.5 h-3.5" />
          Vencimentos Hoje
          <span className="ml-auto text-gray-600 font-normal normal-case tracking-normal text-xs">
            {today.length} {today.length === 1 ? 'parcela' : 'parcelas'}
          </span>
        </h2>
        {today.length === 0 ? (
          <div className="card flex items-center gap-3 text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <p className="text-sm">Nenhum vencimento hoje</p>
          </div>
        ) : (
          <div className="space-y-2">
            {today.map((p: any) => (
              <PaymentRow
                key={p.id}
                payment={p}
                variant="today"
                onPay={() => { setPayingId(p.id); setPayingAmount(String(p.amount)) }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Tomorrow */}
      {tomorrow.length > 0 && (
        <section>
          <h2 className="section-title text-gray-400">
            <CalendarDays className="w-3.5 h-3.5" />
            Amanhã
            <span className="ml-auto text-gray-600 font-normal normal-case tracking-normal text-xs">
              {tomorrow.length} {tomorrow.length === 1 ? 'parcela' : 'parcelas'}
            </span>
          </h2>
          <div className="space-y-2">
            {tomorrow.map((p: any) => (
              <PaymentRow key={p.id} payment={p} variant="tomorrow" showPayButton={false} />
            ))}
          </div>
        </section>
      )}

      {/* Mark as paid modal */}
      <Modal open={!!payingId} onClose={() => setPayingId(null)} title="Registrar Pagamento">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Valor recebido (R$)</label>
            <input
              type="number"
              step="0.01"
              value={payingAmount}
              onChange={(e) => setPayingAmount(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={() => payingId && markPaidMutation.mutate(payingId)}
            disabled={!payingAmount || markPaidMutation.isPending}
            className="btn-success w-full"
          >
            {markPaidMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Pagamento
              </>
            )}
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
  variant = 'today',
}: {
  payment: any
  onPay?: () => void
  showPayButton?: boolean
  variant?: 'overdue' | 'today' | 'tomorrow'
}) {
  const client = payment.loan?.client
  const waLink = whatsappLink(
    client?.phone ?? '',
    `Olá ${client?.name}, hoje é dia do pagamento de ${formatCurrency(payment.amount)}!`
  )

  const leftBorder =
    variant === 'overdue'
      ? 'border-l-2 border-l-red-500/50'
      : variant === 'today'
      ? 'border-l-2 border-l-yellow-500/50'
      : 'border-l-2 border-l-gray-600/50'

  return (
    <div className={`card card-hover flex items-center justify-between gap-3 ${leftBorder}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{client?.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          <span className="font-medium text-gray-400">{formatCurrency(payment.amount)}</span>
          {' · '}vence {formatDate(payment.dueDate)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={payment.status} />
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-all duration-150"
          title="Abrir WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
        {showPayButton && (
          <button
            onClick={onPay}
            className="btn-success text-xs px-3 py-1.5 gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pago
          </button>
        )}
      </div>
    </div>
  )
}
