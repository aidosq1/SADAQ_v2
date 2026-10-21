import * as React from "react"

import { cn } from "@/lib/utils"

interface ChipProps extends React.ComponentProps<"button"> {
  active?: boolean
}

// Переключатель фильтра: категория, пол, тип лука, альбом
function Chip({ className, active = false, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      data-active={active}
      className={cn(
        "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background text-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

// Группа чипов одного фильтра
function ChipGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" className={cn("flex flex-wrap gap-2", className)} {...props} />
}

export { Chip, ChipGroup }
