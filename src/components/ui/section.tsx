import * as React from "react"

import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"

interface SectionProps extends React.ComponentProps<"section"> {
  tone?: "default" | "muted"
}

// Блок главной и длинных страниц: одинаковый вертикальный ритм и фон
function Section({ className, tone = "default", children, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-12 md:py-16", tone === "muted" ? "bg-secondary" : "bg-background", className)}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  )
}

interface SectionHeaderProps {
  title: React.ReactNode
  eyebrow?: React.ReactNode
  action?: React.ReactNode
  align?: "start" | "center"
  as?: "h2" | "h3"
  className?: string
}

// Заголовок секции с золотой чертой; action — ссылка «Все …» справа
function SectionHeader({
  title,
  eyebrow,
  action,
  align = "start",
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  const centered = align === "center"

  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap gap-4 md:mb-10",
        centered ? "flex-col items-center text-center" : "items-end justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="type-eyebrow mb-2 text-gold-strong">{eyebrow}</p>}
        <Heading
          className={cn(
            "type-h2 gold-underline text-primary",
            centered && "gold-underline-center"
          )}
        >
          {title}
        </Heading>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { Section, SectionHeader }
