import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';
import { Providers } from "@/components/providers";

// Noto Sans - полная поддержка казахского языка
const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
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
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${notoSans.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="flex-1 pt-24">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
