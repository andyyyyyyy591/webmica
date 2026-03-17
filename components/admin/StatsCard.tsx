import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  className?: string
}

export function StatsCard({ title, value, icon: Icon, className }: StatsCardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-5', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-lg bg-violet-50 p-2">
          <Icon className="h-5 w-5 text-violet-600" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
