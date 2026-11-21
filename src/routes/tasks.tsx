import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bomb, Check, ExternalLink, Flame, ListChecks, Minus, Plus, RotateCw, Wallet } from "lucide-react";
import { toast } from "sonner";
import { JoinBanner, PageTitle, Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TASK_POINTS } from "@/lib/rules";
import { fmt, useStore } from "@/lib/store";
import { SOCIAL_TASKS, type TaskId } from "@/lib/tasks";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tasks")({
  head: () => pageHead("ታስክ", "5 የማህበራዊ ሚዲያ ታስኮችን ይጨርሱ፣ ለእያንዳንዱ 100 ነጥብ ያግኙ።"),
  component: TasksPage,
});

const WALLET_EXTRA_KEY = "platinum-ethiopia:wallet-extra-v1";

const WHEEL_SEGMENTS = [
  { label: "ባዶ 😅", mult: 0, color: "#334155" },
  { label: "1.5x", mult: 1.5, color: "#0284c7" },
  { label: "ባዶ 💨", mult: 0, color: "#1e293b" },
  { label: "2x 🔥", mult: 2, color: "#d97706" },
  { label: "ባዶ 🙈", mult: 0, color: "#334155" },
  { label: "3x 💎", mult: 3, color: "#059669" },
  { label: "0.5x", mult: 0.5, color: "#4f46e5" },
  { label: "5x 👑", mult: 5, color: "#e11d48" },
];

function TasksPage() {
  const { tasks, completeTask, signedIn } = useStore();
  const [opened, setOpened] = useState<TaskId[]>([]);
  const done = tasks.length;
  const total = SOCIAL_TASKS.length;

  const [etbBalance, setEtbBalance] = useState(0);
  const [convertedPts, setConvertedPts] = useState(0);
  const [walletReady, setWalletReady] = useState(false);

  const [activeGame, setActiveGame] = useState<"spin" | "bomb">("spin");
  const [bet, setBet] = useState(20);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const [bombRunning, setBombRunning] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [bombExploded, setBombExploded] = useState(false);
  const crashPointRef = useRef(1.5);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WALLET_EXTRA_KEY) || "{}") as { etb?: number; converted?: number };
      if (typeof saved.etb === "number") setEtbBalance(saved.etb);
      if (typeof saved.converted === "number") setConvertedPts(saved.converted);
    } catch {
      /* ignore */
    }
    setWalletReady(true);
  }, []);

  const updateWalletEtb = (delta: number) => {
    setEtbBalance((prev) => {
      const next = Math.max(0, Math.round((prev + delta) * 100) / 100);
      if (walletReady) {
        localStorage.setItem(WALLET_EXTRA_KEY, JSON.stringify({ etb: next, converted: convertedPts }));
      }
      return next;
    });
  };

  const adjustBet = (step: number) => {
    if (spinning || bombRunning) return;
    setBet((b) => Math.min(1000, Math.max(20, b + step)));
  };

  const handleSpin = () => {
    if (!signedIn) {
      toast.error("ለመጫወት መጀመሪያ ይግቡ (Login)");
      return;
    }
    if (spinning) return;
    if (etbBalance < bet) {
      toast.error(`በዋሌትዎ ውስጥ በቂ ብር የለም! (${bet} ብር ያስፈልጋል)`);
      return;
    }

    updateWalletEtb(-bet);
    setSpinning(true);
    setSpinResult(null);

    const segCount = WHEEL_SEGMENTS.length;
    const segAngle = 360 / segCount;
    const winIndex = Math.floor(Math.random() * segCount);
    const extraSpins = 360 * 6;
    const targetAngle = extraSpins + (360 - winIndex * segAngle - segAngle / 2);
    const nextRotation = rotation + targetAngle - (rotation % 360);

    setRotation(nextRotation);

    setTimeout(() => {
      setSpinning(false);
      const landed = WHEEL_SEGMENTS[winIndex];
      const wonAmount = Math.round(bet * landed.mult);
      if (wonAmount > 0) {
        updateWalletEtb(wonAmount);
        setSpinResult(`🎉 እንኳን ደስ አለዎት! ${landed.label} (${wonAmount} ብር) አሸንፈዋል!`);
        toast.success(`+${wonAmount} ብር ወደ ዋሌትዎ ገብቷል!`);
      } else {
        setSpinResult("😅 ባዶ ላይ አርፏል! እንደገና ይሞክሩ!");
        toast.error("ባዶ! እንደገና ይሞክሩ");
      }
    }, 3600);
  };

  const startBombGame = () => {
    if (!signedIn) {
      toast.error("ለመጫወት መጀመሪያ ይግቡ (Login)");
      return;
    }
    if (bombRunning) return;
    if (etbBalance < bet) {
      toast.error(`በዋሌትዎ ውስጥ በቂ ብር የለም! (${bet} ብር ያስፈልጋል)`);
      return;
    }

    updateWalletEtb(-bet);
    setBombRunning(true);
    setBombExploded(false);
    setMultiplier(1.0);

    const r = Math.random();
    crashPointRef.current = r < 0.25 ? 1.15 : r < 0.65 ? 1.5 + Math.random() * 1.2 : 2.5 + Math.random() * 3.5;

    timerRef.current = window.setInterval(() => {
      setMultiplier((prev) => {
        const next = Math.round((prev + 0.07) * 100) / 100;
        if (next >= crashPointRef.current) {
          if (timerRef.current) clearInterval(timerRef.current);
          setBombRunning(false);
          setBombExploded(true);
          toast.error(`💥 ቦምቡ በ ${next.toFixed(2)}x ላይ ፈነዳ!`);
          return next;
        }
        return next;
      });
    }, 150);
  };

  const cashOutBomb = () => {
    if (!bombRunning) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setBombRunning(false);
    const wonAmount = Math.round(bet * multiplier);
    updateWalletEtb(wonAmount);
    toast.success(`🔥 ቦምቡ ሳይፈነዳ ${wonAmount} ብር (${multiplier.toFixed(2)}x) ወስደዋል!`);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div>
      <JoinBanner />
      <PageTitle icon={ListChecks} title="ታስክ እና ጨዋታዎች" subtitle="በቀጥታ ከዋሌትዎ ይጫወቱ ወይም ታስኮችን ሰርተው ነጥብ ያግኙ" />

      {/* 1. ከላይ (ከታስኮቹ በላይ) የተቀመጠ የጨዋታዎች ክፍል */}
      <Panel className="mb-5 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-surface p-4">
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-background/80 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-amber-400" />
            <span className="text-xs text-muted-foreground">የዋሌት ሂሳብዎ፦</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-extrabold text-amber-400">{fmt(etbBalance)} ብር</span>
            <Link to="/wallet" className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
              + ዲፖዚት
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-background/60 p-1">
          <button
            type="button"
            onClick={() => !spinning && !bombRunning && setActiveGame("spin")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              activeGame === "spin" ? "bg-amber-500 text-black shadow" : "text-muted-foreground"
            }`}
          >
            <RotateCw className="size-3.5" /> የዕድል ስፒን (Spin)
          </button>
          <button
            type="button"
            onClick={() => !spinning && !bombRunning && setActiveGame("bomb")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              activeGame === "bomb" ? "bg-rose-500 text-white shadow" : "text-muted-foreground"
            }`}
          >
            <Bomb className="size-3.5" /> ቦምብ ጨዋታ (Crash)
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl border bg-background/70 px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground">የመወራረጃ ብር፦</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8 rounded-full"
              disabled={spinning || bombRunning || bet <= 20}
              onClick={() => adjustBet(-5)}
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-[4.5rem] text-center font-display text-base font-extrabold text-foreground">
              {bet} ብር
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8 rounded-full"
              disabled={spinning || bombRunning}
              onClick={() => adjustBet(5)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        {activeGame === "spin" && (
          <div className="flex flex-col items-center text-center">
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute -top-2 z-20 h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-amber-400 drop-shadow" />
              <div
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 3.5s cubic-bezier(0.15, 0.85, 0.25, 1)" : "none",
                  background: `conic-gradient(${WHEEL_SEGMENTS.map(
                    (s, i) => `${s.color} ${(i * 100) / WHEEL_SEGMENTS.length}% ${((i + 1) * 100) / WHEEL_SEGMENTS.length}%`
                  ).join(", ")})`,
                }}
                className="relative size-52 rounded-full border-4 border-amber-400 shadow-xl"
              >
                {WHEEL_SEGMENTS.map((seg, idx) => {
                  const angle = idx * (360 / WHEEL_SEGMENTS.length) + 360 / WHEEL_SEGMENTS.length / 2;
                  return (
                    <div
                      key={idx}
                      style={{ transform: `rotate(${angle}deg)` }}
