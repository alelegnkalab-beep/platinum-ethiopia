// Business rules for Platinum Ethiopia. Every value the user specified lives here.

export const POINTS_PER_ETB = 10; // 100 points = 10 ETB
export const WELCOME_BONUS_POINTS = 100;
export const MIN_ACTION_POINTS = 1000; // needed to withdraw or to bid with points
export const AUCTION_DAYS = 21;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const AUCTION_MS = AUCTION_DAYS * DAY_MS;
export const TASK_POINTS = 100;
export const CHECKIN_POINTS = 20;
export const REFERRAL_POINTS = 50;
export const AI_DAILY_COUNT = 5;
// 1:00 AM in Addis Ababa (UTC+3, no DST) = 7:00 Ethiopian local time = 22:00 UTC.
export const AI_POST_UTC_HOUR = 22;

// ---- Categories & minimum bids ----
export type Category = "electronics" | "house" | "car";
/** A bid must be strictly greater than this many ETB. */
export const MIN_BID_ABOVE_ETB: Record<Category, number> = { electronics: 70, house: 600, car: 600 };
/** Step used by the − / + buttons. */
export const BID_STEP_ETB = 1;
/** Luxury (house & car) draws happen when the battery is full — secretly at this many bids. */
export const LUXURY_DRAW_BIDS = 10_000;
export const isLuxury = (c: Category) => c !== "electronics";

export const pointsToEtb = (points: number) => points / POINTS_PER_ETB;
export const etbToPoints = (etb: number) => Math.round(etb * POINTS_PER_ETB);
export const roundEtb = (n: number) => Math.round(n * 100) / 100;
const cents = (n: number) => Math.round(n * 100);

export function canWithdraw(balance: number, amountPoints: number) {
  if (balance < MIN_ACTION_POINTS) return { ok: false as const, reason: "min-balance" as const };
  if (amountPoints < MIN_ACTION_POINTS) return { ok: false as const, reason: "min-amount" as const };
  if (amountPoints > balance) return { ok: false as const, reason: "insufficient" as const };
  return { ok: true as const };
}

/** Amount check shared by every bid path: > category minimum, at most 2 decimals. */
export function checkBidAmount(category: Category, amountEtb: number) {
  if (!Number.isFinite(amountEtb) || amountEtb <= 0) return { ok: false as const, reason: "invalid" as const };
  if (Math.abs(cents(amountEtb) - amountEtb * 100) > 1e-6) return { ok: false as const, reason: "cents" as const };
  if (amountEtb <= MIN_BID_ABOVE_ETB[category]) return { ok: false as const, reason: "too-low" as const };
  return { ok: true as const, amountEtb: roundEtb(amountEtb) };
}

export type BidLike = { user: string; amountEtb: number; at: number };

/** Winning rule: the lowest amount that exactly one bid chose (ዝቅተኛ ብቸኛ ዋጋ). */
export function lowestUniqueBid<T extends BidLike>(bids: T[]): T | undefined {
  const byAmount = new Map<number, T[]>();
  for (const b of bids) {
    const k = cents(b.amountEtb);
    byAmount.set(k, [...(byAmount.get(k) ?? []), b]);
  }
  const unique = [...byAmount.entries()].filter(([, list]) => list.length === 1).sort((a, b) => a[0] - b[0]);
  return unique[0]?.[1][0];
}

export const auctionEndsAt = (postedAt: number) => postedAt + AUCTION_MS;
export const isAuctionEnded = (postedAt: number, now: number) => now >= auctionEndsAt(postedAt);

/** Electronics end after 21 days; houses & cars end when the battery (bid count) is full. */
export function isFinished(opts: { category: Category; postedAt: number; totalBids: number; now: number }) {
  return isLuxury(opts.category) ? opts.totalBids >= LUXURY_DRAW_BIDS : isAuctionEnded(opts.postedAt, opts.now);
}

export const batteryPercent = (totalBids: number) => Math.min(100, (Math.max(0, totalBids) / LUXURY_DRAW_BIDS) * 100);

/**
 * Bids are paid from the in-app Wallet (ETB). Each bid is a separate entry and costs its full amount.
 * `myAmounts` are the user's earlier bids on this item — repeating one would only cancel it out.
 */
export function validateBid(opts: {
  walletEtb: number;
  amountEtb: number;
  category: Category;
  finished: boolean;
  myAmounts?: number[];
}) {
  const { walletEtb, amountEtb, category, finished, myAmounts = [] } = opts;
  if (finished) return { ok: false as const, reason: "ended" as const };
  const a = checkBidAmount(category, amountEtb);
  if (!a.ok) return a;
  if (myAmounts.some((m) => cents(m) === cents(a.amountEtb))) return { ok: false as const, reason: "duplicate" as const };
  if (a.amountEtb > walletEtb + 1e-9) return { ok: false as const, reason: "insufficient" as const };
  return { ok: true as const, amountEtb: a.amountEtb };
}

/** Points → Wallet ETB. Using points needs at least 1,000 points (same as withdrawing or bidding). */
export function canConvertPoints(balance: number, amountPoints: number) {
  if (balance < MIN_ACTION_POINTS) return { ok: false as const, reason: "min-balance" as const };
  if (!Number.isInteger(amountPoints) || amountPoints <= 0) return { ok: false as const, reason: "invalid" as const };
  if (amountPoints > balance) return { ok: false as const, reason: "insufficient" as const };
  return { ok: true as const, etb: pointsToEtb(amountPoints) };
}

/** Public display of a winner's phone: keeps the first 4 and last 2 digits. */
export function maskPhone(phone: string) {
  const d = phone.replace(/[^\d+]/g, "");
  if (d.length < 7) return "••••";
  return `${d.slice(0, 4)} •••• ${d.slice(-2)}`;
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

// ---- Wallet top-ups paid by Telebirr / bank receipt through Payo ----
export const PAYO_LINK_MINUTES = 10; // Payo payment links expire after 10 minutes
export const DEPOSIT_MAX_PENDING = 3; // open (unpaid) top-ups one phone may hold at once
export const DEPOSIT_MIN_ETB = 1;
export const DEPOSIT_MAX_ETB = 100_000;

export function validateDeposit(amountEtb: number) {
  if (!Number.isFinite(amountEtb) || amountEtb < DEPOSIT_MIN_ETB || amountEtb > DEPOSIT_MAX_ETB)
    return { ok: false as const, reason: "invalid" as const };
  if (Math.abs(cents(amountEtb) - amountEtb * 100) > 1e-6) return { ok: false as const, reason: "cents" as const };
  return { ok: true as const, amountEtb: roundEtb(amountEtb) };
}
