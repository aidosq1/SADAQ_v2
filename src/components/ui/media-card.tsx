import * as React from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

import { Link } from "@/navigation"
import { cn } from "@/lib/utils"
import { cardInteractive, cardSurface } from "@/components/ui/card"

interface MediaCardProps {
  href: string
  title: string
  image?: string | null
  badge?: React.ReactNode
  meta?: React.ReactNode
  excerpt?: React.ReactNode
  footer?: React.ReactNode
  sizes?: string
  className?: string
}

// Карточка с фото: новость, альбом. Одинаковые пропорции, отступы и hover
function MediaCard({
  href,
  title,
  image,
  badge,
  meta,
  excerpt,
  footer,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
}: MediaCardProps) {
  return (
    <Link
      href={href}
      className={cn(cardSurface, cardInteractive, "group flex h-full flex-col overflow-hidden", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="size-10 text-muted-foreground/50" aria-hidden="true" />
          </div>
        )}
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        {meta && <div className="type-caption flex items-center gap-1.5">{meta}</div>}
        <h3 className="type-h4 line-clamp-2 text-primary transition-colors group-hover:text-primary-hover">
          {title}
        </h3>
        {excerpt && <p className="type-small line-clamp-3 text-muted-foreground">{excerpt}</p>}
        {footer && <div className="mt-auto pt-2">{footer}</div>}
      </div>
    </Link>
  )
}

export { MediaCard }
