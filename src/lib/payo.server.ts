// Server-only Payo (payment.et) helpers. Never import from components.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CASH_BID_MAX_PENDING, PAYO_LINK_MINUTES, validateCashBid } from "./rules";

export const PAYO_API_BASE = "https://dashboard.payment.et/api/v1";
export const PAYO_CHECKOUT_BASE = "https://checkout.payment.et/pay";
export const PUBLISHED_SITE_URL = "https://platinum-ethiopia.lovable.app";
export const PAYO_WEBHOOK_PATH = "/api/public/payo-webhook";

export type BidStatus = "pending" | "active" | "rejected" | "expired";

type Json = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : typeof v === "number" ? String(v) : undefined);

/** Payo's create-order response shape isn't fully documented; accept the common field names. */
export function extractOrder(json: unknown): { orderId: string; paymentUrl: string } | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Json;
  for (const o of [root, root["data"], root["order"]] as unknown[]) {
    if (!o || typeof o !== "object") continue;
    const r = o as Json;
    const orderId = str(r["orderId"]) ?? str(r["order_id"]) ?? str(r["id"]);
    if (!orderId) continue;
    const paymentUrl =
      str(r["paymentUrl"]) ?? str(r["payment_url"]) ?? str(r["checkoutUrl"]) ?? str(r["checkout_url"]) ??
      str(r["url"]) ?? str(r["link"]) ?? `${PAYO_CHECKOUT_BASE}/${orderId}`;
    return { orderId, paymentUrl };
  }
  return null;
}

/** Maps a Payo webhook payload to our bid status. Unknown or still-pending states return null. */
export function payoStatusToBid(payload: { status?: string; event?: string }): BidStatus | null {
  const s = `${payload.event ?? ""} ${payload.status ?? ""}`.toLowerCase();
  if (/approved|paid|completed|success/.test(s)) return "active";
  if (/expired|cancel/.test(s)) return "expired";
  if (/rejected|failed|declined/.test(s)) return "rejected";
  return null;
}

function timingSafeEqualStr(a: string, b: string) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

export async function hmacSha256Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * A webhook is genuine when either the `x-pygate-signature` header (Payo's HMAC-SHA256 of the raw
 * body, keyed with the project API key, as `sha256=<hex>`) matches, or the `x-api-key` header equals
 * our API key.
 */
export async function isGenuinePayoWebhook(opts: {
  rawBody: string;
  signature: string | null;
  apiKeyHeader: string | null;
  apiKey: string;
}) {
  const { rawBody, signature, apiKeyHeader, apiKey } = opts;
  if (signature) {
    const given = signature.trim().replace(/^sha256=/i, "").toLowerCase();
    if (timingSafeEqualStr(given, await hmacSha256Hex(apiKey, rawBody))) return true;
  }
  if (apiKeyHeader && timingSafeEqualStr(apiKeyHeader.trim(), apiKey)) return true;
  return false;
}

export async function callPayoCreateOrder(opts: {
  apiKey: string;
  amount: number;
  description: string;
  callbackUrl: string;
  idempotencyKey: string;
}) {
  const res = await fetch(`${PAYO_API_BASE}/orders`, {
    method: "POST",
    headers: {
      "x-api-key": opts.apiKey,
      "content-type": "application/json",
      "Idempotency-Key": opts.idempotencyKey,
    },
    body: JSON.stringify({ amount: opts.amount, description: opts.description, callbackUrl: opts.callbackUrl }),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    const msg = (json as Json | null)?.["error"] ?? text.slice(0, 200);
    throw new Error(`Payo ${res.status}: ${String(msg)}`);
  }
  const order = extractOrder(json);
  if (!order) throw new Error(`Payo returned no order id: ${text.slice(0, 200)}`);
  return order;
}

export function webhookUrlFor(requestUrl: string | undefined) {
  const override = process.env["PAYO_CALLBACK_URL"];
  if (override) return override;
  let origin = PUBLISHED_SITE_URL;
  try {
    const u = requestUrl ? new URL(requestUrl) : null;
    // Preview and local addresses can't be reached by Payo; fall back to the published site.
    if (u && u.protocol === "https:" && !u.hostname.startsWith("id-preview--") && u.hostname !== "localhost")
      origin = u.origin;
  } catch {
    /* keep published */
  }
  return `${origin}${PAYO_WEBHOOK_PATH}`;
}

export type CreateOrderResult =
  | { ok: true; bidId: string; orderId: string; paymentUrl: string; amountEtb: number; createdAt: string }
  | { ok: false; error: "not-configured" | "invalid" | "cents" | "too-low" | "too-many" | "payo-failed"; minEtb?: number };

/** Body of the `create-payo-order` server function: create a pending bid, then a Payo order for it. */
export async function createPayoOrderForBid(input: {
  productId: string;
  productName: string;
  amountEtb: number;
  name: string;
  phone: string;
  requestUrl?: string;
}): Promise<CreateOrderResult> {
  const apiKey = process.env["PAYO_API_KEY"];
  if (!apiKey) return { ok: false, error: "not-configured" };

  const { data: active, error: activeErr } = await supabaseAdmin
    .from("payo_bids")
    .select("amount_etb")
    .eq("product_id", input.productId)
    .eq("status", "active");
  if (activeErr) throw new Error(activeErr.message);
  const amounts = (active ?? []).map((r) => Number(r.amount_etb));
  const v = validateCashBid(input.amountEtb, amounts);
  if (!v.ok) {
    const { minNextCashBid } = await import("./rules");
    return { ok: false, error: v.reason, minEtb: minNextCashBid(amounts) };
  }

  const since = new Date(Date.now() - PAYO_LINK_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("payo_bids")
    .select("id", { count: "exact", head: true })
    .eq("bidder_phone", input.phone)
    .eq("status", "pending")
    .gte("created_at", since);
  if ((count ?? 0) >= CASH_BID_MAX_PENDING) return { ok: false, error: "too-many" };

  const { data: bid, error: insErr } = await supabaseAdmin
    .from("payo_bids")
    .insert({
      product_id: input.productId,
      bidder_name: input.name,
      bidder_phone: input.phone,
      amount_etb: v.amountEtb,
      status: "pending",
    })
    .select("id, created_at")
    .single();
  if (insErr || !bid) throw new Error(insErr?.message ?? "insert failed");

  try {
    const order = await callPayoCreateOrder({
      apiKey,
      amount: v.amountEtb,
      description: `Platinum Ethiopia bid · ${input.productName} · ${v.amountEtb.toFixed(2)} ETB`,
      callbackUrl: webhookUrlFor(input.requestUrl),
      idempotencyKey: bid.id,
    });
    await supabaseAdmin
      .from("payo_bids")
      .update({ payo_order_id: order.orderId, payment_url: order.paymentUrl })
      .eq("id", bid.id);
    return { ok: true, bidId: bid.id, orderId: order.orderId, paymentUrl: order.paymentUrl, amountEtb: v.amountEtb, createdAt: bid.created_at };
  } catch (e) {
    console.error("[payo] create order failed", e);
    await supabaseAdmin.from("payo_bids").update({ status: "expired" }).eq("id", bid.id);
    return { ok: false, error: "payo-failed" };
  }
}
