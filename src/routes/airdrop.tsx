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
            {/* የፕላቲኒየም ቶከን (Platinum Token) Coming Soon እና አክሲዮን መግዣ */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-blue-950/40 border border-amber-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            🚀 COMING SOON LAUNCH
          </span>
          <span className="text-xs text-slate-400">Platinum Token (PLT)</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">
            የፕላቲኒየም ቶከን (PLT) የአክሲዮን ድርሻ
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            የፕላቲኒየም ቶከን በቅርቡ በይፋ ላውንች (Launch) ይደረጋል። ቶከኑ በአፕሊኬሽኑ ጨረታዎች ላይ ዋና መገበያያ ሲሆን፣ ዛሬ ቀድመው አክሲዮን የሚገዙ ባለድርሻዎች ቶከኑ ገበያ ላይ ሲወጣ ልዩ ጉርሻ እና ትልቅ ትርፍ ያገኛሉ።
          </p>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs text-slate-300">
          <div>✅ 100% ግልጽ የባለድርሻነት ምዝገባ</div>
          <div>✅ በጨረታዎች ላይ ቅድሚያ የመሳተፍ መብት</div>
          <div>✅ ከ 1,000 ብር ጀምሮ የአክሲዮን ድርሻ መግዛት ይቻላል</div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <a
            href="/wallet"
            className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs text-center"
          >
            1,000 ብር ግዛ
          </a>
          <a
            href="/wallet"
            className="py-2.5 px-2 rounded-xl bg-amber-500/90 hover:bg-amber-600 text-black font-bold text-xs text-center"
          >
            5,000 ብር ግዛ
          </a>
          <a
            href="/wallet"
            className="py-2.5 px-2 rounded-xl bg-amber-500/80 hover:bg-amber-600 text-black font-bold text-xs text-center"
          >
            10,000 ብር ግዛ
          </a>
        </div>
      </div>

    </div>
  );
}
