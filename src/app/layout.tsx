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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Alquila · El Airbnb de las cosas en Lima",
  description:
    "Alquila y arrienda bienes en Lima con DNI verificado, ubicación ofuscada y actas digitales de entrega y devolución.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Alquila" },
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
