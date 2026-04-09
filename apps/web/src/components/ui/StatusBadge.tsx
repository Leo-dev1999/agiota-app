import { LoanStatus, LoanStatusLabel } from '@agiota/shared'

const config: Record<string, { dot: string; badge: string }> = {
  PENDENTE: {
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
  },
  PAGO: {
    dot: 'bg-green-400',
    badge: 'bg-green-500/10 text-green-400 border-green-500/25',
  },
  QUITADO: {
    dot: 'bg-gray-500',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/25',
  },
  ATRASADO: {
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/25',
  },
}

export function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? config.PENDENTE
  return (
    <span className={`badge ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
      {LoanStatusLabel[status as LoanStatus] ?? status}
    </span>
  )
}
