import type { ReactNode } from "react";

type ReceiptLayoutProps = {
  children: ReactNode;
};

export default function ReceiptLayout({ children }: ReceiptLayoutProps) {
  return (
    <div className="min-h-dvh min-w-0 bg-slate-100 text-slate-950">
      {children}
    </div>
  );
}
