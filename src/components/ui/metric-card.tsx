import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cardSurface } from "@/components/ui/card"

const tones = {
  default: { value: "text-foreground", icon: "bg-secondary text-primary" },
  warning: { value: "text-warning", icon: "bg-warning-soft text-warning" },
  success: { value: "text-success", icon: "bg-success-soft text-success" },
  destructive: { value: "text-destructive", icon: "bg-destructive/10 text-destructive" },
} as const

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: keyof typeof tones
  className?: string
}

// Счётчик в админке: всего заявок, на проверке, новостей и т.п.
function MetricCard({ label, value, icon: Icon, tone = "default", className }: MetricCardProps) {
  const toneClasses = tones[tone]

  return (
    <div className={cn(cardSurface, "flex items-center gap-4 p-4", className)}>
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", toneClasses.icon)}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className={cn("type-number text-2xl", toneClasses.value)}>{value}</p>
        <p className="type-small truncate text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export { MetricCard }
