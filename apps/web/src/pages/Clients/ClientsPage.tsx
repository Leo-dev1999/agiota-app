import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchClients, createClient } from '../../api/clients.api'
import { Modal } from '../../components/ui/Modal'
import { PhoneInput } from '../../components/ui/PhoneInput'
import { CepInput } from '../../components/ui/CepInput'
import { formatCurrency, formatPhone } from '../../utils/format'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientSchema, CreateClientInput } from '@agiota/shared'
import { LoanForm } from '../Loans/LoanForm'

export function ClientsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [createdClient, setCreatedClient] = useState<{ id: string; name: string } | null>(null)
  const [step, setStep] = useState<'form' | 'success' | 'loan'>('form')

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => fetchClients(search),
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateClientInput>({ resolver: zodResolver(createClientSchema) })

  // Estado local do endereço — CEP + rua auto-preenchida + número digitado
  const [addressStreet, setAddressStreet] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [cepError, setCepError] = useState('')

  function handleAddressFound(addr: { street: string; neighborhood: string; city: string; state: string }) {
    setAddressStreet(`${addr.street}, ${addr.neighborhood} - ${addr.city}/${addr.state}`)
    setCepError('')
  }

  function handleCepClear() {
    setAddressStreet('')
    setAddressNumber('')
    setValue('address', '')
  }

  function handleSubmitForm(data: CreateClientInput) {
    if (!addressStreet) {
      setCepError('CEP obrigatório — informe um CEP válido para continuar')
      return
    }
    const fullAddress = `${addressStreet}${addressNumber ? `, ${addressNumber}` : ''}`
    createMutation.mutate({ ...data, address: fullAddress })
  }

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: (client) => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      setCreatedClient({ id: client.id, name: client.name })
      setStep('success')
      reset()
    },
  })

  function handleCloseModal() {
    setShowForm(false)
    setStep('form')
    setCreatedClient(null)
    reset()
    handleCepClear()
    setCepError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Cliente
        </button>
      </div>

      <input
        type="search"
        placeholder="Buscar por nome ou telefone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
      />

      {isLoading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum cliente encontrado.</p>
      ) : (
        <div className="space-y-2">
          {clients.map((client: any) => {
            const activeLoans = client.loans ?? []
            const totalExposure = activeLoans.reduce((s: number, l: any) => s + l.principal, 0)
            return (
              <Link key={client.id} to={`/clientes/${client.id}`} className="card flex items-center justify-between gap-3 hover:border-gray-700 transition-colors block">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{client.name}</p>
                  <p className="text-xs text-gray-400">{formatPhone(client.phone)}</p>
                  {client.referredBy && (
                    <p className="text-xs text-gray-500">Indicado por: {client.referredBy}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-brand-500">{formatCurrency(totalExposure)}</p>
                  <p className="text-xs text-gray-400">{activeLoans.length} empréstimo(s) ativo(s)</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={handleCloseModal}
        title={
          step === 'form' ? 'Novo Cliente' :
          step === 'success' ? 'Cliente Cadastrado!' :
          `Nova Cobrança — ${createdClient?.name}`
        }
      >
        {step === 'form' && (
          <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
            <Field label="Nome *" error={errors.name?.message}>
              <input {...register('name')} placeholder="Nome completo" className="input" />
            </Field>

            <Field label="Telefone *" error={errors.phone?.message}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Field>

            <Field label="CEP *" error={cepError}>
              <CepInput onAddressFound={handleAddressFound} onClear={handleCepClear} />
            </Field>

            {/* Endereço auto-preenchido + Número lado a lado */}
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <label className="text-sm text-gray-400 block mb-1">Endereço</label>
                <input
                  readOnly
                  value={addressStreet}
                  placeholder="Preenchido automaticamente pelo CEP"
                  className={`input truncate ${addressStreet ? 'bg-gray-700 text-gray-300 cursor-not-allowed border-gray-600' : 'opacity-50'}`}
                />
              </div>
              <div className="w-24 shrink-0">
                <label className="text-sm text-gray-400 block mb-1">Número</label>
                <input
                  type="text"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  placeholder="Nº"
                  disabled={!addressStreet}
                  className={`input text-center ${!addressStreet ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <Field label="Indicação">
              <input {...register('referredBy')} placeholder="Nome de quem indicou" className="input" />
            </Field>

            <Field label="Observações">
              <textarea {...register('notes')} placeholder="Observações adicionais" rows={2} className="input" />
            </Field>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
            >
              {createMutation.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center py-2">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 mx-auto">
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-lg">{createdClient?.name}</p>
              <p className="text-sm text-gray-400 mt-1">Cliente cadastrado com sucesso.</p>
              <p className="text-sm text-gray-400">Deseja adicionar uma cobrança agora?</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCloseModal}
                className="border border-gray-700 hover:border-gray-600 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Agora não
              </button>
              <button
                onClick={() => setStep('loan')}
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Adicionar Cobrança
              </button>
            </div>
          </div>
        )}

        {step === 'loan' && createdClient && (
          <LoanForm
            clientId={createdClient.id}
            onSuccess={() => {
              qc.invalidateQueries({ queryKey: ['clients'] })
              handleCloseModal()
            }}
          />
        )}
      </Modal>
    </div>
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
