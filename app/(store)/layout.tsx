import type { ReactNode } from "react";

import BookingDrawer from "@/components/booking/BookingDrawer";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({
  children,
}: StoreLayoutProps) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-col">
      <Header />

      <main className="min-w-0 flex-1">
        {children}
      </main>

      <Footer />

      <BookingDrawer />
    </div>
  );
}
