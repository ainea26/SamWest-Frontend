"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "254739353972";

const WHATSAPP_MESSAGE = "Hello SamWest, I would like some assistance.";

export default function WhatsAppFloat() {
  const pathname = usePathname();

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
        bottom-[max(18px,env(safe-area-inset-bottom))]
        right-[max(18px,env(safe-area-inset-right))]
        z-50
        sm:bottom-7
        sm:right-7
        lg:bottom-8
        lg:right-8
      "
    >
      <div
        className="
          group
          relative
          animate-[bounce_2.5s_ease-in-out_infinite]
          motion-reduce:animate-none
        "
      >
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            animate-ping
            rounded-full
            bg-[#25D366]/35
            motion-reduce:animate-none
          "
        />

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with SamWest on WhatsApp"
          title="Chat with SamWest on WhatsApp"
          className="
            relative
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-[#25D366]
            text-white
            shadow-[0_14px_36px_rgba(37,211,102,0.42)]
            ring-1
            ring-black/5
            transition-all
            duration-300
            hover:-translate-y-1
            hover:scale-110
            hover:bg-[#20bd5a]
            hover:shadow-[0_18px_44px_rgba(37,211,102,0.50)]
            focus:outline-none
            focus-visible:ring-4
            focus-visible:ring-emerald-200
            active:scale-95
            sm:h-17
            sm:w-17
            lg:h-18
            lg:w-18
          "
        >
          <MessageCircle
            className="
              h-8
              w-8
              sm:h-9
              sm:w-9
            "
            strokeWidth={2.2}
            aria-hidden="true"
          />

          <span
            aria-hidden="true"
            className="
              absolute
              right-1
              top-1
              h-3
              w-3
              rounded-full
              border-2
              border-white
              bg-emerald-300
              shadow-sm
            "
          />
        </a>

        <span
          className="
            pointer-events-none
            absolute
            right-full
            top-1/2
            mr-4
            hidden
            -translate-y-1/2
            whitespace-nowrap
            rounded-xl
            bg-slate-950
            px-4
            py-2.5
            text-sm
            font-bold
            text-white
            opacity-0
            shadow-xl
            transition-all
            duration-200
            group-hover:-translate-x-1
            group-hover:opacity-100
            lg:block
          "
        >
          Chat on WhatsApp
          <span
            aria-hidden="true"
            className="
              absolute
              left-full
              top-1/2
              -translate-y-1/2
              border-[5px]
              border-transparent
              border-l-slate-950
            "
          />
        </span>
      </div>
    </div>
  );
}
