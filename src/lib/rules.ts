// Business rules for Platinum Ethiopia. Every value the user specified lives here.

export const POINTS_PER_ETB = 10; // 100 points = 10 ETB
export const WELCOME_BONUS_POINTS = 100;
export const MIN_ACTION_POINTS = 1000; // needed to withdraw or to bid
export const START_PRICE_ETB = 50;
export const AUCTION_DAYS = 21;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const AUCTION_MS = AUCTION_DAYS * DAY_MS;
export const TASK_POINTS = 100;
export const CHECKIN_POINTS = 20;
export const REFERRAL_POINTS = 50;
export const AI_DAILY_COUNT = 5;
// 1:00 AM in Addis Ababa (UTC+3, no DST) = 7:00 Ethiopian local time = 22:00 UTC.
export const AI_POST_UTC_HOUR = 22;

export const pointsToEtb = (points: number) => points / POINTS_PER_ETB;
export const etbToPoints = (etb: number) => Math.round(etb * POINTS_PER_ETB);

export function canWithdraw(balance: number, amountPoints: number) {
  if (balance < MIN_ACTION_POINTS) return { ok: false as const, reason: "min-balance" as const };
  if (amountPoints < MIN_ACTION_POINTS) return { ok: false as const, reason: "min-amount" as const };
  if (amountPoints > balance) return { ok: false as const, reason: "insufficient" as const };
  return { ok: true as const };
}

export type BidLike = { user: string; amountEtb: number; at: number };

export function highestBid<T extends BidLike>(bids: T[]): T | undefined {
  return [...bids].sort((a, b) => b.amountEtb - a.amountEtb || a.at - b.at)[0];
}

export function minNextBid(bids: BidLike[]) {
  const top = highestBid(bids);
  return top ? top.amountEtb + 1 : START_PRICE_ETB;
}

/**
 * Bids are paid in points. `heldOnItem` is what the user already has on this item;
 * raising your own bid only charges the difference.
 */
export function validateBid(opts: {
  balance: number;
  amountEtb: number;
  bids: BidLike[];
  heldOnItem?: number;
  postedAt: number;
  now: number;
}) {
  const { balance, amountEtb, bids, heldOnItem = 0, postedAt, now } = opts;
  if (isAuctionEnded(postedAt, now)) return { ok: false as const, reason: "ended" as const };
  if (balance < MIN_ACTION_POINTS) return { ok: false as const, reason: "min-balance" as const };
  if (!Number.isFinite(amountEtb) || amountEtb < minNextBid(bids))
    return { ok: false as const, reason: "too-low" as const };
  const cost = etbToPoints(amountEtb) - heldOnItem;
  if (cost > balance) return { ok: false as const, reason: "insufficient" as const };
  return { ok: true as const, cost };
}

export const auctionEndsAt = (postedAt: number) => postedAt + AUCTION_MS;
export const isAuctionEnded = (postedAt: number, now: number) => now >= auctionEndsAt(postedAt);

export function auctionWinner<T extends BidLike>(postedAt: number, bids: T[], now: number) {
  return isAuctionEnded(postedAt, now) ? highestBid(bids) : undefined;
}

export function nextAiDrop(now: number) {
  const d = new Date(now);
  d.setUTCHours(AI_POST_UTC_HOUR, 0, 0, 0);
  if (d.getTime() <= now) d.setUTCDate(d.getUTCDate() + 1);
  return d.getTime();
}
export const lastAiDrop = (now: number) => nextAiDrop(now) - DAY_MS;

/** Calendar day in Addis Ababa, e.g. "2026-11-16". */
export function addisDay(ts: number) {
  return new Date(ts + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const canCheckIn = (checkIns: string[], now: number) => !checkIns.includes(addisDay(now));

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// ---- Direct bids paid by Telebirr / bank receipt through Payo (no points) ----
export const CASH_BID_MIN_ETB = START_PRICE_ETB; // first direct bid can be 50 ETB (e.g. 50.25)
export const CASH_BID_STEP_ETB = 0.01; // a new direct bid must beat the top verified one by at least 1 cent
export const PAYO_LINK_MINUTES = 10; // Payo payment links expire after 10 minutes
export const CASH_BID_MAX_PENDING = 3; // open (unpaid) direct bids one phone may hold at once

export const roundEtb = (n: number) => Math.round(n * 100) / 100;

/** Lowest direct bid allowed, given the amounts of already verified (active) direct bids. */
export function minNextCashBid(activeAmounts: number[]) {
  if (activeAmounts.length === 0) return CASH_BID_MIN_ETB;
  return Math.max(CASH_BID_MIN_ETB, roundEtb(Math.max(...activeAmounts) + CASH_BID_STEP_ETB));
}

export function validateCashBid(amountEtb: number, activeAmounts: number[]) {
  if (!Number.isFinite(amountEtb) || amountEtb <= 0) return { ok: false as const, reason: "invalid" as const };
  if (Math.abs(Math.round(amountEtb * 100) - amountEtb * 100) > 1e-6)
    return { ok: false as const, reason: "cents" as const };
  if (amountEtb < minNextCashBid(activeAmounts)) return { ok: false as const, reason: "too-low" as const };
  return { ok: true as const, amountEtb: roundEtb(amountEtb) };
}
