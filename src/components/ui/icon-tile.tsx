import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const sizes = {
  sm: "size-9 [&>svg]:size-4",
  md: "size-11 [&>svg]:size-5",
  lg: "size-14 [&>svg]:size-6",
} as const

interface IconTileProps {
  icon: LucideIcon
  size?: keyof typeof sizes
  className?: string
}

// Иконка в кремовом круге: статистика, контакты, быстрые ссылки
function IconTile({ icon: Icon, size = "md", className }: IconTileProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-secondary text-primary",
        sizes[size],
        className
      )}
    >
      <Icon aria-hidden="true" />
    </span>
  )
}

export { IconTile }
