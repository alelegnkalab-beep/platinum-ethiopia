import { describe, expect, it } from "vitest";
import {
  AUCTION_MS,
  DAY_MS,
  LUXURY_DRAW_BIDS,
  MIN_BID_ABOVE_ETB,
  PAYO_LINK_MINUTES,
  batteryPercent,
  canCheckIn,
  canConvertPoints,
  validateDeposit,
  canWithdraw,
  addisDay,
  checkBidAmount,
  etbToPoints,
  isFinished,
  lowestUniqueBid,
  maskPhone,
  nextAiDrop,
  pointsToEtb,
  validateBid,
  WELCOME_BONUS_POINTS,
  CHECKIN_POINTS,
  REFERRAL_POINTS,
  TASK_POINTS,
} from "./rules";

const now = Date.UTC(2026, 10, 16, 8, 0, 0);

describe("rules", () => {
  it("100 points = 10 ETB", () => {
    expect(pointsToEtb(100)).toBe(10);
    expect(etbToPoints(10)).toBe(100);
  });

  it("welcome bonus is 100 points", () => expect(WELCOME_BONUS_POINTS).toBe(100));
  it("rewards: task 100, check-in 20, referral 50", () => {
    expect(TASK_POINTS).toBe(100);
    expect(CHECKIN_POINTS).toBe(20);
    expect(REFERRAL_POINTS).toBe(50);
  });

  it("withdraw needs at least 1,000 points", () => {
    expect(canWithdraw(999, 999).ok).toBe(false);
    expect(canWithdraw(1000, 1000).ok).toBe(true);
    expect(canWithdraw(1500, 900).ok).toBe(false);
  });

  it("using points (converting to Wallet) needs at least 1,000 points", () => {
    expect(canConvertPoints(999, 500).ok).toBe(false);
    expect(canConvertPoints(1000, 1000)).toEqual({ ok: true, etb: 100 });
    expect(canConvertPoints(1200, 1300).ok).toBe(false);
  });

  it("AI posts at 1:00 AM Addis Ababa time (22:00 UTC)", () => {
    expect(new Date(nextAiDrop(now)).toISOString()).toBe("2026-11-16T22:00:00.000Z");
  });

  it("check-in once per Addis Ababa day", () => {
    expect(canCheckIn([], now)).toBe(true);
    expect(canCheckIn([addisDay(now)], now)).toBe(false);
    expect(canCheckIn([addisDay(now)], now + DAY_MS)).toBe(true);
  });
});

describe("minimum bids", () => {
  it("electronics must be more than 70 Birr", () => {
    expect(MIN_BID_ABOVE_ETB.electronics).toBe(70);
    expect(checkBidAmount("electronics", 70).ok).toBe(false);
    expect(checkBidAmount("electronics", 70.01).ok).toBe(true);
  });
  it("houses and cars must be more than 600 Birr", () => {
    expect(checkBidAmount("house", 600).ok).toBe(false);
    expect(checkBidAmount("car", 600).ok).toBe(false);
    expect(checkBidAmount("house", 600.5).ok).toBe(true);
    expect(checkBidAmount("car", 601).ok).toBe(true);
  });
  it("at most 2 decimals", () => expect(checkBidAmount("electronics", 75.255)).toMatchObject({ reason: "cents" }));
});

describe("winning rule: lowest unique bid", () => {
  const b = (user: string, amountEtb: number) => ({ user, amountEtb, at: now });
  it("the lowest amount nobody else chose wins", () => {
    const bids = [b("a", 71), b("b", 71), b("c", 72.5), b("d", 80), b("e", 72.5), b("f", 75)];
    expect(lowestUniqueBid(bids)?.user).toBe("f");
  });
  it("no winner when every amount is shared", () => {
    expect(lowestUniqueBid([b("a", 71), b("b", 71)])).toBeUndefined();
  });
  it("cents make amounts different", () => {
    expect(lowestUniqueBid([b("a", 71), b("b", 71.0), b("c", 71.01)])?.user).toBe("c");
  });
});

describe("auction end", () => {
  it("electronics run 21 days", () => {
    expect(AUCTION_MS).toBe(21 * DAY_MS);
    const base = { category: "electronics" as const, postedAt: now, totalBids: 99_999 };
    expect(isFinished({ ...base, now: now + 20 * DAY_MS })).toBe(false);
    expect(isFinished({ ...base, now: now + 21 * DAY_MS })).toBe(true);
  });
  it("houses and cars draw when the battery reaches 100% (10,000 bids)", () => {
    expect(LUXURY_DRAW_BIDS).toBe(10_000);
    expect(batteryPercent(5_000)).toBe(50);
    expect(batteryPercent(12_000)).toBe(100);
    const base = { category: "car" as const, postedAt: now, now: now + 365 * DAY_MS };
    expect(isFinished({ ...base, totalBids: 9_999 })).toBe(false);
    expect(isFinished({ ...base, totalBids: 10_000 })).toBe(true);
  });
});

describe("wallet bids", () => {
  const base = { category: "electronics" as const, finished: false };
  it("a bid is paid from the Wallet balance", () => {
    expect(validateBid({ ...base, walletEtb: 70.24, amountEtb: 70.25 })).toMatchObject({ reason: "insufficient" });
    expect(validateBid({ ...base, walletEtb: 70.25, amountEtb: 70.25 })).toEqual({ ok: true, amountEtb: 70.25 });
  });
  it("blocks bids at or below the minimum", () =>
    expect(validateBid({ ...base, walletEtb: 1000, amountEtb: 70 })).toMatchObject({ reason: "too-low" }));
  it("blocks repeating your own amount", () =>
    expect(validateBid({ ...base, walletEtb: 1000, amountEtb: 72, myAmounts: [72] })).toMatchObject({ reason: "duplicate" }));
  it("no bids after the auction ends", () =>
    expect(validateBid({ ...base, finished: true, walletEtb: 1000, amountEtb: 80 })).toMatchObject({ reason: "ended" }));
  it("Telebirr / bank top-up links last 10 minutes", () => expect(PAYO_LINK_MINUTES).toBe(10));
  it("top-ups allow up to 2 decimals", () => {
    expect(validateDeposit(150.25)).toEqual({ ok: true, amountEtb: 150.25 });
    expect(validateDeposit(0).ok).toBe(false);
  });
});

it("winner phone is partly hidden", () => expect(maskPhone("0911234578")).toBe("0911 •••• 78"));
