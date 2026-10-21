import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';
import { Providers } from "@/components/providers";
import { organizationName, pageDescription, SEARCH_VERIFICATION, SITE_URL } from "@/lib/seo";

// Оба шрифта поддерживают казахские буквы (cyrillic-ext): Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І
const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800"],
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });

  // canonical и hreflang здесь не задаём: их наследовали бы все страницы.
  // Каждый раздел ставит свои через buildPageMetadata
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: "%s | SADAQ",
    },
    description: pageDescription("/", locale),
    applicationName: "SADAQ",
    openGraph: {
      type: "website",
      siteName: organizationName(locale),
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    verification: {
      google: SEARCH_VERIFICATION.google,
      yandex: SEARCH_VERIFICATION.yandex,
    },
    icons: {
      icon: "/logo_federation_circular.png",
      apple: "/logo_federation_circular.png",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="flex-1 pt-18">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
