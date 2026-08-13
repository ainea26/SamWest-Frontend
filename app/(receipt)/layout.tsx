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

type ReceiptLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function ReceiptLayout({ children }: ReceiptLayoutProps) {
  return children;
}
