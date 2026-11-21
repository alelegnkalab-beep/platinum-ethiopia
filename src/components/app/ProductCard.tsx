import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  Heart,
  Gavel,
  Tag,
  ShieldCheck,
  Send,
  Zap,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import { auctionEnds } from "@/lib/products";
import { fmt, useNow, useStore } from "@/lib/store";
import { Countdown } from "./bits";
import { DetailsDrawer } from "./DetailsDrawer";

export function bidderCount(p: Product): number {
  return new Set(p.bids.map((b) => b.userId)).size;
}

export function ProductCard({ product: p }: { product: Product }) {
  const store = useStore();
  const navigate = useNavigate();
  const now = useNow(60_000);

  const [bidAmount, setBidAmount] = useState<string>("");
  const [openDetails, setOpenDetails] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const ended = now >= auctionEnds(p);
  const SERVICE_FEE_ETB = 70.0; // የአገልግሎት ክፍያ 70.00 ብር

  // የ '-' እና '+' ቁልፎች አሰራር
  const handleAdjustBid = (delta: number) => {
    const current = parseFloat(bidAmount) || 0;
    const nextValue = Math.max(0.01, Number((current + delta).toFixed(2)));
    setBidAmount(nextValue.toString());
  };

  // ከ 'I agree' በኋላ ጨረታውን የሚመዘግብ ተግባር
  const executeBidSubmission = () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      toast.error("እባክዎ ትክክለኛ የጨረታ ዋጋ ያስገቡ (Enter a valid bid amount)");
      return;
    }

    // በstore ውስጥ placeBid ካለ እሱን ይጠቀማል፣ ካልሆነ ወደ ክፍያ ገጽ ይወስዳል
    if (typeof (store as any).placeBid === "function") {
      (store as any).placeBid(p.id, amount);
    }

    toast.success(
      `የ ${fmt(amount)} ብር መለያ ጨረታዎ ተልኳል! የአገልግሎት ክፍያ፡ ${SERVICE_FEE_ETB.toFixed(2)} ብር`
    );
    setBidAmount("");

    // ወደ ክፍያ/ቼክአውት ገጽ የሚወስድ መንገድ ካለ
    try {
      navigate({ to: "/checkout" as any, search: { productId: p.id, bid: amount, fee: SERVICE_FEE_ETB } as any });
    } catch {
      // ገጹ ባይኖር ስህተት እንዳያሳይ በዝምታ ያልፋል
    }
  };

  // 'Submit a Bid Amount' ሲጫን
  const handleBidButtonClick = () => {
    if (ended) {
      toast.error("ይህ ጨረታ ተጠናቋል");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      toast.error("እባክዎ መጀመሪያ የጨረታ ቁጥር ያስገቡ (Enter bid amount)");
      return;
    }

    // መጀመሪያ Terms and Conditions እንዲያይ እና እንዲስማማ ያደርጋል
    if (!agreedToTerms) {
      setShowTermsModal(true);
      return;
    }

    executeBidSubmission();
  };

  const productImage =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images[0]
      : "/placeholder.svg";

  return (
    <article className="bg-[#F8F9FA] text-gray-900 rounded-2xl p-4 shadow-sm border border-gray-200 max-w-md mx-auto mb-6 relative">
      {/* 1. የምርት ካርድ (Product Image Card) */}
      <div className="relative bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-center h-60">
        {/* Live Badge */}
        {!ended ? (
          <div className="absolute top-3 left-3 bg-[#B91C1C] text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
            <Gavel className="w-3.5 h-3.5" />
            <span>Live</span>
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-gray-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
            Ended
          </div>
        )}

        {/* Views Count */}
        <div className="absolute top-3 right-3 bg-gray-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-gray-700 border border-gray-100">
          <Eye className="w-3.5 h-3.5 text-orange-500" />
          <span>{typeof (p as any).views === "number" ? (p as any).views.toLocaleString() : "18.3K"}</span>
        </div>

        {/* Product Image */}
        <img
          src={productImage}
          alt={p.name}
          onClick={() => setOpenDetails(true)}
          className="max-h-44 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
        />

        {/* Favorite Button */}
        <button
          type="button"
          onClick={() => {
            setIsFavorite(!isFavorite);
            if (typeof store.toggleLike === "function") {
              store.toggleLike(p.id);
            }
          }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white shadow-xs border border-gray-100 hover:bg-gray-50 transition"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-purple-800"
            }`}
          />
        </button>
      </div>

      {/* 2. የምርቱ ስም (Product Title) */}
      <h2
        onClick={() => setOpenDetails(true)}
        className="mt-4 text-xl font-extrabold text-gray-900 tracking-tight cursor-pointer hover:text-orange-600 transition"
      >
        {p.name}
      </h2>

      {/* 3. Bid Service Fee (70.00 Br) & Auction Code */}
      <div className="mt-3 bg-white rounded-2xl p-3.5 shadow-xs border border-gray-100 grid grid-cols-2 divide-x divide-gray-200">
        {/* Left: Bid Service Fee */}
        <div className="flex items-center gap-2.5 pr-2">
          <div className="p-2 rounded-xl bg-green-50 text-green-600">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-green-600">
              Bid Service Fee
            </p>
            <p className="text-base font-extrabold text-gray-900">
              {SERVICE_FEE_ETB.toFixed(2)} Br
            </p>
          </div>
        </div>

        {/* Right: Auction Code */}
        <div className="flex items-center gap-2.5 pl-3.5">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-orange-500">
              Auction Code
            </p>
            <p className="text-base font-extrabold text-gray-900">
              {p.id.replace(/\D/g, "").slice(0, 3) || "306"}
            </p>
          </div>
        </div>
      </div>

      {/* 4. ቀሪ ሰዓት እና የጨረታ ብዛት (Countdown & Total Bids) */}
      <div className="mt-3 bg-white rounded-2xl px-4 py-3 shadow-xs border border-gray-100 flex items-center justify-between">
        <div className="text-sm font-bold text-[#D9467A]">
          <Countdown target={auctionEnds(p)} />
        </div>
        <div className="h-4 w-[1px] bg-gray-200" />
        <div className="text-sm font-extrabold text-green-600">
          {p.bids.length} bids
        </div>
      </div>

      {/* 5. የዋጋ/ኮድ ማስገቢያ ሳጥን (Bid Amount Input with - and +) */}
      <div className="mt-3.5 flex items-center bg-[#EBECEF] rounded-xl p-1 border border-gray-200">
        <button
          type="button"
          onClick={() => handleAdjustBid(-1)}
          className="w-11 h-10 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-white rounded-lg transition"
        >
          -
        </button>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Bid amount"
          className="flex-1 bg-transparent text-center text-base font-bold text-gray-900 placeholder-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleAdjustBid(1)}
          className="w-11 h-10 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-white rounded-lg transition"
        >
          +
        </button>
      </div>

      {/* 6. ዋና የመጫረቻ ቁልፍ (Submit Button) */}
      <button
        type="button"
        onClick={handleBidButtonClick}
        disabled={ended}
        className="mt-3 w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF8C00] to-[#F97316] disabled:opacity-50 text-white font-bold text-base shadow-md shadow-orange-200 active:scale-[0.99] transition"
      >
        Submit a Bid Amount
      </button>

      {/* 7. ህግ እና ደንብ ቁልፍ (Terms & Conditions) */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
        >
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>TERMS AND CONDITIONS WILL APPLY</span>
        </button>
      </div>

      {/* 8. የቴሌግራም ቀጥታ ድጋፍ (Floating Telegram Direct Support) */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-1.5">
        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#65A30D] text-white flex items-center justify-center shadow-lg hover:scale-105 transition"
        >
          <Send className="w-5 h-5 -ml-0.5" />
        </a>
        <a
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 shadow-md rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold text-gray-800"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span>Direct Support</span>
        </a>
      </div>

      {/* 9. ህግ እና ደንብ መግለጫ ሳጥን (Terms & Conditions Modal) */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
