import { cn } from "@/lib/utils"
import { formatDayAndShortMonth } from "@/lib/date-format"

interface DateTileProps {
  date: string | Date
  locale: string
  tone?: "default" | "inverse"
  className?: string
}

// Дата старта плиткой: крупное число и месяц. Календарь, ближайший турнир
function DateTile({ date, locale, tone = "default", className }: DateTileProps) {
  const value = typeof date === "string" ? new Date(date) : date
  // Время Казахстана: сервер и браузер рисуют одно и то же число
  const { day, month } = formatDayAndShortMonth(value, locale)

  return (
    <time
      dateTime={value.toISOString()}
      className={cn(
        "flex size-16 shrink-0 flex-col items-center justify-center rounded-lg",
        tone === "default" ? "bg-primary-soft text-primary" : "bg-white/10 text-white",
        className
      )}
    >
      <span className="type-number text-2xl leading-none">{day}</span>
      <span className="type-eyebrow mt-1 leading-none opacity-80">{month}</span>
    </time>
  )
}

export { DateTile }
