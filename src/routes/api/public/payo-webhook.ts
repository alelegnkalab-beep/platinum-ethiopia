import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Payload = z
  .object({
    orderId: z.string().max(200).optional(),
    order_id: z.string().max(200).optional(),
    id: z.string().max(200).optional(),
    status: z.string().max(50).optional(),
    event: z.string().max(80).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    data: z.record(z.unknown()).optional(),
  })
  .passthrough();

const json = (body: unknown, status = 200) => Response.json(body, { status });

// payo-webhook: Payo calls this when a receipt is approved (or the order expires / is rejected).
export const Route = createFileRoute("/api/public/payo-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["PAYO_API_KEY"];
        if (!apiKey) return json({ error: "not configured" }, 503);
        const { isGenuinePayoWebhook, payoStatusToBid } = await import("@/lib/payo.server");

        const rawBody = await request.text();
        const genuine = await isGenuinePayoWebhook({
          rawBody,
          signature: request.headers.get("x-pygate-signature"),
          apiKeyHeader: request.headers.get("x-api-key"),
          apiKey,
        });
        if (!genuine) return json({ error: "invalid signature" }, 401);

        let parsed: z.infer<typeof Payload>;
        try {
          parsed = Payload.parse(JSON.parse(rawBody));
        } catch {
          return json({ error: "bad payload" }, 400);
        }
        const inner = (parsed.data ?? {}) as Record<string, unknown>;
        const pick = (k: string) => (typeof inner[k] === "string" || typeof inner[k] === "number" ? String(inner[k]) : undefined);
        const orderId = parsed.orderId ?? parsed.order_id ?? pick("orderId") ?? pick("order_id") ?? parsed.id ?? pick("id");
        const status = parsed.status ?? pick("status");
        const amountRaw = parsed.amount ?? pick("amount");
        if (!orderId) return json({ error: "missing orderId" }, 400);

        const next = payoStatusToBid({ status, event: parsed.event });
        if (!next) return json({ ok: true, ignored: "status" });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: bid } = await supabaseAdmin
          .from("payo_bids")
          .select("id, amount_etb, status")
          .eq("payo_order_id", orderId)
          .maybeSingle();
        if (!bid) return json({ ok: true, ignored: "unknown order" });
        if (bid.status === "active") return json({ ok: true, already: "active" });

        if (next === "active" && amountRaw !== undefined) {
          const paid = Number(amountRaw);
          if (!Number.isFinite(paid) || paid + 0.005 < Number(bid.amount_etb)) {
            console.error("[payo] amount mismatch", { orderId, paid, expected: bid.amount_etb });
            return json({ ok: true, ignored: "amount mismatch" });
          }
        }

        const { error } = await supabaseAdmin
          .from("payo_bids")
          .update({ status: next, ...(next === "active" ? { verified_at: new Date().toISOString() } : {}) })
          .eq("id", bid.id)
          .neq("status", "active");
        if (error) return json({ error: "update failed" }, 500);
        return json({ ok: true, bidId: bid.id, status: next });
      },
    },
  },
});
