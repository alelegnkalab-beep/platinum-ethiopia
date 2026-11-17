import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Check, Gavel, Lock, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import {
  MIN_ACTION_POINTS,
  START_PRICE_ETB,
  auctionEndsAt,
  auctionWinner,
  etbToPoints,
  highestBid,
  isAuctionEnded,
  minNextBid,
  pointsToEtb,
} from "@/lib/rules";
import { fmt, useNow, useStore } from "@/lib/store";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Countdown } from "./bits";
import { PayoBidBox } from "./PayoBidBox";

export function DetailsDrawer({
  product: p,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { signedIn, points, placeBid, addView, heldOn } = useStore();
  const now = useNow(60_000);
  const min = minNextBid(p.bids);
  const [amount, setAmount] = useState(String(min));
  const top = highestBid(p.bids);
  const ended = now !== null && isAuctionEnded(p.postedAt, now);
  const winner = now !== null ? auctionWinner(p.postedAt, p.bids, now) : undefined;
  const held = heldOn(p.id);
  const amountNum = Number(amount);
  const cost = Number.isFinite(amountNum) ? Math.max(0, etbToPoints(amountNum) - held) : 0;

  useEffect(() => {
    if (open) {
      addView(p.id);
      setAmount(String(minNextBid(p.bids)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = () => {
    const r = placeBid(p.id, Math.floor(amountNum));
    if (r.ok) {
      toast.success(r.message);
      setAmount(String(Math.floor(amountNum) + 1));
    } else toast.error(r.error);
  };

  const ends = new Date(auctionEndsAt(p.postedAt));

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="mx-auto max-h-[92vh] max-w-md border-border bg-popover">
        <div className="overflow-y-auto px-4 pb-8">
          <DrawerHeader className="px-0 text-left">
            <div className="flex gap-3">
              <img
                src={p.slides[0]?.image}
                alt={p.name}
                width={832}
                height={1040}
                className="h-20 w-16 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <DrawerTitle className="font-display text-lg">{p.name}</DrawerTitle>
                <DrawerDescription className="text-xs">{p.tagline}</DrawerDescription>
                <p className="mt-1 text-xs text-muted-foreground">{p.slides.map((s) => s.label).join(" · ")}</p>
              </div>
            </div>
          </DrawerHeader>

          <p className="text-sm leading-relaxed text-secondary-foreground">{p.description}</p>

          <ul className="mt-4 grid grid-cols-2 gap-2">
            {p.specs.map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-xl border bg-background/40 px-3 py-2 text-xs">
                <Check className="size-3.5 shrink-0 text-primary-glow" /> {s}
              </li>
            ))}
          </ul>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Stat label="መነሻ ዋጋ" value={`${START_PRICE_ETB} ብር`} />
            <Stat label="ከፍተኛ ጨረታ" value={`${fmt(top?.amountEtb ?? START_PRICE_ETB)} ብር`} highlight />
            <Stat label="ጨረታዎች" value={String(p.bids.length)} />
          </div>

          <div className="mt-4 rounded-2xl border bg-background/40 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" /> ጨረታው የሚያበቃው፡{" "}
              {ends.toLocaleDateString("am-ET", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <Countdown to={auctionEndsAt(p.postedAt)} />
            <p className="mt-2 text-[11px] text-muted-foreground">ከ21 ቀን በኋላ ከፍተኛውን ጨረታ ያቀረበ ያሸንፋል።</p>
          </div>

          <h3 className="mb-2 mt-5 text-sm font-bold">የጨረታ ታሪክ</h3>
          <ul className="space-y-1.5">
            {[...p.bids]
              .sort((a, b) => b.amountEtb - a.amountEtb)
              .slice(0, 6)
              .map((b, i) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    {i === 0 && <Trophy className="size-3.5 text-warning" />}
                    {b.user}
                    {b.mine && <span className="text-xs text-primary-glow">· እርስዎ</span>}
                  </span>
                  <span className="font-display font-semibold">{fmt(b.amountEtb)} ብር</span>
                </li>
              ))}
            {p.bids.length === 0 && <li className="text-xs text-muted-foreground">እስካሁን ጨረታ የለም</li>}
          </ul>

          <div className="mt-5 rounded-3xl border border-primary/30 bg-banner p-4">
            {ended ? (
              <p className="flex items-center gap-2 text-sm">
                <Trophy className="size-4 text-warning" /> ጨረታው ተጠናቋል · አሸናፊ: <b>{winner?.user ?? "—"}</b>
              </p>
            ) : !signedIn ? (
              <div className="text-center">
                <p className="mb-3 text-sm">ለመጫረት ይግቡ ወይም ይመዝገቡ</p>
                <Button asChild variant="platinum" size="xl" className="w-full">
                  <Link to="/login">ግባ / ይመዝገቡ</Link>
                </Button>
              </div>
            ) : points < MIN_ACTION_POINTS ? (
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="size-4 text-warning" /> ለመጫረት ቢያንስ {fmt(MIN_ACTION_POINTS)} ነጥብ (
                  {pointsToEtb(MIN_ACTION_POINTS)} ብር) ያስፈልጋል
                </p>
                <Progress value={(points / MIN_ACTION_POINTS) * 100} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  አሁን ያለዎት፡ {fmt(points)} ነጥብ · የሚቀረው {fmt(MIN_ACTION_POINTS - points)} ነጥብ
                </p>
                <Button asChild variant="glow" className="mt-3 w-full rounded-2xl">
                  <Link to="/tasks">ታስክ ሰርተው ነጥብ ያግኙ</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs text-muted-foreground" htmlFor={`bid-${p.id}`}>
                  የጨረታ መጠን (ብር) · ዝቅተኛ {fmt(min)} ብር
                </label>
                <div className="flex gap-2">
                  <Input
                    id={`bid-${p.id}`}
                    type="number"
                    inputMode="numeric"
                    min={min}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 rounded-2xl bg-background/60 font-display text-lg"
                  />
                  {[1, 5, 10].map((inc) => (
                    <Button
                      key={inc}
                      variant="soft"
                      className="h-12 rounded-2xl px-3"
                      onClick={() => setAmount(String(Math.max(min, Number(amount) || 0) + inc))}
                    >
                      +{inc}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  ወጪ፡ <b className="text-foreground">{fmt(cost)} ነጥብ</b> · ቀሪ ሂሳብ {fmt(points)} ነጥብ
                  {held > 0 && ` · ቀድሞ የያዙት ${fmt(held)} ነጥብ ይታሰባል`}
                </p>
                <Button variant="glow" size="xl" className="w-full" onClick={submit}>
                  <Gavel /> ጨረታ አስገባ
                </Button>
              </div>
            )}
          </div>

          <PayoBidBox product={p} open={open} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border bg-background/40 px-2 py-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={highlight ? "font-display text-sm font-bold text-platinum" : "font-display text-sm font-bold"}>
        {value}
      </p>
    </div>
  );
}
