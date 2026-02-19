import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Toaster } from "sonner";
import AppNav from "@/components/AppNav";
import SupabaseConfigBanner from "@/components/SupabaseConfigBanner";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Khanqah Mujaddidiyya",
  description: "A calm, guided spiritual learning companion.",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/app-icon/app-icon.png",
    apple: "/assets/app-icon/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Khanqah",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var k='khanqah-theme';var v=localStorage.getItem(k);var r=v==='dark'?'dark':(v==='light'?'light':null);if(r){document.documentElement.setAttribute('data-theme',r);document.documentElement.classList.toggle('dark',r==='dark');}})();`,
          }}
        />
        <Toaster richColors position="top-center" closeButton />
        <ServiceWorkerRegistration />
        <SupabaseConfigBanner />
        <AppNav />
        {/* Top bar: pt-14; bottom nav always (mobile-first): pb-16 */}
        <div className="min-h-screen pt-14 pb-16">
          {children}
        </div>
      </body>
    </html>
  );
}
