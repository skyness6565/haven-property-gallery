import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const SMARTSUPP_KEY = "f90ca324f565955e5af4a1ffe2950a1b6e01ed51";

/**
 * Smartsupp live chat widget. The loader script is injected once, after
 * hydration, so it never runs during SSR. Hidden on the admin area.
 */
export function CustomerSupportWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPrivateArea = pathname.startsWith("/admin");

  useEffect(() => {
    if (isPrivateArea) return;

    const w = window as unknown as {
      _smartsupp?: { key?: string };
      smartsupp?: ((...args: unknown[]) => void) & { _: unknown[] };
    };

    w._smartsupp = w._smartsupp || {};
    w._smartsupp.key = SMARTSUPP_KEY;

    if (w.smartsupp) return;

    const smartsupp = function (...args: unknown[]) {
      smartsupp._.push(args);
    } as ((...args: unknown[]) => void) & { _: unknown[] };
    smartsupp._ = [];
    w.smartsupp = smartsupp;

    const chat = document.createElement("script");
    chat.type = "text/javascript";
    chat.charset = "utf-8";
    chat.async = true;
    chat.src = "https://www.smartsuppchat.com/loader.js?";
    document.head.appendChild(chat);
  }, [isPrivateArea]);

  if (isPrivateArea) return null;

  return (
    <noscript>
      Powered by{" "}
      <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
        Smartsupp
      </a>
    </noscript>
  );
}
