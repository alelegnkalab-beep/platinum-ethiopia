import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { PRODUCT_IDS } from "./products";
import { createPayoOrderForBid } from "./payo.server";

const PRODUCT_NAMES: Record<string, string> = {
  "iphone-15-pro-max": "iPhone 15 Pro Max",
  "galaxy-s24-ultra": "Samsung Galaxy S24 Ultra",
  "macbook-pro-m3": "MacBook Pro M3",
  "ps5-slim": "PS5 Slim",
  "sony-wh-1000xm5": "Sony WH-1000XM5",
};

const Input = z.object({
  productId: z.enum(PRODUCT_IDS),
  amountEtb: z.number().positive().max(10_000_000),
  name: z.string().trim().min(1).max(60),
  phone: z.string().trim().regex(/^\+?\d{9,15}$/),
});

/** create-payo-order: makes a pending direct bid and a Payo payment link for it. */
export const createPayoOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    let requestUrl: string | undefined;
    try {
      requestUrl = getRequest().url;
    } catch {
      requestUrl = undefined;
    }
    return createPayoOrderForBid({ ...data, productName: PRODUCT_NAMES[data.productId] ?? data.productId, requestUrl });
  });
