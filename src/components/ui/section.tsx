import * as React from "react"

import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"
import { Eyebrow } from "@/components/ui/eyebrow"

const SECTION_TONES = {
  default: "bg-background",
  muted: "bg-secondary",
  inverse: "surface-inverse",
} as const

type SectionTone = keyof typeof SECTION_TONES

interface SectionProps extends React.ComponentProps<"section"> {
  tone?: SectionTone
}

// Блок главной и длинных страниц: одинаковый вертикальный ритм и фон
function Section({ className, tone = "default", children, ...props }: SectionProps) {
  return (
    <section className={cn("py-14 md:py-20", SECTION_TONES[tone], className)} {...props}>
      <Container>{children}</Container>
    </section>
  )
}

interface SectionHeaderProps {
  title: React.ReactNode
  eyebrow?: React.ReactNode
  action?: React.ReactNode
  align?: "start" | "center"
  tone?: "default" | "inverse"
  as?: "h2" | "h3"
  className?: string
}

// Заголовок секции: надзаголовок с золотой чертой, заголовок, ссылка «Все …» справа
function SectionHeader({
  title,
  eyebrow,
  action,
  align = "start",
  tone = "default",
  as: Heading = "h2",
  className,
}: SectionHeaderProps) {
  const centered = align === "center"

  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap gap-x-6 gap-y-4 md:mb-10",
        centered ? "flex-col items-center text-center" : "items-end justify-between",
        className
      )}
    >
      <div className={cn("min-w-0", centered && "flex flex-col items-center")}>
        {eyebrow && (
          <Eyebrow tone={tone} className="mb-3">
            {eyebrow}
          </Eyebrow>
        )}
        <Heading className={cn("type-h2", tone === "inverse" ? "text-white" : "text-foreground")}>
          {title}
        </Heading>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { Section, SectionHeader }
