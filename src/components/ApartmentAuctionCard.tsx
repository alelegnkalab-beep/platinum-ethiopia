import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import apartmentPhoto from '@/assets/house-penthouse.jpg';
import { maskPhone } from '@/lib/rules';
import { useStore } from '@/lib/store';
import {
  BatteryCharging,
  Trophy,
  Users,
  Eye,
  MessageSquare,
  Share2,
  Heart,
  Info,
  CheckCircle2,
  Maximize2,
  BedDouble,
  Bath,
  MapPin,
  Building2,
  X
} from 'lucide-react';

const APARTMENT_STORAGE_KEY = "platinum-ethiopia:apartment-v1";

interface Bid {
  fullName: string;
  phone: string;
  amount: number;
}

export const ApartmentAuctionCard = () => {
  const SECRET_TARGET_USERS = 10000;
  const STARTING_PRICE = 1100;

  const [participantsCount, setParticipantsCount] = useState<number>(8400);
  const [highestBid, setHighestBid] = useState<Bid>({
    fullName: "ካላብ አለለኝ ተዋብ",
    phone: "0911****89",
    amount: 4500,
  });

  const [likes, setLikes] = useState<number>(1420);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>("");
  const [userPhone, setUserPhone] = useState<string>("");
  const [newBidAmount, setNewBidAmount] = useState<string>("");
  const [loaded, setLoaded] = useState<boolean>(false);
  const { account } = useStore();

  // ጨረታው ገጹ ሲታደስ እንዳይጠፋ በዚህ ስልክ ላይ ይቀመጣል
  useEffect(() => {
    try {
      const raw = localStorage.getItem(APARTMENT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{ participantsCount: number; highestBid: Bid; likes: number; isLiked: boolean }>;
        if (typeof saved.participantsCount === "number") setParticipantsCount(saved.participantsCount);
        if (saved.highestBid && typeof saved.highestBid.amount === "number") setHighestBid(saved.highestBid);
        if (typeof saved.likes === "number") setLikes(saved.likes);
        if (typeof saved.isLiked === "boolean") setIsLiked(saved.isLiked);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(APARTMENT_STORAGE_KEY, JSON.stringify({ participantsCount, highestBid, likes, isLiked }));
  }, [loaded, participantsCount, highestBid, likes, isLiked]);

  useEffect(() => {
    if (!account) return;
    setUserName((v) => v || account.name);
    setUserPhone((v) => v || account.phone);
  }, [account]);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const text = "ለግዠሪ አፓርታማ ጨረታ በፕላቲኒየም ኢትዮጵያ!";
    try {
      if (navigator.share) await navigator.share({ title: "ፕላቲኒየም ኢትዮጵያ", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("ሊንኩ ተቀድቷል");
      }
    } catch {
      /* share cancelled */
    }
  };

  const batteryPercentage = Math.min(
    Math.round((participantsCount / SECRET_TARGET_USERS) * 100),
    100
  );
  const isCompleted = participantsCount >= SECRET_TARGET_USERS;

  const getBatteryFillColor = () => {
    if (batteryPercentage < 35) return "from-red-600 to-red-400";
    if (batteryPercentage < 75) return "from-amber-500 to-yellow-300";
    return "from-emerald-600 to-emerald-400";
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const bidValue = Number(newBidAmount);

    if (isCompleted) return;
    if (bidValue < STARTING_PRICE || bidValue <= highestBid.amount) {
      toast.error(`እባክዎ አሁን ካለው ከፍተኛ ጨረታ (${highestBid.amount.toLocaleString()} ብር) በላይ ያስገቡ!`);
      return;
    }
    if (!/^(\+251|0)[79]\d{8}$/.test(userPhone.replace(/\s/g, ""))) {
      toast.error("ትክክለኛ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0911223344)");
      return;
    }

    setParticipantsCount((prev) => Math.min(prev + 1, SECRET_TARGET_USERS));
    setHighestBid({
      fullName: userName.trim(),
      phone: userPhone.replace(/\s/g, ""),
      amount: bidValue,
    });
    setNewBidAmount("");
    setShowDetailsModal(false);
    toast.success(`ጨረታዎ (${bidValue.toLocaleString()} ብር) ተመዝግቧል!`);
  };

  return (
    <div className="bg-[#0B1221] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl text-white my-4">
      <div className="relative h-56 w-full bg-slate-900">
        <img
          src={apartmentPhoto}
          loading="lazy"
          alt="Luxury Apartment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-black/30" />
        
        <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow">
          የቤት ጨረታ • LUXURY
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-black/75 backdrop-blur-md text-[11px] px-2.5 py-1 rounded-full border border-slate-700">
            165 ካሬ ሜትር
          </span>
          <span className="bg-black/75 backdrop-blur-md text-[11px] px-2.5 py-1 rounded-full border border-slate-700">
            3 መኝታ ቤት
          </span>
        </div>
      </div>

      <div className="p-4 pt-2">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              ለግዠሪ አፓርታማ
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              ቦሌ፣ አዲስ አበባ • ሙሉ በሙሉ የተጠናቀቀ
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">ከፍተኛ ጨረታ</span>
            <span className="text-xl font-extrabold text-amber-400">
              {highestBid.amount.toLocaleString()} ብር
            </span>
            <span className="text-[11px] text-slate-400 block">
              መነሻ {STARTING_PRICE.toLocaleString()} ብር
            </span>
          </div>
        </div>

        <div className="bg-[#111A2E] border border-slate-800 rounded-xl p-3 my-3">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
              የጨረታው ባትሪ ሂደት
            </span>
            <span className="font-extrabold text-emerald-400 text-sm">
              {batteryPercentage}% ሞልቷል
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-full h-6 bg-slate-950 rounded-lg p-1 border border-slate-700 relative overflow-hidden">
              <div
                className={`h-full rounded bg-gradient-to-r transition-all duration-700 ${getBatteryFillColor()}`}
                style={{ width: `${batteryPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow">
                {isCompleted
                  ? "ባትሪው 100% ሞልቷል - ጨረታው ተጠናቋል"
                  : batteryPercentage >= 80
                  ? "ባትሪው ሊሞላ ተቃርቧል! ጨረታው በቅርቡ ይጠናቀቃል"
                  : "ባትሪው እየሞላ ነው..."}
              </div>
            </div>
            <div className="w-1.5 h-3.5 bg-slate-600 rounded-r-sm" />
          </div>
        </div>

        {isCompleted ? (
          <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-xl p-3.5 my-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <Trophy className="w-5 h-5" />
              <span>የአፓርታማው ጨረታ አሸናፊ ይፋ ሆኗል!</span>
            </div>
            <div className="text-xs text-slate-200 space-y-1.5 bg-black/50 p-3 rounded-lg border border-emerald-500/20">
              <p className="flex justify-between">
                <span className="text-slate-400">የአሸናፊው ሙሉ ስም፡</span>
                <strong className="text-white">{highestBid.fullName}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">ስልክ ቁጥር፡</span>
                <strong className="text-white">{highestBid.phone.includes("*") ? highestBid.phone : maskPhone(highestBid.phone)}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-400">ያሸነፈበት ከፍተኛ ዋጋ፡</span>
                <strong className="text-amber-400">
                  {highestBid.amount.toLocaleString()} ብር
                </strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-y border-slate-800/80 my-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> 18,420 እይታ
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> ንቁ ተጫራቾች
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> 64 አስተያየት
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsLiked(!isLiked);
                setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
              }}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-2.5 rounded-xl text-xs transition"
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? "text-rose-500 fill-rose-500" : "text-slate-300"
                }`}
              />
              <span>{likes}</span>
            </button>
            <button
              type="button"
              aria-label="አጋራ"
              onClick={share}
              className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl transition"
            >
              <Share2 className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          <button
            onClick={() => setShowDetailsModal(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition ${
              isCompleted
                ? "bg-slate-700 text-slate-300"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> የቤቱን ዝርዝር ይመልከቱ
              </>
            ) : (
              <>
                <Info className="w-4 h-4" /> ዝርዝር እና ጨረታ
              </>
            )}
          </button>
        </div>
      </div>

      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[#0F172A] border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white">
                የአፓርታማው ሙሉ ዝርዝር እና ጨረታ
              </h4>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
                  <Maximize2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">የቤቱ ስፋት</span>
                    <strong className="text-white">165 ካሬ ሜትር</strong>
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
                  <BedDouble className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">መኝታ ክፍል</span>
                    <strong className="text-white">3 ሰፊ መኝታዎች</strong>
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
                  <Bath className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">መታጠቢያ ቤት</span>
                    <strong className="text-white">2 ዘመናዊ ባኞ ቤት</strong>
                  </div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">ወለል እና ሊፍት</span>
                    <strong className="text-white">5ኛ ፎቅ (ባለ 2 ሊፍት)</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white mb-1">ተጨማሪ መገልገያዎች፡</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>ዘመናዊ የተሟላ ኪችን (Modern Kitchen)</li>
                  <li>የከርሰ ምድር ውሃ እና 24 ሰዓት ጀነሬተር</li>
                  <li>የመኪና ማቆሚያ (Underground Parking)</li>
                  <li>24/7 የደህንነት ካሜራ እና ጥበቃ</li>
                </ul>
              </div>
            </div>

            {!isCompleted && (
              <form
                onSubmit={handlePlaceBid}
                className="space-y-3 pt-3 border-t border-slate-800"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">አሁን ያለው ከፍተኛ ዋጋ፡</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {highestBid.amount.toLocaleString()} ብር
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">ሙሉ ስም</label>
                  <input
                    type="text"
                    required
                    placeholder="ሙሉ ስምዎን ያስገቡ"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">ስልክ ቁጥር</label>
                  <input
                    type="tel"
                    required
                    placeholder="09..."
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    የሚጫረቱበት ዋጋ (ከ {highestBid.amount + 1} ብር በላይ)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={`${highestBid.amount + 100}`}
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition"
                >
                  ጨረታውን አሁን አስገባ
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
