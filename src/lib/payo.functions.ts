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
