import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "App Name";
  
  return {
    title: `${appName} | DOOOR`,
    description: "A Dooor product to start your Dooor product",
    icons: {
      icon: [
        { url: "/seloDooorBlack.png", media: "(prefers-color-scheme: light)" },
        { url: "/seloDooorWhite.png", media: "(prefers-color-scheme: dark)" },
      ],
      shortcut: "/seloDooorBlack.png",
      apple: "/seloDooorBlack.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="bg-background">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <QueryProvider>
          <AuthProvider>
              <Suspense fallback={null}>
              </Suspense>
              {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
