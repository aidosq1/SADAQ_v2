// Структура навигации сайта: одна для шапки, мобильного меню и футера

export interface NavItem {
    labelKey: string;
    href: string;
}

export interface NavGroup {
    labelKey: string;
    items: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export const NAV: NavEntry[] = [
    {
        labelKey: "about",
        items: [
            { labelKey: "about_overview", href: "/about" },
            { labelKey: "leadership", href: "/about/leadership" },
            { labelKey: "regions", href: "/about/regions" },
            { labelKey: "history", href: "/about/history" },
            { labelKey: "documents", href: "/documents" },
        ],
    },
    {
        labelKey: "tournaments",
        items: [
            { labelKey: "competitions", href: "/calendar" },
            { labelKey: "protocols", href: "/results" },
        ],
    },
    { labelKey: "team", href: "/team" },
    { labelKey: "ranking", href: "/ranking" },
    {
        labelKey: "media",
        items: [
            { labelKey: "news", href: "/media/news" },
            { labelKey: "media_gallery", href: "/media/gallery" },
        ],
    },
];

export const SOCIAL_LINKS = {
    instagram: "https://www.instagram.com/kazarchery_official/",
    youtube: "https://www.youtube.com/watch?v=6xgw-YxIbmw",
} as const;

export function isGroup(entry: NavEntry): entry is NavGroup {
    return "items" in entry;
}

export function isActivePath(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function isEntryActive(pathname: string, entry: NavEntry): boolean {
    return isGroup(entry)
        ? entry.items.some((item) => isActivePath(pathname, item.href))
        : isActivePath(pathname, entry.href);
}
