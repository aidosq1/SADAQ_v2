import { cn } from "@/lib/utils"

const MONTH_FORMAT: Record<string, string> = { kk: "kk-KZ", ru: "ru-RU", en: "en-GB" }

interface DateTileProps {
  date: string | Date
  locale: string
  tone?: "default" | "inverse"
  className?: string
}

// Дата старта плиткой: крупное число и месяц. Календарь, ближайший турнир
function DateTile({ date, locale, tone = "default", className }: DateTileProps) {
  const value = typeof date === "string" ? new Date(date) : date
  const month = new Intl.DateTimeFormat(MONTH_FORMAT[locale] ?? "ru-RU", { month: "short" })
    .format(value)
    .replace(".", "")

  return (
    <time
      dateTime={value.toISOString()}
      className={cn(
        "flex size-16 shrink-0 flex-col items-center justify-center rounded-lg",
        tone === "default" ? "bg-primary-soft text-primary" : "bg-white/10 text-white",
        className
      )}
    >
      <span className="type-number text-2xl leading-none">{value.getDate()}</span>
      <span className="type-eyebrow mt-1 leading-none opacity-80">{month}</span>
    </time>
  )
}

export { DateTile }
