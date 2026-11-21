import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { AiBanner } from "@/components/app/AiBanner";
import { JoinBanner } from "@/components/app/bits";
import { ProductCard } from "@/components/app/ProductCard";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";
import { ApartmentAuctionCard } from "@/components/ApartmentAuctionCard";

export const Route = createFileRoute("/")({
  head: () => pageHead("የቀጥታ ጨረታዎች", "iPhone, Samsung እና ሌሎች ኤሌክትሮኒክስ በቀጥታ ጨረታ"),
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
          <h1 className="flex items-center gap-2 text-lg font-extrabold">
            <Flame className="size-5 text-primary" />
            የቀጥታ ጨረታዎች
          </h1>
          <p className="text-xs text-muted-foreground">አሁን ክፍት የሆኑ ጨረታዎች</p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
          {products.length} ምርቶች
        </span>
      </div>
      <div className="space-y-6">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} eager={i === 0} />
        ))}
        <ApartmentAuctionCard />
      </div>
    </div>
  );
}
if (typeof window !== "undefined") {
  setTimeout(() => {
    document.querySelectorAll("div, p, span").forEach((el) => {
      if (el.children.length === 0 && el.textContent?.trim() === "Built with Lovable") {
        const box = el.closest("div[class*='fixed'], div[class*='bottom']");
        if (box) (box as HTMLElement).style.display = "none";
      }
    });
  }, 300);
}
