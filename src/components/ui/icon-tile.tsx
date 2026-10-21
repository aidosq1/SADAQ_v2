import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const sizes = {
  sm: "size-9 rounded-md [&>svg]:size-4",
  md: "size-11 rounded-lg [&>svg]:size-5",
  lg: "size-14 rounded-xl [&>svg]:size-6",
} as const

const tones = {
  default: "bg-primary-soft text-primary",
  inverse: "bg-white/10 text-gold",
} as const

interface IconTileProps {
  icon: LucideIcon
  size?: keyof typeof sizes
  tone?: keyof typeof tones
  className?: string
}

// Иконка на мягкой бордовой подложке: статистика, контакты, быстрые ссылки
function IconTile({ icon: Icon, size = "md", tone = "default", className }: IconTileProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", sizes[size], tones[tone], className)}>
      <Icon aria-hidden="true" />
    </span>
  )
}

export { IconTile }
