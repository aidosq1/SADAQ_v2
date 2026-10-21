import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PersonPlaceholder } from "@/components/ui/person-placeholder"

interface PersonAvatarProps {
  src?: string | null
  alt: string
  shape?: "circle" | "portrait"
  className?: string
}

// Фото человека с единой заглушкой: спортсмен, тренер, руководство
function PersonAvatar({ src, alt, shape = "circle", className }: PersonAvatarProps) {
  const portrait = shape === "portrait"

  return (
    <Avatar className={cn("border bg-secondary", portrait && "rounded-lg", className)}>
      {src && <AvatarImage src={src} alt={alt} className="object-cover" />}
      <AvatarFallback className={cn("bg-secondary", portrait && "rounded-none")}>
        <PersonPlaceholder />
      </AvatarFallback>
    </Avatar>
  )
}

export { PersonAvatar }
