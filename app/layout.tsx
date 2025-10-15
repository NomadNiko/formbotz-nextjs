import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Alegreya, Alegreya_Sans } from "next/font/google";
import { ThemeInit } from "../.flowbite-react/init";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FormBotz - Conversational Form Builder",
  description: "Create engaging conversational forms that feel like chatting with a friend",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FormBotz",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // iOS Safari specific
  minimalUI: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
        {/* Additional mobile optimizations */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${alegreya.variable} ${alegreyaSans.variable} antialiased`}
      >
        <ThemeInit />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
