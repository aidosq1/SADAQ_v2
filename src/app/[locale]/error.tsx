"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Произошла ошибка</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Что-то пошло не так при загрузке страницы. Попробуйте обновить.
      </p>
      <Button onClick={reset}>Попробовать снова</Button>
    </div>
  );
}
