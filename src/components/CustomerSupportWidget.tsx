import { useRouterState } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { telegramSupportUrl } from "@/lib/customer-support";

/** Floating Telegram support button. Hidden on the admin area. */
export function CustomerSupportWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/admin")) return null;
  return (
    <Button asChild className="fixed bottom-6 right-4 z-50 h-14 gap-3 px-6 text-base shadow-lg">
      <a href={telegramSupportUrl()} target="_blank" rel="noopener noreferrer" aria-label="Customer support on Telegram">
        <Send />Chat on Telegram
      </a>
    </Button>
  );
}
