import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Booking Management",
  description:
    "Protected SamWest booking management portal.",
  robots: {
    index: false,
    follow: false,
  },
};

type StaffLayoutProps = {
  children: ReactNode;
};

export default function StaffLayout({
  children,
}: StaffLayoutProps) {
  return (
    <div className="min-h-dvh min-w-0 overflow-x-hidden bg-slate-50">
      {children}
    </div>
  );
}
