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

const SITE_DESCRIPTIONS: Record<string, string> = {
  kk: "Қазақстан Республикасының Ұлттық садақ ату федерациясының ресми сайты",
  ru: "Официальный сайт Национальной федерации стрельбы из лука Республики Казахстан",
  en: "Official website of the National Archery Federation of the Republic of Kazakhstan",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });

  return {
    title: {
      default: t("title"),
      template: "%s | SADAQ",
    },
    description: SITE_DESCRIPTIONS[locale] ?? SITE_DESCRIPTIONS.kk,
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
