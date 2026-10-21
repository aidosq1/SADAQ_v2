import * as React from "react"
import { ArrowLeft } from "lucide-react"

import { Link } from "@/navigation"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/ui/eyebrow"

interface PageHeaderProps {
  title: React.ReactNode
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
  back?: { href: string; label: string }
  className?: string
}

// Ссылка «назад» к списку: новости, календарь, сборная
function BackLink({ href, label, className }: { href: string; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Link>
  )
}

// Заголовок страницы: надзаголовок, h1 слева, действия справа, ссылка «назад» над заголовком
function PageHeader({ title, eyebrow, actions, back, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 md:mb-10", className)}>
      {back && <BackLink href={back.href} label={back.label} className="mb-5" />}
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="type-h1 min-w-0 text-foreground">{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export { PageHeader, BackLink }
