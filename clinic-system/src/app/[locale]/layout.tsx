import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#4A2E1B",
};

export const metadata: Metadata = {
  title: "Mena Clinic | مجمع مينا الطبي | Mena Tıp Merkezi",
  description: "Mena Clinic Multi-Doctor Clinic Management and Appointment System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mena Clinic",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as "tr" | "ar" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-clinicBg text-stone-200 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <NextIntlClientProvider messages={messages}>
          <PwaRegistrar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
