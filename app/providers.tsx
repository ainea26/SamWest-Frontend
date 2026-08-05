"use client";

import NextTopLoader from "nextjs-toploader";
import type { ReactNode } from "react";

import StaleTabRefresher from "@/components/ui/StaleTabRefresher";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { BookingProvider } from "@/context/BookingContext";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <BookingProvider>
      <NextTopLoader
        color="#d97706"
        initialPosition={0.08}
        crawlSpeed={180}
        height={3}
        crawl
        showSpinner={false}
        easing="ease"
        speed={220}
        shadow="0 0 8px #f59e0b,0 0 4px #f59e0b"
      />

      <StaleTabRefresher />

      {children}

      <WhatsAppFloat />
    </BookingProvider>
  );
}
