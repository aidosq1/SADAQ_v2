import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconTile } from "@/components/ui/icon-tile"

interface StatProps {
  value: string
  label: string
  icon?: LucideIcon
  className?: string
}

// Цифра федерации: иконка, значение, подпись
function Stat({ value, label, icon, className }: StatProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      {icon && <IconTile icon={icon} />}
      <div className="type-number text-2xl text-primary md:text-3xl">{value}</div>
      <div className="type-eyebrow text-muted-foreground">{label}</div>
    </div>
  )
}

export { Stat }
