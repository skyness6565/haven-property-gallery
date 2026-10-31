import { describe, expect, it } from "vitest";
import { telegramSupportUrl } from "@/lib/customer-support";

describe("telegram support", () => {
  it("links to the support number", () => {
    expect(telegramSupportUrl()).toBe("https://t.me/+19168333729");
  });
});
