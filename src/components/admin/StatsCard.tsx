import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  colorScheme?: 'amber' | 'emerald' | 'blue' | 'purple' | 'red'
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'amber',
}: StatsCardProps) {
  const styles = {
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/60',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200/60',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/60',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200/60',
    },
  }[colorScheme]

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl ${styles.bg} ${styles.text} border ${styles.border} flex items-center justify-center shrink-0 shadow-xs`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}
