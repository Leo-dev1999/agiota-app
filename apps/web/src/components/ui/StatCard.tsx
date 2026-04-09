import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  colorClass?: string
  icon?: LucideIcon
  iconBg?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({
  title,
  value,
  subtitle,
  colorClass = 'text-white',
  icon: Icon,
  iconBg = 'bg-gray-800',
}: StatCardProps) {
  return (
    <div className="card group hover:border-gray-700 hover:shadow-dark transition-all duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider leading-tight">
          {title}
        </p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold leading-none ${colorClass}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-600 mt-1.5">{subtitle}</p>
      )}
    </div>
  )
}
