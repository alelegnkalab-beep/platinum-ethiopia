import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Check, Flame } from "lucide-react";
import { toast } from "sonner";
import { Countdown, JoinBanner, PageTitle, Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { CHECKIN_POINTS, DAY_MS, addisDay, canCheckIn } from "@/lib/rules";
import { fmt, useNow, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/daily")({
  head: () => pageHead("ዴይሊ ቼክ-ኢን", "በየቀኑ ቼክ-ኢን አድርገው 20 ነጥብ ያግኙ።"),
  component: DailyPage,
});

const DAY_NAMES = ["እሑድ", "ሰኞ", "ማክሰ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ"];

function DailyPage() {
  const { checkIns, checkIn, signedIn } = useStore();
  const now = useNow();
  const available = now !== null && signedIn && canCheckIn(checkIns, now);

  let streak = 0;
  if (now !== null) {
    let t = canCheckIn(checkIns, now) ? now - DAY_MS : now;
    while (checkIns.includes(addisDay(t))) {
      streak++;
      t -= DAY_MS;
    }
  }
  const week = now === null ? [] : Array.from({ length: 7 }, (_, i) => now - (6 - i) * DAY_MS);
  // Next Addis Ababa midnight = 21:00 UTC.
  const nextReset = now === null ? 0 : (() => {
    const d = new Date(now);
    d.setUTCHours(21, 0, 0, 0);
    if (d.getTime() <= now) d.setUTCDate(d.getUTCDate() + 1);
    return d.getTime();
  })();

  return (
    <div>
      <JoinBanner />
      <PageTitle icon={CalendarCheck} title="ዴይሊ ቼክ-ኢን" subtitle={`በየቀኑ ይግቡ፣ ${CHECKIN_POINTS} ነጥብ ያግኙ`} />

      <Panel className="flex flex-col items-center py-8 text-center">
        <button
          type="button"
          disabled={!available}
          onClick={() => {
            const r = checkIn();
            if (r.ok) toast.success(r.message);
            else toast.error(r.error);
          }}
          className={cn(
            "grid size-40 place-items-center rounded-full border-4 transition active:scale-95",
            available
              ? "border-primary-glow/60 bg-blue-gradient shadow-glow"
              : "border-border bg-secondary",
          )}
        >
          <span>
            {available ? (
              <>
                <span className="block font-display text-4xl font-extrabold text-primary-foreground">
                  +{CHECKIN_POINTS}
                </span>
                <span className="text-sm font-semibold text-primary-foreground">ቼክ-ኢን አድርግ</span>
              </>
            ) : (
              <>
                <Check className="mx-auto size-10 text-success" />
                <span className="mt-1 block text-sm font-semibold">
                  {signedIn ? "ዛሬ ተመዝግበዋል" : "ለመመዝገብ ይግቡ"}
                </span>
              </>
            )}
          </span>
        </button>
        {signedIn && !available && now !== null && (
          <p className="mt-4 text-xs text-muted-foreground">
            ቀጣዩ ቼክ-ኢን በ <Countdown to={nextReset} compact />
          </p>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-sm">
          <Flame className="size-4 text-warning" /> ተከታታይ <b className="font-display">{streak}</b> ቀን
        </p>
      </Panel>

      <h2 className="mb-2 mt-6 text-sm font-bold">የዚህ ሳምንት</h2>
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((t) => {
          const hit = checkIns.includes(addisDay(t));
          const isToday = now !== null && addisDay(t) === addisDay(now);
          return (
            <div
              key={t}
              className={cn(
                "rounded-2xl border py-2 text-center",
                hit ? "border-primary/40 bg-primary/15" : "bg-surface",
                isToday && "ring-1 ring-primary-glow",
              )}
            >
              <p className="text-[10px] text-muted-foreground">{DAY_NAMES[new Date(t + 3 * 3600_000).getUTCDay()]}</p>
              <div className="mt-1 grid place-items-center">
                {hit ? <Check className="size-4 text-primary-glow" /> : <span className="text-xs text-muted-foreground">+{CHECKIN_POINTS}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        በአጠቃላይ ከቼክ-ኢን የተገኘ፡ {fmt(checkIns.length * CHECKIN_POINTS)} ነጥብ
      </p>
    </div>
  );
}
