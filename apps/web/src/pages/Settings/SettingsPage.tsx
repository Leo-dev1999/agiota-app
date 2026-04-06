import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '../../api/client'
import { useEffect } from 'react'

export function SettingsPage() {
  const qc = useQueryClient()

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
  })

  const { register, handleSubmit, reset } = useForm({
    defaultValues: settings,
  })

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch('/settings', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      alert('Configurações salvas!')
    },
  })

  const testMutation = useMutation({
    mutationFn: (phone: string) =>
      api.post('/notifications/test', { phone, message: 'Teste do Agiota App! ✅ Notificações configuradas com sucesso.' }),
    onSuccess: () => alert('Mensagem de teste enviada!'),
    onError: () => alert('Erro ao enviar. Verifique as configurações do WhatsApp.'),
  })

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        {/* Interest rate */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm text-gray-300">Padrões</h2>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Taxa de Juros Padrão (%)</label>
            <input
              {...register('defaultInterestRate', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="input w-40"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-300">WhatsApp (Evolution API)</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('whatsappEnabled')} type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-gray-400">Ativo</span>
            </label>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">URL da API</label>
            <input
              {...register('whatsappApiUrl')}
              placeholder="http://localhost:8080"
              className="input"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">API Key</label>
            <input
              {...register('whatsappApiKey')}
              type="password"
              placeholder="••••••••"
              className="input"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Nome da Instância</label>
            <input
              {...register('whatsappInstance')}
              placeholder="agiota"
              className="input"
            />
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
              <input {...register('notifyDayBefore')} type="checkbox" className="w-4 h-4" />
              Notificar dia anterior
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
              <input {...register('notifyOnDueDate')} type="checkbox" className="w-4 h-4" />
              Notificar no dia
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              const phone = prompt('Digite o número para teste (ex: 11999999999):')
              if (phone) testMutation.mutate(phone)
            }}
            className="text-sm text-green-400 hover:text-green-300 border border-green-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            📱 Enviar mensagem de teste
          </button>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  )
}
