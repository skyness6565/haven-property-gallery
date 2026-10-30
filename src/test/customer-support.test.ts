import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureCustomerSupport, openCustomerSupport, setCustomerSupportVisibility } from "@/lib/customer-support";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
  document.head.querySelector("#maison-smartsupp-loader")?.remove();
  document.documentElement.classList.remove("support-hidden");
  Reflect.deleteProperty(window, "smartsupp");
});

describe("Customer support", () => {
  it("queues show and open for an enquiry even before chat has loaded", async () => {
    const iframe = document.createElement("iframe");
    iframe.id = "widgetMessengerFrame";
    iframe.getBoundingClientRect = () => ({ height: 500 } as DOMRect);
    document.body.appendChild(iframe);
    const api = ensureCustomerSupport();
    await openCustomerSupport();
    expect(api._).toEqual([["chat:show"], ["chat:open"]]);
  });

  it("reports failure rather than silently succeeding when chat is blocked", async () => {
    vi.useFakeTimers();
    const result = expect(openCustomerSupport()).rejects.toThrow("Chat could not connect");
    await vi.advanceTimersByTimeAsync(15000);
    await result;
  });

  it("hides support on admin and restores it on public pages", () => {
    const api = ensureCustomerSupport();
    setCustomerSupportVisibility(true);
    expect(api._).toEqual([["chat:hide"]]);
    setCustomerSupportVisibility(false);
    expect(api._).toEqual([["chat:hide"], ["chat:show"]]);
  });
});