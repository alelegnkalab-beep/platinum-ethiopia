import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Eye, Heart, Info, MessageCircle, Send, Share2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { START_PRICE_ETB, auctionEndsAt, auctionWinner, highestBid, isAuctionEnded } from "@/lib/rules";
import { fmt, useNow, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Countdown } from "./bits";
import { ImageSlider } from "./ImageSlider";
import { DetailsDrawer } from "./DetailsDrawer";

export function bidderCount(p: Product) {
  return new Set(p.bids.map((b) => b.user)).size;
}

export function ProductCard({ product: p, eager }: { product: Product; eager?: boolean | undefined }) {
  const { toggleLike, addComment } = useStore();
  const now = useNow(60_000);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const top = highestBid(p.bids);
    const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState(top + 5);

  const ended = now !== null && isAuctionEnded(p.postedAt, now);
  const winner = now !== null ? auctionWinner(p.postedAt, p.bids, now) : undefined;

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const data = { title: `${p.name} · ፕላቲኒየም ኢትዮጵያ`, text: `${p.name} ከ${START_PRICE_ETB} ብር ጀምሮ ጨረታ ላይ!`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(`${data.text} ${url}`);
        toast.success("ሊንኩ ተቀድቷል");
      }
    } catch {
      /* share cancelled */
    }
  };

  return (
    <article className="overflow-hidden rounded-[1.75rem] border bg-surface shadow-card">
      <div className="relative">
        <ImageSlider slides={p.slides} alt={p.name} eager={eager} />
            

        
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold leading-tight">{p.name}</h2>
            <p className="text-xs text-muted-foreground">{p.tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">ከፍተኛ ጨረታ</p>
            <p className="font-display text-xl font-extrabold text-platinum">
              {fmt(top?.amountEtb ?? START_PRICE_ETB)} <span className="text-xs">ብር</span>
            </p>
            <p className="text-[10px] text-muted-foreground">መነሻ {START_PRICE_ETB} ብር</p>
          </div>
        </div>

        {ended ? (
          <div className="flex items-center gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm">
            <Trophy className="size-4 text-warning" />
            ጨረታው ተጠናቋል · አሸናፊ: <b>{winner?.user ?? "—"}</b>
          </div>
        ) : (
          <div>
            <p className="mb-1.5 text-[11px] text-muted-foreground">የ21 ቀን ጨረታ · የቀረው ጊዜ</p>
            <Countdown to={auctionEndsAt(p.postedAt)} />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" /> {fmt(p.views)} እይታ
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" /> {bidderCount(p)} ተጫራቾች
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="size-4" /> {p.comments.length} አስተያየት
          </span>
        </div>

              <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-1.5">
          <Button
            type="button"
            variant="soft"
            size="icon"
            className="size-11 shrink-0 rounded-xl text-lg font-extrabold"
            onClick={() => setBidAmount((prev) => Math.max(top + 1, prev - 5))}
          >
            -
          </Button>
          <Button
            type="button"
            variant="glow"
            className="h-11 flex-1 rounded-xl text-sm font-extrabold"
            onClick={() => navigate("/wallet")}
          >
            ክፈል / ጨርት ({fmt(bidAmount)} ብር)
          </Button>
          <Button
            type="button"
            variant="soft"
            size="icon"
            className="size-11 shrink-0 rounded-xl text-lg font-extrabold"
            onClick={() => setBidAmount((prev) => prev + 5)}
          >
            +
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="soft"
              size="icon"
              aria-label="ላይክ"
              aria-pressed={p.liked}
              className="h-10 w-auto rounded-2xl px-3"
              onClick={() => {
                toggleLike(p.id);
                setPop(true);
                setTimeout(() => setPop(false), 300);
              }}
            >
              <Heart className={cn(p.liked && "fill-rose-500 text-rose-500")} />
              <span className="text-xs">{fmt(p.likes)}</span>
            </Button>
            <Button
              variant="soft"
              size="icon"
              aria-label="አስተያየት"
              aria-expanded={showComments}
              className="size-10 rounded-2xl"
              onClick={() => setShowComments((v) => !v)}
            >
              <MessageCircle />
            </Button>
            <Button variant="soft" size="icon" className="size-10 rounded-2xl" onClick={share}>
              <Share2 />
            </Button>
          </div>
          <Button variant="soft" className="h-10 rounded-2xl px-3 text-xs font-semibold" onClick={() => setOpen(true)}>
            <Info className="mr-1 size-4" /> ዝርዝር
          </Button>
        </div>
      </div>


        {showComments && (
          <div className="space-y-3 rounded-2xl border bg-background/40 p-3">
            {p.comments.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">የመጀመሪያው አስተያየት ሰጪ ይሁኑ</p>
            )}
            {p.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold">
                  {c.user.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {c.user} {c.mine && <span className="font-normal text-primary-glow">· እርስዎ</span>}
                  </p>
                  <p className="text-sm text-secondary-foreground">{c.text}</p>
                </div>
              </div>
            ))}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const t = text.trim();
                if (!t) return;
                addComment(p.id, t.slice(0, 300));
                setText("");
              }}
            >
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="አስተያየት ይጻፉ…"
                maxLength={300}
                className="h-10 rounded-xl bg-background/60"
              />
              <Button type="submit" variant="glow" size="icon" aria-label="ላክ" className="size-10 rounded-xl">
                <Send />
              </Button>
            </form>
          </div>
        )}
      </div>

      <DetailsDrawer product={p} open={open} onOpenChange={setOpen} />
    </article>
  );
}
