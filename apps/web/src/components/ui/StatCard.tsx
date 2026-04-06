interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  colorClass?: string
}

export function StatCard({ title, value, subtitle, colorClass = 'text-white' }: StatCardProps) {
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  )
}
