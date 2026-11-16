import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedProducts, type Product } from "./products";
import {
  CHECKIN_POINTS,
  TASK_POINTS,
  WELCOME_BONUS_POINTS,
  addisDay,
  canCheckIn,
  canWithdraw,
  lastAiDrop,
  pointsToEtb,
  validateBid,
} from "./rules";
import type { TaskId } from "./tasks";

export type TxType = "welcome" | "task" | "checkin" | "referral" | "bid" | "refund" | "withdraw";
export type Tx = { id: string; type: TxType; points: number; label: string; at: number };
export type Withdrawal = {
  id: string;
  points: number;
  etb: number;
  method: string;
  account: string;
  status: "pending";
  at: number;
};
export type Account = { name: string; phone: string; code: string; joinedAt: number; invitedBy?: string };

type State = {
  signedIn: boolean;
  account: Account | null;
  points: number;
  txs: Tx[];
  tasks: TaskId[];
  checkIns: string[];
  withdrawals: Withdrawal[];
  referrals: number;
  products: Product[];
};

const KEY = "platinum-ethiopia:v1";
const uid = () => Math.random().toString(36).slice(2, 10);

function freshState(now: number): State {
  return {
    signedIn: false,
    account: null,
    points: 0,
    txs: [],
    tasks: [],
    checkIns: [],
    withdrawals: [],
    referrals: 0,
    products: seedProducts(lastAiDrop(now)),
  };
}

type Result = { ok: true; message?: string } | { ok: false; error: string };

type Store = State & {
  hydrated: boolean;
  join: (name: string, phone: string, invitedBy?: string) => Result;
  logout: () => void;
  completeTask: (id: TaskId, name: string) => Result;
  checkIn: () => Result;
  placeBid: (productId: string, amountEtb: number) => Result;
  toggleLike: (productId: string) => void;
  addComment: (productId: string, text: string) => void;
  addView: (productId: string) => void;
  withdraw: (points: number, method: string, account: string) => Result;
  heldOn: (productId: string) => number;
};

const Ctx = createContext<Store | null>(null);

export const BID_ERRORS: Record<string, string> = {
  ended: "ይህ ጨረታ ተጠናቋል",
  "min-balance": "ለመጫረት ቢያንስ 1,000 ነጥብ (100 ብር) ያስፈልጋል",
  "too-low": "ጨረታዎ ከአሁኑ ከፍተኛ ጨረታ መብለጥ አለበት",
  insufficient: "በቂ ነጥብ የለዎትም",
};
export const WITHDRAW_ERRORS: Record<string, string> = {
  "min-balance": "ለማውጣት ቢያንስ 1,000 ነጥብ (100 ብር) ያስፈልጋል",
  "min-amount": "ዝቅተኛው የማውጫ መጠን 1,000 ነጥብ (100 ብር) ነው",
  insufficient: "በቂ ነጥብ የለዎትም",
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => freshState(Date.now()));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const needAuth: Result = { ok: false, error: "እባክዎ መጀመሪያ ይግቡ" };

  const join = useCallback<Store["join"]>(
    (name, phone, invitedBy) => {
      const now = Date.now();
      const clean = phone.replace(/\s/g, "");
      if (state.account && state.account.phone === clean) {
        setState((s) => ({ ...s, signedIn: true }));
        return { ok: true, message: `እንኳን ደህና ተመለሱ፣ ${state.account.name}!` };
      }
      const code = `PLT${clean.slice(-4)}${uid().slice(0, 3).toUpperCase()}`;
      setState({
        ...freshState(now),
        products: state.products,
        signedIn: true,
        account: { name: name.trim(), phone: clean, code, joinedAt: now, ...(invitedBy?.trim() ? { invitedBy: invitedBy.trim() } : {}) },
        points: WELCOME_BONUS_POINTS,
        txs: [{ id: uid(), type: "welcome", points: WELCOME_BONUS_POINTS, label: "የእንኳን ደህና መጡ ስጦታ", at: now }],
      });
      return { ok: true, message: `🎉 ${WELCOME_BONUS_POINTS} ነጥብ (${pointsToEtb(WELCOME_BONUS_POINTS)} ብር) ተሰጥቶዎታል!` };
    },
    [state.account, state.products],
  );

  const logout = useCallback(() => setState((s) => ({ ...s, signedIn: false })), []);

  const completeTask = useCallback<Store["completeTask"]>(
    (id, name) => {
      if (!state.signedIn) return needAuth;
      if (state.tasks.includes(id)) return { ok: false, error: "ይህን ታስክ አስቀድመው ጨርሰዋል" };
      setState((s) => ({
        ...s,
        tasks: [...s.tasks, id],
        points: s.points + TASK_POINTS,
        txs: [{ id: uid(), type: "task", points: TASK_POINTS, label: `${name} ታስክ`, at: Date.now() }, ...s.txs],
      }));
      return { ok: true, message: `+${TASK_POINTS} ነጥብ` };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.signedIn, state.tasks],
  );

  const checkIn = useCallback<Store["checkIn"]>(() => {
    if (!state.signedIn) return needAuth;
    const now = Date.now();
    if (!canCheckIn(state.checkIns, now)) return { ok: false, error: "ዛሬ አስቀድመው ቼክ-ኢን አድርገዋል" };
    setState((s) => ({
      ...s,
      checkIns: [...s.checkIns, addisDay(now)],
      points: s.points + CHECKIN_POINTS,
      txs: [{ id: uid(), type: "checkin", points: CHECKIN_POINTS, label: "ዴይሊ ቼክ-ኢን", at: now }, ...s.txs],
    }));
    return { ok: true, message: `+${CHECKIN_POINTS} ነጥብ` };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.signedIn, state.checkIns]);

  const heldOn = useCallback(
    (productId: string) => {
      const p = state.products.find((x) => x.id === productId);
      const mine = p?.bids.filter((b) => b.mine).sort((a, b) => b.amountEtb - a.amountEtb)[0];
      return mine ? mine.amountEtb * 10 : 0;
    },
    [state.products],
  );

  const placeBid = useCallback<Store["placeBid"]>(
    (productId, amountEtb) => {
      if (!state.signedIn || !state.account) return needAuth;
      const p = state.products.find((x) => x.id === productId);
      if (!p) return { ok: false, error: "ምርቱ አልተገኘም" };
      const now = Date.now();
      const held = heldOn(productId);
      const v = validateBid({ balance: state.points, amountEtb, bids: p.bids, heldOnItem: held, postedAt: p.postedAt, now });
      if (!v.ok) return { ok: false, error: BID_ERRORS[v.reason] ?? "ስህተት" };
      const user = state.account.name;
      setState((s) => ({
        ...s,
        points: s.points - v.cost,
        txs: [
          { id: uid(), type: "bid", points: -v.cost, label: `ጨረታ · ${p.name} (${amountEtb} ብር)`, at: now },
          ...s.txs,
        ],
        products: s.products.map((x) =>
          x.id === productId ? { ...x, bids: [...x.bids, { id: uid(), user, amountEtb, at: now, mine: true }] } : x,
        ),
      }));
      return { ok: true, message: `✅ የ${amountEtb} ብር ጨረታዎ ተመዝግቧል` };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.signedIn, state.account, state.products, state.points, heldOn],
  );

  const toggleLike = useCallback((productId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((x) =>
        x.id === productId ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x,
      ),
    }));
  }, []);

  const addComment = useCallback(
    (productId: string, text: string) => {
      const user = state.account?.name ?? "እንግዳ";
      setState((s) => ({
        ...s,
        products: s.products.map((x) =>
          x.id === productId
            ? { ...x, comments: [...x.comments, { id: uid(), user, text, at: Date.now(), mine: true }] }
            : x,
        ),
      }));
    },
    [state.account],
  );

  const addView = useCallback((productId: string) => {
    setState((s) => ({
      ...s,
      products: s.products.map((x) => (x.id === productId ? { ...x, views: x.views + 1 } : x)),
    }));
  }, []);

  const withdraw = useCallback<Store["withdraw"]>(
    (points, method, account) => {
      if (!state.signedIn) return needAuth;
      const v = canWithdraw(state.points, points);
      if (!v.ok) return { ok: false, error: WITHDRAW_ERRORS[v.reason] ?? "ስህተት" };
      const now = Date.now();
      setState((s) => ({
        ...s,
        points: s.points - points,
        withdrawals: [
          { id: uid(), points, etb: pointsToEtb(points), method, account, status: "pending", at: now },
          ...s.withdrawals,
        ],
        txs: [{ id: uid(), type: "withdraw", points: -points, label: `ማውጫ · ${method}`, at: now }, ...s.txs],
      }));
      return { ok: true, message: `የ${pointsToEtb(points)} ብር ማውጫ ጥያቄዎ ተልኳል` };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.signedIn, state.points],
  );

  const value = useMemo<Store>(
    () => ({ ...state, hydrated, join, logout, completeTask, checkIn, placeBid, toggleLike, addComment, addView, withdraw, heldOn }),
    [state, hydrated, join, logout, completeTask, checkIn, placeBid, toggleLike, addComment, addView, withdraw, heldOn],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

/** Ticks every second after hydration; null during SSR so timers don't mismatch. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export const fmt = (n: number) => n.toLocaleString("en-US");
