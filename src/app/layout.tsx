import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSessionUser, toPublicUser, isAdmin } from "@/lib/auth";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F3D2E",
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Alquila · Beta Lima",
    template: "%s · Alquila",
  },
  description:
    "Beta pública: alquila y arrienda bienes en Lima con DNI declarado, ubicación ofuscada y actas digitales de entrega y devolución. Publicar es gratis.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Alquila" },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: "Alquila",
    title: "Alquila · Beta Lima",
    description:
      "Alquila cosas en Lima con protocolo: identidad declarada, encuentro público y acta digital.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Alquila Beta Lima" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alquila · Beta Lima",
    description:
      "Alquila cosas en Lima con protocolo: identidad declarada, encuentro público y acta digital.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <html lang="es-PE">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>
        <div className="peru-bar" />
        <Header user={user ? toPublicUser(user) : null} isAdmin={user ? isAdmin(user) : false} />
        <main className="min-h-[70vh] w-full max-w-[100vw] overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
