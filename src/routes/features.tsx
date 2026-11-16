import { createFileRoute } from "@tanstack/react-router";
import { Bot, CalendarCheck, Gavel, Gift, ListChecks, Share2, Sparkles, Users, Wallet } from "lucide-react";
import { PageTitle } from "@/components/app/bits";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/features")({
  head: () => pageHead("ባህሪያት", "የፕላቲኒየም ኢትዮጵያ ጨረታ መተግበሪያ ዋና ዋና ባህሪያት።"),
  component: FeaturesPage,
});

const FEATURES = [
  { icon: Gavel, title: "የ21 ቀን ጨረታ", text: "ሁሉም ምርቶች በ50 ብር ይጀምራሉ" },
  { icon: Bot, title: "AI ልጥፎች", text: "በየቀኑ 5 አዳዲስ ምርቶች" },
  { icon: Gift, title: "የእንኳን ደህና መጡ ስጦታ", text: "100 ነጥብ (10 ብር)" },
  { icon: ListChecks, title: "ታስኮች", text: "ለእያንዳንዱ 100 ነጥብ" },
  { icon: CalendarCheck, title: "ዴይሊ ቼክ-ኢን", text: "በየቀኑ 20 ነጥብ" },
  { icon: Users, title: "ሪፈራል", text: "ለእያንዳንዱ ጓደኛ 50 ነጥብ" },
  { icon: Wallet, title: "ዋሌት", text: "ከ1,000 ነጥብ ጀምሮ ያውጡ" },
  { icon: Share2, title: "ላይክ፣ አስተያየት፣ አጋራ", text: "ከማህበረሰቡ ጋር ይገናኙ" },
];

function FeaturesPage() {
  return (
    <div>
      <PageTitle icon={Sparkles} title="ባህሪያት" subtitle="በአንድ መተግበሪያ ውስጥ ያለው ሁሉ" />
      <ul className="grid grid-cols-2 gap-3">
        {FEATURES.map((f) => (
          <li key={f.title} className="rounded-3xl border bg-surface p-4 shadow-card">
            <span className="grid size-10 place-items-center rounded-2xl bg-platinum-gradient">
              <f.icon className="size-5 text-platinum-foreground" />
            </span>
            <p className="mt-3 text-sm font-bold">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
