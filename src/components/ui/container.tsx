import * as React from "react"

import { cn } from "@/lib/utils"

const containerSizes = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
} as const

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: keyof typeof containerSizes
}

// Единая ширина контента и боковые отступы для всех страниц
function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerSizes[size], className)}
      {...props}
    />
  )
}

// Обёртка страницы: контейнер + вертикальные отступы от шапки и до футера
function PageContainer({ className, ...props }: ContainerProps) {
  return <Container className={cn("py-8 md:py-12", className)} {...props} />
}

export { Container, PageContainer }
