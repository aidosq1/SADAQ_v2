import { cn } from "@/lib/utils"

const MEDAL_CLASSES: Record<number, string> = {
  1: "bg-medal-gold text-primary",
  2: "bg-medal-silver text-primary",
  3: "bg-medal-bronze text-white",
}

interface RankBadgeProps {
  position: number
  className?: string
}

// Место в рейтинге: 1–3 — медальные цвета, остальные — кремовый круг
function RankBadge({ position, className }: RankBadgeProps) {
  return (
    <span
      className={cn(
        "type-number inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm",
        MEDAL_CLASSES[position] ?? "bg-secondary text-primary",
        className
      )}
    >
      {position}
    </span>
  )
}

export { RankBadge }
