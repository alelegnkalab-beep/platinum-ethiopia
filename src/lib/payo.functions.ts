import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PRODUCT_IDS, seedProducts } from "./products";

const Input = z.object({
  productId: z.enum(PRODUCT_IDS),
  amountEtb: z.number().positive().max(10_000_000),
  name: z.string().trim().min(1).max(60),
  phone: z.string().trim().regex(/^\+?\d{9,15}$/),
});

/** create-payo-order: makes a pending direct bid and a Payo payment link for it. */
export const createPayoOrder = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const { createPayoOrderForBid } = await import("./payo.server");
    let requestUrl: string | undefined;
    try {
      requestUrl = getRequest().url;
    } catch {
      requestUrl = undefined;
    }
    const productName = seedProducts(0).find((p) => p.id === data.productId)?.name ?? data.productId;
    return createPayoOrderForBid({ ...data, productName, requestUrl });
  });

const StatusInput = z.object({ ids: z.array(z.string().uuid()).max(30) });

/** Status check for the caller's own receipt bids (ids are unguessable and only known to the bidder's device). */
export const getPayoBidStatuses = createServerFn({ method: "POST" })
  .validator((d: unknown) => StatusInput.parse(d))
  .handler(async ({ data }) => {
    if (data.ids.length === 0) return [] as { id: string; status: string }[];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("payo_bids").select("id, status").in("id", data.ids);
    if (error) {
      console.error("getPayoBidStatuses failed", error.message);
      return [] as { id: string; status: string }[];
    }
    return (rows ?? []).map((r) => ({ id: r.id, status: r.status }));
  });
