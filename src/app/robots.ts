import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /api не закрываем: клиентские страницы грузят из него данные, и поисковик
// должен их увидеть при рендеринге. От индексации API закрыт заголовком X-Robots-Tag.
// Вход и подача заявки закрыты метатегом noindex — роботу нужно их открыть, чтобы его прочитать.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/*/admin", "/uploads/registrations/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
