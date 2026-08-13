import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import Providers from "./providers";

const SITE_URL = "https://samwestonline.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "SamWest | Online Supermarket in Kenya",
    template: "%s | SamWest",
  },

  description:
    "Shop groceries, household essentials, food, drinks, personal care products and more online from SamWest in Kenya.",

  applicationName: "SamWest",

  keywords: [
    "SamWest",
    "online supermarket Kenya",
    "online grocery shopping Kenya",
    "groceries Kenya",
    "supermarket Kenya",
    "household products Kenya",
    "food shopping Kenya",
    "shop online Kenya",
  ],

  authors: [
    {
      name: "SamWest",
      url: SITE_URL,
    },
  ],

  creator: "SamWest",
  publisher: "SamWest",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: "SamWest",
    title: "SamWest | Online Supermarket in Kenya",
    description:
      "Shop groceries, household essentials, food, drinks and more online from SamWest in Kenya.",
  },

  twitter: {
    card: "summary_large_image",
    title: "SamWest | Online Supermarket in Kenya",
    description:
      "Shop groceries, household essentials, food, drinks and more online from SamWest in Kenya.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/icon.svg",
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
