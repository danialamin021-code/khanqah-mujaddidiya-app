import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import AppNav from "@/components/AppNav";
import SupabaseConfigBanner from "@/components/SupabaseConfigBanner";
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
  icons: {
    icon: "/assets/app-icon/app-icon.png",
    apple: "/assets/app-icon/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}
      >
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
