import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

// Заглушка вместо фото: силуэт вместо первой буквы имени, чтобы карточки без фото не выглядели сломанными
export function PersonPlaceholder({ className }: { className?: string }) {
    return <UserRound aria-hidden="true" className={cn("h-1/2 w-1/2 text-muted-foreground/50", className)} />;
}
