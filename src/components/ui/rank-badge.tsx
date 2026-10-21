import { cn } from "@/lib/utils"

const MEDAL_CLASSES: Record<number, string> = {
  1: "bg-medal-gold text-foreground",
  2: "bg-medal-silver text-foreground",
  3: "bg-medal-bronze text-white",
}

interface RankBadgeProps {
  position: number
  className?: string
}

// Место в рейтинге: 1–3 — медальный круг, остальные — просто число
function RankBadge({ position, className }: RankBadgeProps) {
  const medal = MEDAL_CLASSES[position]

  return (
    <span
      className={cn(
        "type-number inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm",
        medal ?? "text-muted-foreground",
        className
      )}
    >
      {position}
    </span>
  )
}

export { RankBadge }
