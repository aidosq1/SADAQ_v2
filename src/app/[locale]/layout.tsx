import type { Metadata } from "next";
import { Oswald, Ubuntu } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/navigation';
import { Providers } from "@/components/providers";

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  display: "swap",
});

const ubuntu = Ubuntu({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SADAQ | Садақ ату федерациясы",
  description: "Қазақстан Республикасының Садақ Ату Федерациясының ресми сайты",
  icons: {
    icon: "/logo_federation_circular.png",
    apple: "/logo_federation_circular.png",
  },
};

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
        className={`${ubuntu.variable} ${oswald.variable} min-h-screen bg-background font-sans antialiased`}
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
