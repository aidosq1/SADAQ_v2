"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { isPageNavigation } from "@/lib/navigation-progress";

// Быстрые переходы проходят без мигания полосы
const SHOW_DELAY_MS = 150;
const FINISH_MS = 300;
// Если адрес так и не сменился (ошибка, отмена), полоса всё равно исчезает
const MAX_DURATION_MS = 15000;

const START_EVENT = "navigation-progress:start";

// Для переходов через router.push/replace, где нет клика по ссылке
export function startNavigationProgress(): void {
    window.dispatchEvent(new Event(START_EVENT));
}

interface ProgressState {
    id: number;
    // Адрес, с которого начался переход; null — перехода нет
    fromKey: string | null;
    visible: boolean;
}

const IDLE: ProgressState = { id: 0, fromKey: null, visible: false };

function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const routeKey = `${pathname}?${searchParams.toString()}`;
    const routeKeyRef = useRef(routeKey);
    const [state, setState] = useState<ProgressState>(IDLE);

    useEffect(() => {
        routeKeyRef.current = routeKey;
    }, [routeKey]);

    useEffect(() => {
        let nextId = 0;
        const start = () => {
            nextId += 1;
            const id = nextId;
            const fromKey = routeKeyRef.current;
            setState({ id, fromKey, visible: false });
            setTimeout(() => {
                setState((s) => (s.id === id && routeKeyRef.current === fromKey ? { ...s, visible: true } : s));
            }, SHOW_DELAY_MS);
            setTimeout(() => {
                setState((s) => (s.id === id ? IDLE : s));
            }, MAX_DURATION_MS);
        };

        const onClick = (event: MouseEvent) => {
            const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
            if (!(anchor instanceof HTMLAnchorElement)) return;
            const click = {
                href: anchor.href,
                target: anchor.getAttribute("target"),
                hasDownload: anchor.hasAttribute("download"),
                button: event.button,
                modified: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
            };
            if (isPageNavigation(click, new URL(window.location.href))) start();
        };

        document.addEventListener("click", onClick, true);
        window.addEventListener(START_EVENT, start);
        return () => {
            document.removeEventListener("click", onClick, true);
            window.removeEventListener(START_EVENT, start);
        };
    }, []);

    // Адрес сменился — новая страница открыта
    const done = state.fromKey !== null && state.fromKey !== routeKey;

    useEffect(() => {
        if (!done) return;
        const timer = setTimeout(() => setState(IDLE), FINISH_MS);
        return () => clearTimeout(timer);
    }, [done]);

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
            <div
                className={cn(
                    "h-full bg-gold motion-reduce:transition-none",
                    !state.visible && "w-0 opacity-0 transition-none",
                    state.visible && !done && "w-4/5 opacity-100 transition-[width] duration-[8000ms] ease-out",
                    state.visible && done && "w-full opacity-0 transition-[width,opacity] duration-300"
                )}
            />
        </div>
    );
}

// Полоса загрузки вверху страницы при переходах между страницами
export function NavigationProgress() {
    // useSearchParams требует границу Suspense
    return (
        <Suspense fallback={null}>
            <ProgressBar />
        </Suspense>
    );
}
