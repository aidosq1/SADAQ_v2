import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconTile } from "@/components/ui/icon-tile"

interface StatProps {
  value: string
  label: string
  icon?: LucideIcon
  align?: "start" | "center"
  tone?: "default" | "inverse"
  className?: string
}

// Цифра федерации: значение крупно, подпись мелко, иконка — по желанию
function Stat({ value, label, icon, align = "start", tone = "default", className }: StatProps) {
  const inverse = tone === "inverse"

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {icon && <IconTile icon={icon} size="sm" tone={tone} className="mb-2" />}
      <div className={cn("type-number text-3xl md:text-4xl", inverse ? "text-white" : "text-foreground")}>
        {value}
      </div>
      <div className={cn("type-small", inverse ? "text-white/70" : "text-muted-foreground")}>{label}</div>
    </div>
  )
}

export { Stat }
