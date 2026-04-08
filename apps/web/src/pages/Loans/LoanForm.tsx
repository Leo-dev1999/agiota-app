import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createLoanSchema, CreateLoanInput, BillingType, BillingTypeLabel, calculateLoan } from '@agiota/shared'
import { createLoan } from '../../api/loans.api'
import { fetchClients } from '../../api/clients.api'
import { formatCurrency } from '../../utils/format'
import { useWatch } from 'react-hook-form'

interface LoanFormProps {
  clientId?: string
  onSuccess: () => void
}

export function LoanForm({ clientId, onSuccess }: LoanFormProps) {
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
    enabled: !clientId,
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateLoanInput>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      clientId: clientId ?? '',
      interestRate: 30,
      billingType: BillingType.MENSAL,
      startDate: new Date().toISOString().split('T')[0],
      referralType: undefined,
    },
  })

  const principal = watch('principal')
  const interestRate = watch('interestRate')
  const billingType = watch('billingType')
  const referralType = watch('referralType')

  const isSocio = referralType === 'meia'

  // Quando é 50%, o valor digitado é a metade — o total ao cliente é o dobro
  const principalDisplay = principal ?? 0
  const principalTotal = isSocio ? principalDisplay * 2 : principalDisplay

  const calc = principalTotal && interestRate ? calculateLoan(principalTotal, interestRate) : null

  const mutation = useMutation({
    mutationFn: (data: CreateLoanInput) => {
      // Se sociedade 50%, envia o dobro como principal (valor total ao cliente)
      const payload = isSocio
        ? { ...data, principal: data.principal * 2 }
        : data
      return createLoan(payload)
    },
    onSuccess,
  })

  return (
    <form onSubmit={handleSubmit((d: CreateLoanInput) => mutation.mutate(d))} className="space-y-4">
      {!clientId && (
        <Field label="Cliente *" error={errors.clientId?.message}>
          <select {...register('clientId')} className="input">
            <option value="">Selecione o cliente</option>
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field
          label={isSocio ? 'Minha parte (R$) *' : 'Valor Emprestado (R$) *'}
          error={errors.principal?.message}
        >
          <input
            {...register('principal', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0,00"
            className="input"
          />
        </Field>
        <Field label="Taxa de Juros (%) *" error={errors.interestRate?.message}>
          <input
            {...register('interestRate', { valueAsNumber: true })}
            type="number"
            step="0.1"
            className="input"
          />
        </Field>
      </div>

      {/* Live calculation preview */}
      {calc && (
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-xs text-gray-400">Juros do cliente</p>
              <p className="font-medium text-yellow-400">{formatCurrency(calc.interestAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total ao cliente</p>
              <p className="font-medium text-green-400">{formatCurrency(calc.totalReturn)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Juros x2</p>
              <p className="font-medium text-gray-300">{formatCurrency(calc.interestAmountX2)}</p>
            </div>
          </div>
          {isSocio && (
            <div className="border-t border-gray-700 pt-2 grid grid-cols-2 gap-2 text-center text-sm">
              <div>
                <p className="text-xs text-gray-400">Capital total</p>
                <p className="font-medium">{formatCurrency(principalTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-400 font-semibold">Sua parte dos juros</p>
                <p className="font-bold text-brand-400">{formatCurrency(calc.interestAmount / 2)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Field label="Tipo de Cobrança *" error={errors.billingType?.message}>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(BillingType).map((type) => (
            <label
              key={type}
              className={`flex items-center justify-center py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                billingType === type
                  ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <input {...register('billingType')} type="radio" value={type} className="sr-only" />
              {BillingTypeLabel[type]}
            </label>
          ))}
        </div>
      </Field>

      {billingType === BillingType.MENSAL && (
        <Field label="Dia do Vencimento (1-31) *" error={errors.paymentDayOfMonth?.message}>
          <input
            {...register('paymentDayOfMonth', { valueAsNumber: true })}
            type="number"
            min={1}
            max={31}
            placeholder="Ex: 10"
            className="input"
          />
        </Field>
      )}

      {(billingType === BillingType.DIARIA ||
        billingType === BillingType.SEMANAL ||
        billingType === BillingType.PARCELADO) && (
        <Field
          label={
            billingType === BillingType.DIARIA
              ? 'Quantidade de Dias *'
              : billingType === BillingType.SEMANAL
              ? 'Quantidade de Semanas *'
              : 'Número de Parcelas *'
          }
          error={errors.installments?.message}
        >
          <input
            {...register('installments', { valueAsNumber: true })}
            type="number"
            min={1}
            placeholder="Ex: 4"
            className="input"
          />
        </Field>
      )}

      <Field label="Data de Início">
        <input {...register('startDate')} type="date" className="input" />
      </Field>

      {/* Sociedade */}
      <Field label="Sociedade">
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: '', label: 'Total (só eu)' },
            { value: 'meia', label: '50% com sócio' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center justify-center py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                referralType === opt.value
                  ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <input {...register('referralType')} type="radio" value={opt.value} className="sr-only" />
              {opt.label}
            </label>
          ))}
        </div>
      </Field>

      {isSocio && (
        <Field label="Nome do sócio *">
          <input
            {...register('referralContact')}
            placeholder="Ex: Carlos, Tico..."
            className="input"
          />
        </Field>
      )}

      <Field label="Observações">
        <textarea {...register('observations')} rows={2} placeholder="Observações adicionais" className="input" />
      </Field>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
      >
        {mutation.isPending ? 'Salvando...' : 'Criar Empréstimo'}
      </button>
      {mutation.isError && (
        <p className="text-red-400 text-sm text-center">Erro ao salvar. Verifique os dados.</p>
      )}
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
