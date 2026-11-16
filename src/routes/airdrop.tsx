import { createFileRoute } from "@tanstack/react-router";
import { Check, Circle, Gift } from "lucide-react";
import { JoinBanner, PageTitle, Panel } from "@/components/app/bits";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/airdrop")({
  head: () => pageHead("ኤርድሮፕ", "ለፕላቲኒየም ኤርድሮፕ ብቁ ለመሆን ተግባራትን ያጠናቅቁ።"),
  component: AirdropPage,
});

function AirdropPage() {
  const { signedIn, tasks, checkIns, products, referrals } = useStore();
  const bids = products.reduce((n, p) => n + p.bids.filter((b) => b.mine).length, 0);
  const items = [
    { label: "ይመዝገቡ", done: signedIn },
    { label: "3 ታስኮችን ያጠናቅቁ", done: signedIn && tasks.length >= 3 },
    { label: "3 ቀን ቼክ-ኢን ያድርጉ", done: signedIn && checkIns.length >= 3 },
    { label: "1 ጓደኛ ይጋብዙ", done: signedIn && referrals >= 1 },
    { label: "1 ጨረታ ያስገቡ", done: signedIn && bids >= 1 },
  ];
  const done = items.filter((i) => i.done).length;

  return (
    <div>
      <JoinBanner />
      <PageTitle icon={Gift} title="ኤርድሮፕ" subtitle="ፕላቲኒየም ኤርድሮፕ · በቅርቡ" />

      <Panel className="relative overflow-hidden bg-banner text-center">
        <div className="absolute inset-x-0 -top-16 mx-auto size-48 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative">
          <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-platinum-gradient shadow-platinum">
            <Gift className="size-9 text-platinum-foreground" />
          </span>
          <p className="mt-4 text-lg font-bold">ልዩ ሽልማቶች እየመጡ ነው</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ብቁ የሆኑ ተጠቃሚዎች ኤርድሮፑ ሲጀመር ቅድሚያ ያገኛሉ። ከታች ያሉትን ያጠናቅቁ።
          </p>
          <p className="mt-4 font-display text-3xl font-extrabold text-platinum">
            {done}/{items.length}
          </p>
          <Progress value={(done / items.length) * 100} className="mx-auto mt-2 h-2 max-w-[220px]" />
        </div>
      </Panel>

      <ul className="mt-4 space-y-2">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-3 rounded-2xl border bg-surface p-3.5 text-sm">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full",
                i.done ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground",
              )}
            >
              {i.done ? <Check className="size-4" /> : <Circle className="size-3" />}
            </span>
            <span className={cn(i.done && "text-muted-foreground line-through")}>{i.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
