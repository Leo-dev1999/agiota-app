import { LoanStatus, LoanStatusLabel } from '@agiota/shared'

const colors: Record<string, string> = {
  PENDENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAGO: 'bg-green-500/20 text-green-400 border-green-500/30',
  QUITADO: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ATRASADO: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[status] ?? colors.PENDENTE}`}
    >
      {LoanStatusLabel[status as LoanStatus] ?? status}
    </span>
  )
}
