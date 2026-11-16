import { describe, expect, it } from "vitest";
import {
  AUCTION_MS,
  DAY_MS,
  auctionWinner,
  canCheckIn,
  canWithdraw,
  addisDay,
  etbToPoints,
  minNextBid,
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

  it("bidding needs at least 1,000 points", () => {
    const base = { amountEtb: 50, bids: [], postedAt: now, now };
    expect(validateBid({ ...base, balance: 999 }).ok).toBe(false);
    expect(validateBid({ ...base, balance: 1000 }).ok).toBe(true);
  });

  it("every item starts at 50 ETB", () => {
    expect(minNextBid([])).toBe(50);
    expect(validateBid({ balance: 5000, amountEtb: 49, bids: [], postedAt: now, now }).ok).toBe(false);
  });

  it("a bid must beat the current highest", () => {
    const bids = [{ user: "a", amountEtb: 70, at: now }];
    expect(minNextBid(bids)).toBe(71);
    expect(validateBid({ balance: 5000, amountEtb: 70, bids, postedAt: now, now }).ok).toBe(false);
  });

  it("auction runs 21 days, then the highest bidder wins", () => {
    expect(AUCTION_MS).toBe(21 * DAY_MS);
    const bids = [
      { user: "a", amountEtb: 60, at: now },
      { user: "b", amountEtb: 90, at: now + 1 },
    ];
    expect(auctionWinner(now, bids, now + 20 * DAY_MS)).toBeUndefined();
    expect(auctionWinner(now, bids, now + 21 * DAY_MS)?.user).toBe("b");
    expect(validateBid({ balance: 5000, amountEtb: 100, bids, postedAt: now, now: now + 21 * DAY_MS }).ok).toBe(false);
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
