import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Типографика UI kit (src/app/globals.css): type-h1 и т.п. задают размер, начертание и межстрочный
// интервал, поэтому заменяют стоящие перед ними text-sm / font-medium / leading-* / tracking-*
const twMerge = extendTailwindMerge<"typography">({
  extend: {
    classGroups: {
      typography: [
        { type: ["display", "h1", "h2", "h3", "h4", "lead", "body", "small", "caption", "eyebrow", "number"] },
      ],
    },
    conflictingClassGroups: {
      typography: ["font-size", "font-weight", "leading", "tracking", "font-family"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
