"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const setLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
        router.refresh();
    };

    return (
        <LanguageContext.Provider value={{ language: locale, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
