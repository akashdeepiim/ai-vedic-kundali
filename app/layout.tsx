import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Vedic Astra",
  description: "Advanced AI-Powered Vedic Astrology Insights",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <Footer />
        <Analytics />

      </body>
    </html>
  );
}
