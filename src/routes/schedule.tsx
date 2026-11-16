import { createFileRoute } from "@tanstack/react-router";
import { Bot, CalendarClock, Gavel, Sparkles, Trophy, Zap } from "lucide-react";
import { Countdown, PageTitle, Panel } from "@/components/app/bits";
import { AI_DAILY_COUNT, AUCTION_DAYS, START_PRICE_ETB, nextAiDrop } from "@/lib/rules";
import { useNow, useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/schedule")({
  head: () => pageHead("የAI መረጃ መርሃ ግብር", "AI በየቀኑ ከሌሊቱ 1:00 (7:00 LT) 5 አዳዲስ የኤሌክትሮኒክስ ምርቶችን ይለጥፋል።"),
  component: SchedulePage,
});

const STEPS = [
  { icon: Bot, time: "1:00 AM · 7:00 LT", title: "AI ምርቶችን ይመርጣል", text: "ተፈላጊ የኤሌክትሮኒክስ ምርቶችን ይመርጣል" },
  { icon: Zap, time: "1:00 AM · 7:00 LT", title: `${AI_DAILY_COUNT} ምርቶች ይለጠፋሉ`, text: "ፎቶ፣ ቀለማት እና ዝርዝር መረጃ ይዘው" },
  { icon: Gavel, time: "ወዲያውኑ", title: `በ${START_PRICE_ETB} ብር ጨረታ ይጀምራል`, text: "ሁሉም ምርቶች በተመሳሳይ መነሻ ዋጋ" },
  { icon: Trophy, time: `${AUCTION_DAYS} ቀን በኋላ`, title: "አሸናፊ ይታወቃል", text: "ከፍተኛውን ጨረታ ያቀረበ ያሸንፋል" },
];

function SchedulePage() {
  const now = useNow(60_000);
  const { products } = useStore();
  return (
    <div>
      <PageTitle icon={CalendarClock} title="የAI መረጃ መርሃ ግብር" subtitle="በየቀኑ ከሌሊቱ 1:00 (7:00 LT)" />

      <Panel className="bg-banner">
        <p className="mb-2 text-xs text-muted-foreground">ቀጣዩ የAI ልጥፍ</p>
        {now !== null ? <Countdown to={nextAiDrop(now)} /> : <Countdown to={0} />}
        <p className="mt-3 text-xs text-muted-foreground">
          {AI_DAILY_COUNT} አዳዲስ የኤሌክትሮኒክስ ምርቶች · መነሻ {START_PRICE_ETB} ብር
        </p>
      </Panel>

      <h2 className="mb-3 mt-6 text-sm font-bold">የዕለቱ ሂደት</h2>
      <ol className="relative space-y-3 border-s border-primary/30 ps-5">
        {STEPS.map((s) => (
          <li key={s.title} className="relative">
            <span className="absolute -start-[2.05rem] grid size-7 place-items-center rounded-full bg-blue-gradient shadow-glow">
              <s.icon className="size-3.5 text-primary-foreground" />
            </span>
            <div className="rounded-2xl border bg-surface p-3">
              <p className="text-[11px] font-semibold text-primary-glow">{s.time}</p>
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mb-3 mt-6 flex items-center gap-2 text-sm font-bold">
        <Sparkles className="size-4 text-primary-glow" /> የዛሬው የAI ስብስብ
      </h2>
      <ul className="grid grid-cols-5 gap-2">
        {products.slice(0, AI_DAILY_COUNT).map((p) => (
          <li key={p.id} className="text-center">
            <img src={p.slides[0].image} alt={p.name} width={832} height={1040} loading="lazy" className="aspect-square w-full rounded-2xl border object-cover" />
            <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-muted-foreground">{p.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
