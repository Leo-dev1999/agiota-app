import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchLoan, updateLoanStatus, deleteLoan } from '../../api/loans.api'
import { markAsPaid } from '../../api/payments.api'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { formatCurrency, formatDate } from '../../utils/format'
import { BillingTypeLabel, BillingType, LoanStatus, PaymentType, PaymentTypeLabel } from '@agiota/shared'

function diffDays(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

function paymentTiming(dueDate: string, paidDate: string): { label: string; color: string } {
  const due = new Date(dueDate)
  const paid = new Date(paidDate)
  const diff = diffDays(paid, due)
  if (diff < 0) return { label: `${Math.abs(diff)} dia(s) adiantado`, color: 'text-blue-400' }
  if (diff === 0) return { label: 'Pago no dia', color: 'text-green-400' }
  return { label: `${diff} dia(s) de atraso`, color: 'text-red-400' }
}

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [payingPayment, setPayingPayment] = useState<any>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.JUROS)
  const [amortizationAmount, setAmortizationAmount] = useState('')
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [detailPayment, setDetailPayment] = useState<any>(null)

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => fetchLoan(id!),
  })

  function openPayModal(payment: any) {
    setPayingPayment(payment)
    setPaymentType(PaymentType.JUROS)
    setAmortizationAmount('')
    setPaidDate(new Date().toISOString().split('T')[0])
  }

  const interestDue = loan ? Math.round(loan.currentPrincipal * (loan.interestRate / 100) * 100) / 100 : 0
  const amortValue = parseFloat(amortizationAmount) || 0
  const totalToPay =
    paymentType === PaymentType.JUROS
      ? interestDue
      : paymentType === PaymentType.AMORTIZACAO
      ? interestDue + amortValue
      : interestDue + (loan?.currentPrincipal ?? 0)

  const markPaidMutation = useMutation({
    mutationFn: () =>
      markAsPaid(payingPayment.id, {
        paidDate,
        amountPaid: totalToPay,
        paymentType,
        amortizationAmount: paymentType === PaymentType.AMORTIZACAO ? amortValue : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan', id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['payments'] })
      setPayingPayment(null)
    },
  })

  const statusMutation = useMutation({
    mutationFn: (status: LoanStatus) => updateLoanStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loan', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteLoan(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      navigate('/emprestimos')
    },
  })

  if (isLoading) return <p className="text-gray-500">Carregando...</p>
  if (!loan) return <p className="text-red-400">Empréstimo não encontrado.</p>

  const paidPayments = loan.payments?.filter((p: any) => p.status === 'PAGO') ?? []
  // Total retornado = apenas juros recebidos (amortização/quitação não conta como retorno)
  const totalRetornado = paidPayments.reduce((s: number, p: any) => s + (p.interestPaid ?? 0), 0)
  const totalCount = loan.payments?.length ?? 0
  const isMensal = loan.billingType === BillingType.MENSAL

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/emprestimos" className="text-xs text-gray-500 hover:text-gray-300">
            ← Empréstimos
          </Link>
          <h1 className="text-xl font-bold mt-1">{loan.client?.name}</h1>
          <p className="text-sm text-gray-400">{BillingTypeLabel[loan.billingType as BillingType]}</p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      {/* Loan summary */}
      <div className="card grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Emprestado</p>
          <p className="font-bold text-lg">{formatCurrency(loan.principal)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total Retornado</p>
          <p className="font-bold text-lg text-green-400">{formatCurrency(totalRetornado)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Juros ({loan.interestRate}%)</p>
          <p className="font-medium text-yellow-400">{formatCurrency(interestDue)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Saldo Devedor</p>
          <p className={`font-medium ${loan.currentPrincipal > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {formatCurrency(loan.currentPrincipal)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Início</p>
          <p>{formatDate(loan.startDate)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Cobranças pagas</p>
          <p>{paidPayments.length}{!isMensal ? `/${totalCount}` : ''}</p>
        </div>
        {loan.referralContact && (
          <div className="col-span-2">
            <p className="text-gray-400 text-xs">Sociedade</p>
            <p>{loan.referralType === 'meia' ? '50% com ' : ''}{loan.referralContact}</p>
          </div>
        )}
        {loan.observations && (
          <div className="col-span-2">
            <p className="text-gray-400 text-xs">Observações</p>
            <p>{loan.observations}</p>
          </div>
        )}
      </div>

      {/* Payment schedule */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {isMensal ? 'Histórico de Cobranças' : 'Cronograma de Pagamentos'}
        </h2>
        <div className="space-y-2">
          {loan.payments?.map((payment: any) => {
            const isPaid = payment.status === 'PAGO'
            return (
              <div
                key={payment.id}
                onClick={isPaid ? () => setDetailPayment(payment) : undefined}
                className={`card flex items-center justify-between gap-3 transition-colors ${
                  payment.status === 'ATRASADO' ? 'border-red-500/30' : ''
                } ${isPaid ? 'cursor-pointer hover:border-gray-600' : ''}`}
              >
                <div>
                  <p className="text-sm">
                    {!isMensal && <span className="text-gray-400 mr-1">#{payment.installmentNo}</span>}
                    {formatCurrency(payment.amount)}
                    {isPaid && payment.paymentType && payment.paymentType !== 'JUROS' && (
                      <span className="ml-2 text-xs text-brand-400">
                        {PaymentTypeLabel[payment.paymentType as PaymentType]}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    Vencimento: {formatDate(payment.dueDate)}
                    {payment.paidDate && ` · Pago em: ${formatDate(payment.paidDate)}`}
                  </p>
                  {isPaid && payment.paidDate && (
                    <p className={`text-xs mt-0.5 ${paymentTiming(payment.dueDate, payment.paidDate).color}`}>
                      {paymentTiming(payment.dueDate, payment.paidDate).label}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={payment.status} />
                  {!isPaid && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openPayModal(payment) }}
                      className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {loan.status !== LoanStatus.QUITADO && (
          <button
            onClick={() => statusMutation.mutate(LoanStatus.QUITADO)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Marcar como Quitado
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('Excluir empréstimo? Esta ação não pode ser desfeita.')) deleteMutation.mutate()
          }}
          className="text-red-500 hover:text-red-400 text-sm px-4 py-2"
        >
          Excluir
        </button>
      </div>

      {/* Payment detail modal */}
      <Modal
        open={!!detailPayment}
        onClose={() => setDetailPayment(null)}
        title="Detalhes do Pagamento"
      >
        {detailPayment && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Vencimento" value={formatDate(detailPayment.dueDate)} />
              <DetailRow label="Pago em" value={detailPayment.paidDate ? formatDate(detailPayment.paidDate) : '—'} />
            </div>

            {detailPayment.paidDate && (
              <div className={`text-center py-2 rounded-lg text-sm font-medium ${
                paymentTiming(detailPayment.dueDate, detailPayment.paidDate).color
              } bg-gray-800`}>
                {paymentTiming(detailPayment.dueDate, detailPayment.paidDate).label}
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-3 space-y-2">
              <DetailRow
                label="Tipo de pagamento"
                value={PaymentTypeLabel[detailPayment.paymentType as PaymentType] ?? 'Só Juros'}
                highlight
              />
              <DetailRow
                label="Juros recebidos"
                value={formatCurrency(detailPayment.interestPaid ?? detailPayment.amountPaid ?? 0)}
              />
              {(detailPayment.principalPaid ?? 0) > 0 && (
                <DetailRow
                  label={detailPayment.paymentType === PaymentType.QUITACAO ? 'Saldo quitado' : 'Amortização'}
                  value={formatCurrency(detailPayment.principalPaid)}
                />
              )}
              <div className="border-t border-gray-700 pt-2">
                <DetailRow
                  label="Total recebido"
                  value={formatCurrency(detailPayment.amountPaid ?? 0)}
                  highlight
                />
              </div>
            </div>

            {detailPayment.notes && (
              <DetailRow label="Observações" value={detailPayment.notes} />
            )}
          </div>
        )}
      </Modal>

      {/* Pay modal */}
      <Modal
        open={!!payingPayment}
        onClose={() => setPayingPayment(null)}
        title="Registrar Pagamento"
      >
        {payingPayment && loan && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Saldo devedor</span>
                <span className="font-medium text-red-400">{formatCurrency(loan.currentPrincipal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Juros do período</span>
                <span className="font-medium text-yellow-400">{formatCurrency(interestDue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vencimento</span>
                <span>{formatDate(payingPayment.dueDate)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 block">Forma de Pagamento</label>
              <div className="space-y-2">
                {[PaymentType.JUROS, PaymentType.AMORTIZACAO, PaymentType.QUITACAO].map((type) => (
                  <label
                    key={type}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      paymentType === type
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value={type}
                      checked={paymentType === type}
                      onChange={() => { setPaymentType(type); setAmortizationAmount('') }}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <p className="text-sm font-medium">{PaymentTypeLabel[type]}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {type === PaymentType.JUROS && `Paga apenas os juros (${formatCurrency(interestDue)}). Saldo segue igual.`}
                        {type === PaymentType.AMORTIZACAO && 'Paga os juros + uma parte do saldo devedor.'}
                        {type === PaymentType.QUITACAO && `Paga os juros + todo saldo (${formatCurrency(interestDue + loan.currentPrincipal)}).`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {paymentType === PaymentType.AMORTIZACAO && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Valor da Amortização (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={loan.currentPrincipal}
                  value={amortizationAmount}
                  onChange={(e) => setAmortizationAmount(e.target.value)}
                  placeholder="Ex: 500,00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saldo restante após pagar: {formatCurrency(Math.max(0, loan.currentPrincipal - amortValue))}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 block mb-1">Data do Recebimento</label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-gray-400">Total a receber</span>
              <span className="text-lg font-bold text-green-400">{formatCurrency(totalToPay)}</span>
            </div>

            <button
              onClick={() => markPaidMutation.mutate()}
              disabled={
                markPaidMutation.isPending ||
                (paymentType === PaymentType.AMORTIZACAO && amortValue <= 0)
              }
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
            >
              {markPaidMutation.isPending ? 'Salvando...' : 'Confirmar Pagamento'}
            </button>
            {markPaidMutation.isError && (
              <p className="text-red-400 text-sm text-center">Erro ao registrar pagamento.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={highlight ? 'font-semibold text-white' : ''}>{value}</span>
    </div>
  )
}
