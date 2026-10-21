"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/states";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <EmptyState
      icon={AlertTriangle}
      title="Ошибка в панели управления"
      className="min-h-[50vh] border-none"
      action={<Button onClick={reset}>Попробовать снова</Button>}
    />
  );
}
