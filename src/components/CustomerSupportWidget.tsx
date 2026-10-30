import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isCustomerSupportVisible, openCustomerSupport, setCustomerSupportVisibility } from "@/lib/customer-support";

/**
 * Smartsupp live chat widget. The loader script is injected once, after
 * hydration, so it never runs during SSR. Hidden on the admin area.
 */
export function CustomerSupportWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPrivateArea = pathname.startsWith("/admin");
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    setCustomerSupportVisibility(isPrivateArea);
    if (isPrivateArea) return;
    const check = () => setVisible(isCustomerSupportVisible());
    check();
    const timer = window.setInterval(check, 500);
    return () => window.clearInterval(timer);
  }, [isPrivateArea]);

  if (isPrivateArea) return null;

  return (
    <>
    {!visible && (
      <Button
        className="fixed bottom-6 right-4 z-50 h-14 gap-3 px-6 text-base shadow-lg"
        disabled={opening}
        onClick={async () => {
          setOpening(true);
          try { await openCustomerSupport(); }
          catch (error) { toast.error(error instanceof Error ? error.message : "Chat could not connect. Please try again."); }
          finally { setOpening(false); }
        }}
      >
        <MessageCircle />{opening ? "Connecting…" : "Customer support"}
      </Button>
    )}
    <noscript>
      Powered by{" "}
      <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
        Smartsupp
      </a>
    </noscript>
    </>
  );
}
