import { Coins, Gift, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { JoinBanner, PageTitle } from "@/components/ui/chrome";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/airdrop")({
  head: () => pageHead("ኤርድሮፕ · ፕላቲኒየም ኢትዮጵያ", "የፕላቲኒየም ቶክን (PLT) የአክሲዮን ሽያጭ"),
  component: AirdropPage,
});

function AirdropPage() {
  const { checkIns, tasks } = useStore();
  const earnedPlt = 10 + checkIns.length * 5 + tasks.length * 5;

  return (
    <div className="space-y-4 pb-6">
      <JoinBanner />
      <PageTitle icon={Gift} title="ኤርድሮፕ · ፕላቲኒየም ቶክን (PLT)" />

      {/* 1. 3D ወርቃማ የ PLT ቶክን ዋሌት ካርድ */}
      <div className="relative overflow-hidden p-5 rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500/20 via-slate-900 to-black shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300/90 font-medium">የእርስዎ ጠቅላላ የ PLT ቶክን</p>
            <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
              {earnedPlt.toLocaleString()} <span className="text-amber-400 text-lg">PLT</span>
            </h2>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">
              ≈ {(earnedPlt * 10).toLocaleString()} ብር የአክሲዮን ዋጋ
            </p>
          </div>
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Coins className="size-6 text-slate-950" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-amber-300 flex items-center gap-1 font-medium">
            <Sparkles className="size-3.5" /> 1 PLT ቶክን = 10 ብር ዋጋ አለው
          </span>
          <span className="text-slate-400">1,000 ብር = 100 PLT</span>
        </div>
      </div>

      {/* 2. ዋናው የፕላቲኒየም ቶክን (PLT) የአክሲዮን ሽያጭ ካርድ */}
      <div className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 space-y-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            🔥 ከዛሬ ጀምሮ ክፍት ነው · LIVE
          </span>
          <span className="text-xs text-amber-300 font-semibold">1 PLT = 10 ETB</span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white">
            የፕላቲኒየም ቶክን (PLT) የአክሲዮን ድርሻ
          </h3>
          <p className="
