"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/context/LanguageContext";

import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                {children}
                <Toaster />
            </LanguageProvider>
        </SessionProvider>
    );
}
