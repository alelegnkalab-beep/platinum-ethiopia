import React, { useState } from 'react';
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
      alert(`እባክዎ አሁን ካለው ከፍተኛ ጨረታ (${highestBid.amount.toLocaleString()} ብር) በላይ ያስገቡ!`);
      return;
    }

    setParticipantsCount((prev) => Math.min(prev + 1, SECRET_TARGET_USERS));
    setHighestBid({
      fullName: userName,
      phone: userPhone,
      amount: bidValue,
    });
    setNewBidAmount("");
    setShowDetailsModal(false);
  };

  return (
    <div className="bg-[#0B1221] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl text-white my-4">
      <div className="relative h-56 w-full bg-slate-900">
        <img
          src="https://unsplash.com"
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
                <strong className="text-white">{highestBid.phone}</strong>
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
            <button className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl transition">
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
