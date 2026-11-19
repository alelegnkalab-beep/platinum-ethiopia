import { createFileRoute } from "@tanstack/react-router";

import { useState, useEffect } from "react";
import {
  Award,
  Building2,
  CalendarCheck,
  Coins,
  Crown,
  Download,
  Flame,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/airdrop")({
  head: () =>
    pageHead(
      "ኤርድሮፕ · ፕላቲኒየም ኢትዮጵያ",
      "ፕላቲኒየም ቶክን (PLT) ቀጥታ የአክሲዮን ሽያጭ እና ዕለታዊ ሽልማት"
    ),
  component: AirdropPage,
});

const SHARE_PACKAGES = [
  { birr: 1000, plt: 100, label: "1,000 ብር", badge: "መነሻ አክሲዮን" },
  { birr: 5000, plt: 500, label: "5,000 ብር", badge: "መካከለኛ" },
  { birr: 10000, plt: 1000, label: "10,000 ብር", badge: "ከፍተኛ ባለድርሻ" },
];

function AirdropPage() {
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    birr: number;
    plt: number;
    isShare?: boolean;
  } | null>(null);

  const [holderName, setHolderName] = useState<string>("");
  const [streakDays, setStreakDays] = useState<number>(0);
  const [pltBalance, setPltBalance] = useState<number>(10);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);

  useEffect(() => {
    const savedBalance = Number(localStorage.getItem("plt_balance") || "10");
    const savedStreak = Number(localStorage.getItem("plt_streak") || "0");
    const lastClaimDate = localStorage.getItem("plt_last_claim");

    setPltBalance(savedBalance);

    if (lastClaimDate) {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastClaimDate === today) {
        setClaimedToday(true);
        setStreakDays(savedStreak);
      } else if (lastClaimDate === yesterday) {
        setStreakDays(savedStreak);
      } else {
        setStreakDays(0);
        localStorage.setItem("plt_streak", "0");
      }
    }
  }, []);

  const nextReward = (streakDays + 1) * 5;

  const handleDailyCheckIn = () => {
    if (claimedToday) return;
    const newStreak = streakDays + 1;
    const reward = newStreak * 5;
    const updatedBalance = pltBalance + reward;

    setStreakDays(newStreak);
    setPltBalance(updatedBalance);
    setClaimedToday(true);

    localStorage.setItem("plt_streak", String(newStreak));
    localStorage.setItem("plt_balance", String(updatedBalance));
    localStorage.setItem("plt_last_claim", new Date().toDateString());
  };

  // ግሪን ካርዱን በምስል (PNG) ፈጥሮ ዳውንሎድ የሚያደርግ ኮድ
  const downloadGreenCard = () => {
    if (!selectedItem) return;
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // አረንጓዴ እና ወርቃማ ዳራ (Green Card Background)
    const grad = ctx.createLinearGradient(0, 0, 900, 540);
    grad.addColorStop(0, "#064e3b");
    grad.addColorStop(0.5, "#022c22");
    grad.addColorStop(1, "#065f46");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 540);

    // ወርቃማ ጠርዝ (Gold Border)
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 860, 500);

    // ርዕስ
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("PLATINUM ETHIOPIA · GREEN CARD", 55, 85);

    ctx.fillStyle = "#a7f3d0";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("የፕላቲኒየም ኢትዮጵያ ኦፊሴላዊ የባለድርሻነት ሰርተፍኬት", 55, 122);

    // የባለድርሻው ስም
    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px sans-serif";
    ctx.fillText("የባለድርሻው ሙሉ ስም (SHAREHOLDER NAME):", 55, 195);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(holderName.trim() || "Platinum Shareholder", 55, 240);

    // የአክሲዮን እና PLT መጠን
    ctx.fillStyle = "#a7f3d0";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(
      `የአክሲዮን መጠን: ${selectedItem.birr.toLocaleString()} ብር`,
      55,
      320
    );

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(
      `የተገኘ ቶክን: ${selectedItem.plt.toLocaleString()} PLT`,
      55,
      365
    );

    // መለያ ቁጥር እና ቀን
    const cardId = `PLT-${Math.floor(100000 + Math.random() * 900000)}`;
    const todayStr = new Date().toLocaleDateString();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "18px sans-serif";
    ctx.fillText(`መለያ ቁጥር: ${cardId}   |   ቀን: ${todayStr}`, 55, 455);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("✔ VERIFIED SHAREHOLDER", 600, 455);

    // ዳውንሎድ ማስጀመሪያ
    const link = document.createElement("a");
    link.download = `Platinum-Green-Card-${cardId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white px-4 pt-4 pb-24 space-y-5">
      {/* 1. ሙሉ ስክሪን የላይኛው መግቢያ እና ዋሌት */}
      <div className="p-5 rounded-3xl border border-amber-400/50 bg-gradient-to-br from-amber-500/20 via-slate-900 to-black shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            🔴 LIVE · ቀጥታ ሽያጭ
          </span>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
            <Crown className="size-4" /> ውድ እና ብርቅዬ ቶክን
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400">የእርስዎ ጠቅላላ ፕላቲኒየም ቶክን</p>
            <h1 className="text-4xl font-black text-white mt-1">
              {pltBalance.toLocaleString()}{" "}
              <span className="text-xl text-amber-400">PLT</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">የአሁን ዋጋ</p>
            <p className="text-base font-extrabold text-emerald-400">
              {(pltBalance * 10).toLocaleString()} ብር
            </p>
          </div>
        </div>

        <p className="mt-3 pt-3 border-t border-white/10 text-xs text-amber-200/90 leading-relaxed">
          💎 <strong>ፕላቲኒየም ቶክን (PLT)</strong> ከፍተኛ ዋጋ ያለው ውድ ሀብት ነው። ጓደኛ መጋበዝና
          ማህበራዊ ሚዲያ መከተል <strong>ሱፐር ፖይንት</strong> ሲያስገኙ፣ PLT ቶክን ግን የሚገኘው
          በሚከተሉት <strong>3 መንገዶች ብቻ</strong> ነው፦
        </p>
      </div>

      {/* 2. መንገድ 1፡ ዕለታዊ ምዝገባ (Daily Check-in) */}
      <div className="p-5 rounded-3xl border border-emerald-500/40 bg-slate-900/90 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="font-extrabold text-base text-white flex items-center gap-1.5">
              <CalendarCheck className="size-5 text-emerald-400" /> ዕለታዊ ምዝገባ
              (Daily Check-in)
            </h2>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full">
            <Flame className="size-3.5 text-orange-400" /> ቀን {streakDays}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          በየቀኑ ሲመዘገቡ በ<strong className="text-white">5 PLT</strong> ጀምሮ በየቀኑ
          5፣ 10፣ 15 እያለ ይጨምራል።{" "}
          <span className="text-amber-300 font-semibold">
            አንድ ቀን ካለፍዎት ተመልሶ ከ 5 PLT ይጀምራል።
          </span>
        </p>

        <button
          type="button"
          onClick={handleDailyCheckIn}
          disabled={claimedToday}
          className={`w-full py-3.5 rounded-2xl font-extrabold text-xs transition ${
            claimedToday
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-lg shadow-emerald-500/25"
          }`}
        >
          {claimedToday
            ? `✅ የዛሬውን ወስደዋል (ነገ +${(streakDays + 1) * 5} PLT ያገኛሉ)`
            : `🎁 የዛሬውን +${nextReward} PLT ቶክን ይውሰዱ`}
        </button>
      </div>

      {/* 3. መንገድ 2፡ ቶከን በቀጥታ መግዛት */}
      <div className="p-5 rounded-3xl border border-sky-500/40 bg-slate-900/90 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-sky-500/20 text-sky-400 font-black text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="font-extrabold text-base text-white flex items-center gap-1.5">
              <Coins className="size-5 text-sky-400" /> PLT ቶከን በቀጥታ መግዛት
            </h2>
          </div>
          <span className="text-xs font-bold text-sky-300">1 PLT = 10 ብር</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ሳይጠብቁ በቀጥታ PLT ቶከን በመግዛት የዋሌት ክምችትዎን ማሳደግና ለትልቅ ትርፍ መዘጋጀት ይችላሉ።
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() =>
              setSelectedItem({
                title: "ቀጥታ የ PLT ቶከን ግዢ",
                birr: 500,
                plt: 50,
                isShare: false,
              })
            }
            className="p-3 rounded-2xl bg-sky-500/15 border border-sky-400/40 hover:border-sky-300 text-center active:scale-95 transition"
          >
            <p className="text-sm font-extrabold text-white">50 PLT ቶከን</p>
            <p className="text-xs text-sky-300 font-bold mt-0.5">በ 500 ብር ግዛ</p>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedItem({
                title: "ቀጥታ የ PLT ቶከን ግዢ",
                birr: 2000,
                plt: 200,
                isShare: false,
              })
            }
            className="p-3 rounded-2xl bg-sky-500/15 border border-sky-400/40 hover:border-sky-300 text-center active:scale-95 transition"
          >
            <p className="text-sm font-extrabold text-white">200 PLT ቶከን</p>
            <p className="text-xs text-sky-300 font-bold mt-0.5">
              በ 2,000 ብር ግዛ
            </p>
          </button>
        </div>
      </div>

      {/* 4. መንገድ 3፡ የድርጅቱን አክሲዮን በቀጥታ መግዛት + ግሪን ካርድ */}
      <div className="p-5 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/15 via-slate-900 to-black space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="font-extrabold text-base text-white flex items-center gap-1.5">
              <Building2 className="size-5 text-amber-400" /> የድርጅቱን አክሲዮን
              መግዛት
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
            <Award className="size-3.5" /> ግሪን ካርድ ያካትታል
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          የ<strong className="text-white">ፕላቲኒየም ኢትዮጵያ</strong> ባለድርሻ በመሆን
          አክሲዮን ሲገዙ የፕላቲኒየም ቶከን (PLT) እና{" "}
          <strong className="text-emerald-400">
            የባለድርሻነት ግሪን ካርድ (Green Card)
          </strong>{" "}
          ወዲያውኑ ዳውንሎድ ማድረግ ይችላሉ።
        </p>

        <div className="grid grid-cols-3 gap-2">
          {SHARE_PACKAGES.map((pkg) => (
            <button
              key={pkg.birr}
              type="button"
              onClick={() =>
                setSelectedItem({
                  title: `የድርጅት አክሲዮን (${pkg.badge})`,
                  birr: pkg.birr,
                  plt: pkg.plt,
                  isShare: true,
                })
              }
              className="flex flex-col items-center p-3 rounded-2xl bg-black/60 border border-amber-400/50 hover:border-amber-300 active:scale-95 transition text-center"
            >
              <span className="text-[10px] font-bold text-amber-300">
                {pkg.badge}
              </span>
              <span className="text-sm font-black text-white mt-1">
                {pkg.label}
              </span>
              <span className="text-xs font-extrabold text-emerald-400 mt-0.5">
                {pkg.plt.toLocaleString()} PLT
              </span>
              <span className="mt-2 w-full py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-[11px]">
                አክሲዮን ግዛ
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
          <span>100% ግልጽ የባለድርሻነት ምዝገባ እና ኦፊሴላዊ ግሪን ካርድ</span>
        </div>
      </div>

      {/* 5. ክፍያ መፈጸሚያ እና ግሪን ካርድ ዳውንሎድ መስኮት (Popup) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-400 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-base flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-400" />{" "}
                {selectedItem.title}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-center">
              <p className="text-xs text-slate-300">የሚከፍሉት እና የሚያገኙት</p>
              <p className="text-xl font-black text-amber-400 mt-1">
                {selectedItem.birr.toLocaleString()} ብር ={" "}
                {selectedItem.plt.toLocaleString()} PLT
              </p>
            </div>

            {selectedItem.isShare && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-400/50 space-y-2.5">
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Award className="size-4" /> የባለድርሻነት ግሪን ካርድ (Green Card)
                </p>
                <input
                  type="text"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  placeholder="ሙሉ ስምዎን እዚህ ይጻፉ..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-emerald-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={downloadGreenCard}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Download className="size-4" /> ግሪን ካርድ አውርድ (Download PNG)
                </button>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-bold text-white">ክፍያ የሚፈጽሙበት አካውንት፦</p>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <p>
                  📱 ቴሌብር (Telebirr):{" "}
                  <span className="text-amber-300 font-extrabold">
                    0900071005
                  </span>
                </p>
                <p className="text-slate-400">
                  ስም: Kalab Alelegn (Platinum Ethiopia)
                </p>
              </div>
              <p className="text-amber-200/90 text-[11px] leading-relaxed">
                ክፍያውን ከፈጸሙ በኋላ ደረሰኙን በቴሌግራም ሲልኩ የፕላቲኒየም ቶከንዎ ወዲያውኑ ወደ ዋሌትዎ
                ይገባል።
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              ዝጋ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
