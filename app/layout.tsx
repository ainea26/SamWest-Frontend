import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SamWest | Smart Shopping, Easy Booking",
    template: "%s | SamWest",
  },

  description:
    "Browse selected products, save more, and send your booking to SamWest through WhatsApp for confirmation.",

  applicationName: "SamWest",

  keywords: [
    "SamWest",
    "online shopping Kenya",
    "groceries Kenya",
    "household products",
    "WhatsApp booking",
    "smart shopping",
  ],

  authors: [
    {
      name: "SamWest",
    },
  ],

  creator: "SamWest",
  publisher: "SamWest",
  category: "shopping",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#f59e0b",
  colorScheme: "light",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="min-w-0">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh min-w-0 overflow-x-hidden bg-white text-slate-950 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
