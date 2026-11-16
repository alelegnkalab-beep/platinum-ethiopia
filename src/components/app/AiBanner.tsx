import { Link } from "@tanstack/react-router";
import { Bot, ChevronLeft } from "lucide-react";
import { AI_DAILY_COUNT, START_PRICE_ETB, nextAiDrop } from "@/lib/rules";
import { useNow } from "@/lib/store";
import { Countdown } from "./bits";

export function AiBanner() {
  const now = useNow(60_000);
  return (
    <Link
      to="/schedule"
      className="relative mb-5 block overflow-hidden rounded-3xl border border-primary/30 bg-banner p-4 shadow-glow"
    >
      <div className="absolute -right-10 -top-10 size-36 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative flex gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-gradient shadow-glow">
          <Bot className="size-5 text-primary-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">AI በራስ-ሰር ይለጥፋል</p>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              ● ቀጥታ
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            በየቀኑ ከሌሊቱ <b className="text-foreground">1:00 AM (7:00 LT)</b> ላይ AI{" "}
            <b className="text-foreground">{AI_DAILY_COUNT} አዳዲስ የኤሌክትሮኒክስ</b> ምርቶችን በ
            <b className="text-foreground"> {START_PRICE_ETB} ብር</b> መነሻ ዋጋ ይለጥፋል።
          </p>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-background/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">ቀጣዩ ልጥፍ በ</span>
            <span className="font-semibold text-primary-glow">
              {now === null ? "--:--:--" : <Countdown to={nextAiDrop(now)} compact />}
            </span>
            <ChevronLeft className="size-4 rotate-180 text-muted-foreground" />
          </div>
        </div>
      </div>
    </Link>
  );
}
