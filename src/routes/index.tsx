import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { AiBanner } from "@/components/app/AiBanner";
import { JoinBanner } from "@/components/app/bits";
import { ProductCard } from "@/components/app/ProductCard";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("የቀጥታ ጨረታዎች", "iPhone፣ Samsung፣ MacBook፣ PS5 እና ሌሎችም በ50 ብር ጀምረው ለ21 ቀን ይጫረቱ።"),
  component: Index,
});

function Index() {
  const { products } = useStore();
  return (
    <div>
      <JoinBanner />
      <AiBanner />
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Flame className="size-5 text-primary-glow" /> የዛሬ ጨረታዎች
          </h1>
          <p className="text-xs text-muted-foreground">ሁሉም በ50 ብር ይጀምራሉ · 21 ቀን</p>
        </div>
        <span className="rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold">
          {products.length} ምርቶች
        </span>
      </div>
      <div className="space-y-6">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} eager={i === 0} />
        ))}
      </div>
    </div>
  );
}
if (typeof window !== "undefined") {
  setTimeout(() => {
    document.querySelectorAll("div, p, span").forEach((el) => {
      if (el.children.length === 0 && el.textContent && el.textContent.includes("AI")) {
        const box = el.closest("div[class*='rounded']");
        if (box) (box as HTMLElement).style.display = "none";
      }
    });
  }, 300);
}
