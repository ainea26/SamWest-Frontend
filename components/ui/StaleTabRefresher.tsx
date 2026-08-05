"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const STALE_AFTER_MS = 10 * 60 * 1000;

export default function StaleTabRefresher() {
  const router = useRouter();
  const pathname = usePathname();

  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    hiddenAtRef.current = null;

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (document.visibilityState !== "visible") {
        return;
      }

      const hiddenAt = hiddenAtRef.current;

      hiddenAtRef.current = null;

      if (hiddenAt === null) {
        return;
      }

      const timeAway = Date.now() - hiddenAt;

      if (timeAway >= STALE_AFTER_MS) {
        router.refresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}
