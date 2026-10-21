import * as React from "react"
import { Loader2, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoadingStateProps {
  className?: string
  label?: string
}

// Загрузка блока или страницы
function LoadingState({ className, label }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex min-h-[240px] items-center justify-center", className)}
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}

interface EmptyStateProps {
  title: React.ReactNode
  icon?: LucideIcon
  action?: React.ReactNode
  className?: string
}

// Пусто: нет данных по фильтру, ничего не найдено
function EmptyState({ title, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg bg-secondary px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-card">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <p className="type-small text-muted-foreground">{title}</p>
      {action}
    </div>
  )
}

export { LoadingState, EmptyState }
