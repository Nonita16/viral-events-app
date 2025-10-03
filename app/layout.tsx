import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const defaultUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} antialiased min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-pink-100 flex flex-col`}
      >
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
