import { createFileRoute } from "@tanstack/react-router";
import { CircleHelp } from "lucide-react";
import { PageTitle } from "@/components/app/bits";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => pageHead("ተደጋጋሚ ጥያቄዎች", "ስለ ነጥቦች፣ ጨረታ፣ ማውጫ እና AI ልጥፎች ተደጋጋሚ ጥያቄዎች።"),
  component: FaqPage,
});

const FAQ = [
  { q: "ነጥብ ምንድን ነው?", a: "100 ነጥብ = 10 ብር ነው። ነጥቦችን በታስክ፣ በዴይሊ ቼክ-ኢን እና በሪፈራል ያገኛሉ።" },
  { q: "ስመዘገብ ምን አገኛለሁ?", a: "ልክ እንደተቀላቀሉ 100 ነጥብ (10 ብር) የእንኳን ደህና መጡ ስጦታ ይሰጥዎታል።" },
  { q: "ለመጫረት ወይም ለማውጣት ስንት ነጥብ ያስፈልጋል?", a: "ገንዘብ ለማውጣት ወይም ነጥብ ተጠቅመው ለመጫረት ቢያንስ 1,000 ነጥብ (100 ብር) ያስፈልጋል።" },
  { q: "ጨረታው እንዴት ይሰራል?", a: "እያንዳንዱ ምርት በ50 ብር ይጀምራል፣ ለ21 ቀን ይቆያል። ከ21 ቀን በኋላ ከፍተኛውን ጨረታ ያቀረበ ያሸንፋል።" },
  { q: "አዳዲስ ምርቶች መቼ ይለጠፋሉ?", a: "AI በየቀኑ ከሌሊቱ 1:00 AM (7:00 LT) 5 አዳዲስ የኤሌክትሮኒክስ ምርቶችን በ50 ብር መነሻ ዋጋ ይለጥፋል።" },
  { q: "ታስኮች ስንት ነጥብ ይሰጣሉ?", a: "5 የማህበራዊ ሚዲያ ታስኮች አሉ፣ እያንዳንዳቸው 100 ነጥብ ይሰጣሉ። ዴይሊ ቼክ-ኢን 20 ነጥብ፣ ሪፈራል ለእያንዳንዱ ጓደኛ 50 ነጥብ።" },
  { q: "በምን ዘዴ ማውጣት እችላለሁ?", a: "በቴሌብር፣ በሲቢኢ ብር ወይም በባንክ ሂሳብ የማውጫ ጥያቄ ማቅረብ ይችላሉ።" },
];

function FaqPage() {
  return (
    <div>
      <PageTitle icon={CircleHelp} title="ተደጋጋሚ ጥያቄዎች" />
      <Accordion type="single" collapsible className="space-y-2">
        {FAQ.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`} className="rounded-2xl border bg-surface px-4">
            <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
