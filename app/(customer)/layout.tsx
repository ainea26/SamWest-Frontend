import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
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

type CustomerLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return children;
}
