import * as React from "react"

import { cn } from "@/lib/utils"

interface EyebrowProps extends React.ComponentProps<"p"> {
  tone?: "default" | "inverse"
}

// Надзаголовок с золотой чертой: над заголовком секции, страницы и hero
function Eyebrow({ className, tone = "default", children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "type-eyebrow flex items-center gap-2.5",
        tone === "default" ? "text-gold-strong" : "text-gold",
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="h-0.5 w-5 shrink-0 rounded-full bg-gold" />
      {children}
    </p>
  )
}

export { Eyebrow }
