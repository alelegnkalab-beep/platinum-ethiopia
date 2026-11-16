import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Gift } from "lucide-react";
import { splitDuration, WELCOME_BONUS_POINTS, pointsToEtb } from "@/lib/rules";
import { useNow, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-gradient shadow-glow">
        <Icon className="size-5 text-primary-foreground" />
      </span>
      <div>
        <h1 className="text-xl font-bold leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-3xl border bg-surface p-4 shadow-card", className)}>{children}</section>;
}

export function JoinBanner() {
  const { signedIn, hydrated } = useStore();
  if (!hydrated || signedIn) return null;
  return (
    <div className="mb-4 flex items-center gap-3 rounded-3xl border border-primary/30 bg-banner p-4 shadow-glow">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-platinum-gradient">
        <Gift className="size-5 text-platinum-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">ይቀላቀሉ፣ {WELCOME_BONUS_POINTS} ነጥብ ያግኙ!</p>
        <p className="text-xs text-muted-foreground">
          ልክ እንደተመዘገቡ {pointsToEtb(WELCOME_BONUS_POINTS)} ብር የሚያወጣ ስጦታ
        </p>
      </div>
      <Button asChild variant="platinum" size="sm" className="rounded-full">
        <Link to="/login">ይቀላቀሉ</Link>
      </Button>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ to, compact }: { to: number; compact?: boolean }) {
  const now = useNow();
  const d = splitDuration(now === null ? 0 : to - now);
  const cells = [
    { v: d.days, l: "ቀን" },
    { v: d.hours, l: "ሰዓት" },
    { v: d.minutes, l: "ደቂቃ" },
    { v: d.seconds, l: "ሰከንድ" },
  ];
  if (compact)
    return (
      <span className="font-display tabular-nums">
        {now === null ? "--:--:--" : `${pad(d.days * 24 + d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`}
      </span>
    );
  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map((c) => (
        <div key={c.l} className="rounded-2xl border bg-background/50 py-2 text-center">
          <div className="font-display text-lg font-bold tabular-nums text-platinum">
            {now === null ? "--" : pad(c.v)}
          </div>
          <div className="text-[10px] text-muted-foreground">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

export function useRequireSignIn() {
  const { signedIn } = useStore();
  return signedIn;
}
