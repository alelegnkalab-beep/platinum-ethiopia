import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Clock, ExternalLink, Landmark, Loader2, Receipt, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { CASH_BID_STEP_ETB, PAYO_LINK_MINUTES, isAuctionEnded, minNextCashBid } from "@/lib/rules";
import { createPayoOrder } from "@/lib/payo.functions";
import { useNow, useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "pending" | "active" | "rejected" | "expired";
type MyBid = { id: string; productId: string; amountEtb: number; paymentUrl: string; at: number; status: Status };
type PublicBid = { id: string; bidder_name: string; amount_etb: number; verified_at: string | null };

const MY_KEY = "platinum-ethiopia:payo-bids";
const readMine = (): MyBid[] => {
  try {
    return JSON.parse(localStorage.getItem(MY_KEY) ?? "[]") as MyBid[];
  } catch {
    return [];
  }
};
const writeMine = (b: MyBid[]) => localStorage.setItem(MY_KEY, JSON.stringify(b.slice(0, 30)));
const etb = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ERRORS: Record<string, string> = {
  "not-configured": "የPayo ክፍያ ገና አልተዘጋጀም። እባክዎ ቆይተው ይሞክሩ።",
  invalid: "ትክክለኛ የብር መጠን ያስገቡ",
  cents: "እስከ 2 የአስርዮሽ ቦታ ብቻ (ለምሳሌ 50.25)",
  "too-low": "ጨረታዎ ከተረጋገጠው ከፍተኛ ጨረታ መብለጥ አለበት",
  "too-many": "ያልተከፈሉ ጨረታዎች አሉዎት። መጀመሪያ እነሱን ይክፈሉ ወይም 10 ደቂቃ ይጠብቁ።",
  "payo-failed": "የክፍያ ሊንክ መፍጠር አልተቻለም። እንደገና ይሞክሩ።",
};

/** Direct bid paid in ETB via Telebirr / bank receipt through Payo — no points needed. */
export function PayoBidBox({ product: p, open }: { product: Product; open: boolean }) {
  const { signedIn, account } = useStore();
  const now = useNow(5_000);
  const create = useServerFn(createPayoOrder);
  const [verified, setVerified] = useState<PublicBid[]>([]);
  const [mine, setMine] = useState<MyBid[]>([]);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const min = minNextCashBid(verified.map((b) => Number(b.amount_etb)));
  const myHere = mine.filter((b) => b.productId === p.id);
  const ended = now !== null && isAuctionEnded(p.postedAt, now);

  const loadVerified = useCallback(async () => {
    const { data } = await supabase
      .from("payo_bids")
      .select("id, bidder_name, amount_etb, verified_at")
      .eq("product_id", p.id)
      .eq("status", "active")
      .order("amount_etb", { ascending: false })
      .limit(6);
    if (data) setVerified(data as PublicBid[]);
  }, [p.id]);

  const refreshMine = useCallback(async () => {
    const list = readMine();
    const pending = list.filter((b) => b.status === "pending").map((b) => b.id);
    if (pending.length) {
      const { data } = await supabase.from("payo_bids").select("id, status").in("id", pending);
      const byId = new Map((data ?? []).map((r) => [r.id, r.status as Status]));
      const next = list.map((b) => (byId.has(b.id) ? { ...b, status: byId.get(b.id)! } : b));
      if (next.some((b, i) => b.status !== list[i]?.status)) {
        next.forEach((b, i) => {
          if (b.status === "active" && list[i]?.status !== "active") toast.success(`✅ የ${etb(b.amountEtb)} ብር ጨረታዎ ተረጋግጧል!`);
        });
        writeMine(next);
        void loadVerified();
      }
      setMine(next);
    } else setMine(list);
  }, [loadVerified]);

  useEffect(() => {
    if (!open) return undefined;
    void loadVerified();
    void refreshMine();
    const t = setInterval(() => void refreshMine(), 5_000);
    const v = setInterval(() => void loadVerified(), 20_000);
    return () => {
      clearInterval(t);
      clearInterval(v);
    };
  }, [open, loadVerified, refreshMine]);

  useEffect(() => {
    if (open) setAmount((a) => (a && Number(a) >= min ? a : min.toFixed(2)));
  }, [open, min]);

  const submit = async () => {
    if (!account) return;
    const amountEtb = Number(amount);
    if (!Number.isFinite(amountEtb) || amountEtb < min) {
      toast.error(`ዝቅተኛው ${etb(min)} ብር ነው`);
      return;
    }
    // Open the tab now (inside the click) so the browser doesn't block it as a pop-up.
    const tab = window.open("", "_blank");
    setBusy(true);
    try {
      const r = await create({ data: { productId: p.id, amountEtb, name: account.name, phone: account.phone } });
      if (!r.ok) {
        tab?.close();
        toast.error(r.error === "too-low" && r.minEtb ? `ዝቅተኛው ${etb(r.minEtb)} ብር ነው` : ERRORS[r.error] ?? "ስህተት");
        if (r.error === "too-low") void loadVerified();
        return;
      }
      const bid: MyBid = { id: r.bidId, productId: p.id, amountEtb: r.amountEtb, paymentUrl: r.paymentUrl, at: Date.now(), status: "pending" };
      const next = [bid, ...readMine()];
      writeMine(next);
      setMine(next);
      if (tab) tab.location.href = r.paymentUrl;
      toast.success("የክፍያ ገጹ ተከፍቷል። ከከፈሉ በኋላ ደረሰኙን ይጫኑ።");
    } catch {
      tab?.close();
      toast.error("የክፍያ ሊንክ መፍጠር አልተቻለም። እንደገና ይሞክሩ።");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 rounded-3xl border border-primary/30 bg-background/40 p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Landmark className="size-4 text-primary-glow" /> በቀጥታ ይክፈሉ · Telebirr / ባንክ
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        ነጥብ ሳያስፈልግ በብር ይጫረቱ። በTelebirr፣ CBE ወይም አቢሲኒያ ከፍለው ደረሰኙን ሲጭኑ ጨረታዎ ይረጋገጣል።
      </p>

      {verified.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {verified.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                <BadgeCheck className="size-3.5 text-primary-glow" /> {b.bidder_name}
              </span>
              <span className="font-display font-semibold">{etb(Number(b.amount_etb))} ብር</span>
            </li>
          ))}
        </ul>
      )}

      {ended ? null : !signedIn || !account ? (
        <p className="mt-3 text-xs text-muted-foreground">በቀጥታ ለመክፈል መጀመሪያ ይግቡ።</p>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="text-xs text-muted-foreground" htmlFor={`payo-${p.id}`}>
            የጨረታ መጠን (ብር) · ዝቅተኛ {etb(min)} ብር
          </label>
          <Input
            id={`payo-${p.id}`}
            type="number"
            inputMode="decimal"
            step={CASH_BID_STEP_ETB}
            min={min}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 rounded-2xl bg-background/60 font-display text-lg"
          />
          <Button variant="platinum" size="xl" className="w-full" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Receipt />} በTelebirr / ባንክ ክፈል
          </Button>
        </div>
      )}

      {myHere.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          <li className="text-xs font-semibold text-muted-foreground">የእርስዎ ቀጥታ ጨረታዎች</li>
          {myHere.map((b) => {
            const stale = b.status === "pending" && now !== null && now - b.at > (PAYO_LINK_MINUTES + 5) * 60_000;
            const status: Status = stale ? "expired" : b.status;
            return (
              <li key={b.id} className="flex items-center justify-between gap-2 rounded-xl bg-background/40 px-3 py-2 text-xs">
                <span className="font-display text-sm font-semibold">{etb(b.amountEtb)} ብር</span>
                {status === "active" ? (
                  <span className="flex items-center gap-1 text-primary-glow"><BadgeCheck className="size-3.5" /> ተረጋግጧል · ንቁ</span>
                ) : status === "pending" ? (
                  <a href={b.paymentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-warning">
                    <Clock className="size-3.5" /> ደረሰኝ በመጠባበቅ ላይ · ክፈል <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <XCircle className="size-3.5" /> {status === "rejected" ? "ውድቅ ተደርጓል" : "ጊዜው አልፏል"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
