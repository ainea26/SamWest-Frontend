import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SamWest Staff",

  robots: {
    index: false,
    follow: false,
    nocache: true,

    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type StaffLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function StaffLayout({ children }: StaffLayoutProps) {
  return children;
}
