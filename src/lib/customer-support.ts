export const TELEGRAM_PHONE = "+19168333729";

/** Telegram chat link to the support number, optionally with a prefilled message. */
export function telegramSupportUrl(text?: string): string {
  const base = `https://t.me/${TELEGRAM_PHONE}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
