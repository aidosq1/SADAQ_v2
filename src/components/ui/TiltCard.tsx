"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  return (
    <div
      className={cn(
        "transition-transform duration-300 hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </div>
  );
}
