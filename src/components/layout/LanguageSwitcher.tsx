"use client";

import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { code: "kk", label: "ҚАЗ" },
    { code: "ru", label: "РУС" },
    { code: "en", label: "ENG" },
] as const;

interface LanguageSwitcherProps {
    className?: string;
}

// Переключатель языка: три кода в одну строку, текущий — на белой плашке
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();

    return (
        <div className={cn("inline-flex items-center gap-0.5 rounded-full bg-secondary p-1", className)}>
            {LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                    <button
                        key={lang.code}
                        type="button"
                        lang={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                            "h-7 cursor-pointer rounded-full px-2.5 text-xs font-semibold tracking-wide transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                            active ? "bg-background text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {lang.label}
                    </button>
                );
            })}
        </div>
    );
}
