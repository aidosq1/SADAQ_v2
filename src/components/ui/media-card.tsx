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
  // stacked — фото сверху, текст снизу; overlay — текст поверх фото (альбомы, главная новость)
  variant?: "stacked" | "overlay"
  aspect?: string
  sizes?: string
  priority?: boolean
  className?: string
}

interface MediaImageProps {
  src?: string | null
  alt: string
  sizes: string
  priority?: boolean
  dark?: boolean
}

function MediaImage({ src, alt, sizes, priority, dark = false }: MediaImageProps) {
  if (!src) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", dark ? "bg-primary-deep" : "bg-secondary")}>
        <ImageIcon className={cn("size-10", dark ? "text-white/20" : "text-muted-foreground/40")} aria-hidden="true" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
    />
  )
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
  variant = "stacked",
  aspect = "aspect-[16/10]",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority,
  className,
}: MediaCardProps) {
  if (variant === "overlay") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative isolate flex h-full min-h-[240px] flex-col justify-end overflow-hidden rounded-lg bg-primary-deep text-white",
          aspect,
          className
        )}
      >
        <div className="absolute inset-0 -z-10">
          <MediaImage src={image} alt={title} sizes={sizes} priority={priority} dark />
          <div className="scrim-bottom absolute inset-0" />
        </div>
        {badge && <div className="absolute top-4 left-4">{badge}</div>}
        <div className="flex flex-col gap-2 p-5 md:p-6">
          {meta && <div className="type-caption flex items-center gap-1.5 text-white/75">{meta}</div>}
          <h3 className="type-h3 line-clamp-3 text-white">{title}</h3>
          {excerpt && <p className="type-small line-clamp-2 text-white/75">{excerpt}</p>}
          {footer && <div className="pt-1">{footer}</div>}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(cardSurface, cardInteractive, "group flex h-full flex-col overflow-hidden", className)}
    >
      <div className={cn("relative overflow-hidden bg-secondary", aspect)}>
        <MediaImage src={image} alt={title} sizes={sizes} priority={priority} />
        {badge && <div className="absolute top-3 left-3">{badge}</div>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {meta && <div className="type-caption flex items-center gap-1.5">{meta}</div>}
        <h3 className="type-h4 line-clamp-2 text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {excerpt && <p className="type-small line-clamp-3 text-muted-foreground">{excerpt}</p>}
        {footer && <div className="mt-auto pt-2">{footer}</div>}
      </div>
    </Link>
  )
}

export { MediaCard }
