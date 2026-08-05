"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "254756348344";

const WHATSAPP_MESSAGE = "Hello SamWest, I would like some assistance.";

export default function WhatsAppFloat() {
  const pathname = usePathname();

  // Keep the customer WhatsApp button out of staff screens.
  if (pathname.startsWith("/staff")) {
    return null;
  }

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div
      className="
        fixed
        bottom-[max(14px,env(safe-area-inset-bottom))]
        right-[max(14px,env(safe-area-inset-right))]
        z-40
        sm:bottom-6
        sm:right-6
      "
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group
          relative
          flex
          h-13
          w-13
          items-center
          justify-center
          rounded-full
          bg-[#25D366]
          text-white
          shadow-[0_10px_30px_rgba(37,211,102,0.35)]
          ring-1
          ring-black/5
          transition
          duration-300
          hover:-translate-y-1
          hover:scale-105
          hover:bg-[#20bd5a]
          hover:shadow-[0_14px_35px_rgba(37,211,102,0.45)]
          focus:outline-none
          focus-visible:ring-4
          focus-visible:ring-emerald-200
          active:scale-95
          sm:h-15
          sm:w-15
        "
        aria-label="Chat with SamWest on WhatsApp"
        title="Chat with SamWest on WhatsApp"
      >
        <MessageCircle
          className="h-6 w-6 sm:h-7 sm:w-7"
          strokeWidth={2.2}
          aria-hidden="true"
        />

        <span
          className="
            pointer-events-none
            absolute
            right-full
            mr-3
            hidden
            whitespace-nowrap
            rounded-lg
            bg-slate-950
            px-3
            py-2
            text-xs
            font-bold
            text-white
            opacity-0
            shadow-lg
            transition
            duration-200
            group-hover:opacity-100
            lg:block
          "
        >
          Chat on WhatsApp
          <span
            className="
              absolute
              left-full
              top-1/2
              -translate-y-1/2
              border-4
              border-transparent
              border-l-slate-950
            "
          />
        </span>
      </a>
    </div>
  );
}
