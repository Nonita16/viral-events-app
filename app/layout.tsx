import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "@/lib/providers/query-provider";
import "./globals.css";
import Header from "@/components/Header";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

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
        <QueryProvider>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
