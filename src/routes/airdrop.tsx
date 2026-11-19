import { createFileRoute } from "@tanstack/react-router";
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
          <p className="text-xs text-slate-300 leading-relaxed">
            ከዛሬ ጀምሮ የድርጅቱን አክሲዮን ሲገዙ ወዲያውኑ የፕላቲኒየም ቶክን (PLT) ያገኛሉ። 1,000 ብር አክሲዮን የገዛ 100 PLT፣ 5,000 ብር የገዛ 500 PLT፣ 10,000 ብር የገዛ ደግሞ 1,000 PLT ቶክን ወዲያውኑ ይሸለማል። ቶክኑ በቅርቡ በይፋ ገበያ ላይ Launch ይደረጋል።
          </p>
        </div>

        {/* የ Launch ሂደት መለኪያ */}
        <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/10">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1">
              <TrendingUp className="size-3.5 text-amber-400" /> የቅድመ-ሽያጭ (Pre-Sale) ሂደት
            </span>
            <span className="text-amber-400 font-bold">78% ተሸጧል</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-amber-500 to-yellow-300" />
          </div>
        </div>

        {/* የመግዣ ፓኬጆች */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <a
            href="/wallet"
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 border border-amber-500/40 text-center space-y-1 transition"
          >
            <div className="text-xs font-bold text-amber-400">100 PLT</div>
            <div className="text-sm font-extrabold text-white">1,000 ብር</div>
            <div className="text-[10px] py-1 rounded-lg bg-amber-500 text-slate-950 font-bold">
              አክሲዮን ግዛ
            </div>
          </a>

          <a
            href="/wallet"
            className="p-3 rounded-xl bg-gradient-to-b from-amber-500/25 to-slate-900 border-2 border-amber-400 text-center space-y-1 shadow-md shadow-amber-500/10 transition"
          >
            <div className="text-xs font-bold text-amber-300">500 PLT</div>
            <div className="text-sm font-extrabold text-white">5,000 ብር</div>
            <div className="text-[10px] py-1 rounded-lg bg-amber-400 text-slate-950 font-bold">
              አክሲዮን ግዛ
            </div>
          </a>

          <a
            href="/wallet"
            className="p-3 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 border border-amber-500/40 text-center space-y-1 transition"
          >
            <div className="text-xs font-bold text-amber-400">1,000 PLT</div>
            <div className="text-sm font-extrabold text-white">10,000 ብር</div>
            <div className="text-[10px] py-1 rounded-lg bg-amber-500 text-slate-950 font-bold">
              አክሲዮን ግዛ
            </div>
          </a>
        </div>

        {/* ማረጋገጫ ነጥቦች */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>ከዛሬ ጀምሮ አክሲዮን መግዛትና PLT ቶክን መሰብሰብ ይቻላል</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>1,000 ብር = 100 PLT · 5,000 ብር = 500 PLT · 10,000 ብር = 1,000 PLT</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>ቶክኑ በቅርቡ በይፋ ገበያ ላይ Launch ይደረጋል</span>
          </div>
        </div>
      </div>
    </div>
  );
}
