type ChatApi = ((...args: unknown[]) => void) & { _?: unknown[][] };
type ChatWindow = Window & {
  _smartsupp?: { key?: string };
  smartsupp?: ChatApi;
};

const SCRIPT_ID = "maison-smartsupp-loader";

export function ensureCustomerSupport(): ChatApi {
  const w = window as ChatWindow;
  w._smartsupp = { ...w._smartsupp, key: "f90ca324f565955e5af4a1ffe2950a1b6e01ed51" };
  if (!w.smartsupp) {
    const queue: unknown[][] = [];
    const api: ChatApi = (...args) => { queue.push(args); };
    api._ = queue;
    w.smartsupp = api;
  }
  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://www.smartsuppchat.com/loader.js?";
    script.onerror = () => { script.remove(); };
    document.head.appendChild(script);
  }
  return w.smartsupp;
}

export function setCustomerSupportVisibility(hidden: boolean) {
  const api = hidden ? (window as ChatWindow).smartsupp : ensureCustomerSupport();
  api?.(hidden ? "chat:hide" : "chat:show");
  // Also hide existing vendor DOM while a queued command is pending.
  document.documentElement.classList.toggle("support-hidden", hidden);
}

export function isCustomerSupportVisible(): boolean {
  return Array.from(document.querySelectorAll<HTMLElement>(
    '#smartsupp-widget-container [data-testid="widgetButtonFrame"], #smartsupp-widget-container [data-testid="widgetMessengerFrame"]',
  )).some((element) => element.getBoundingClientRect().height > 0);
}

export async function openCustomerSupport(): Promise<void> {
  const api = ensureCustomerSupport();
  api("chat:show");
  api("chat:open");
  // A queued API function alone does not establish that a usable chat opened.
  await new Promise<void>((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const messenger = document.getElementById("widgetMessengerFrame");
      if (messenger && messenger.getBoundingClientRect().height > 0) {
        resolve();
      } else if (Date.now() - started >= 15000) {
        reject(new Error("Chat could not connect. Please try again, or allow Smartsupp in your browser’s privacy settings."));
      } else {
        window.setTimeout(check, 200);
      }
    };
    check();
  });
}