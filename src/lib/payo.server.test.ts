import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {} }));
const { extractOrder, hmacSha256Hex, isGenuinePayoWebhook, payoStatusToBid } = await import("./payo.server");

const KEY = "pgk_test_key";
const body = JSON.stringify({ orderId: "ord_1", status: "APPROVED", amount: 50.25, currency: "ETB" });

describe("Payo webhook", () => {
  it("accepts a correct x-pygate-signature", async () => {
    const sig = `sha256=${await hmacSha256Hex(KEY, body)}`;
    expect(await isGenuinePayoWebhook({ rawBody: body, signature: sig, apiKeyHeader: null, apiKey: KEY })).toBe(true);
  });
  it("rejects a signature made with another key", async () => {
    const sig = `sha256=${await hmacSha256Hex("other", body)}`;
    expect(await isGenuinePayoWebhook({ rawBody: body, signature: sig, apiKeyHeader: null, apiKey: KEY })).toBe(false);
  });
  it("accepts a matching x-api-key header and rejects a wrong one", async () => {
    expect(await isGenuinePayoWebhook({ rawBody: body, signature: null, apiKeyHeader: KEY, apiKey: KEY })).toBe(true);
    expect(await isGenuinePayoWebhook({ rawBody: body, signature: null, apiKeyHeader: "nope", apiKey: KEY })).toBe(false);
  });
  it("approved receipt makes the bid active", () => {
    expect(payoStatusToBid({ status: "APPROVED" })).toBe("active");
    expect(payoStatusToBid({ event: "payment.approved" })).toBe("active");
    expect(payoStatusToBid({ status: "EXPIRED" })).toBe("expired");
    expect(payoStatusToBid({ status: "PENDING" })).toBeNull();
  });
  it("reads the order id and payment link", () => {
    expect(extractOrder({ orderId: "ord_9", paymentUrl: "https://checkout.payment.et/pay/ord_9" })).toEqual({
      orderId: "ord_9",
      paymentUrl: "https://checkout.payment.et/pay/ord_9",
    });
    expect(extractOrder({ data: { id: "ord_7" } })).toEqual({ orderId: "ord_7", paymentUrl: "https://checkout.payment.et/pay/ord_7" });
  });
});
