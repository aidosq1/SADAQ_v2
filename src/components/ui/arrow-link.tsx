import * as React from "react"
import { ArrowRight } from "lucide-react"

import { Link } from "@/navigation"
import { cn } from "@/lib/utils"

interface ArrowLinkProps extends Omit<React.ComponentProps<typeof Link>, "children"> {
  children: React.ReactNode
  tone?: "default" | "inverse"
}

// Текстовая ссылка со стрелкой: «Все новости →», «Подробнее →»
function ArrowLink({ className, children, tone = "default", ...props }: ArrowLinkProps) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
        tone === "default" ? "text-primary hover:text-primary-hover" : "text-gold hover:text-white",
        className
      )}
      {...props}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export { ArrowLink }
