import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, Copy, ExternalLink, ImagePlus, Loader2, Lock, Wallet } from "lucide-react";
import { toast } from "sonner";
import { JoinBanner, PageTitle, Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MIN_ACTION_POINTS, POINTS_PER_ETB, pointsToEtb } from "@/lib/rules";
import { fmt, useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/wallet")({
  head: () => pageHead("ዋሌት", "የነጥብ እና የብር ሂሳብዎን ይመልከቱ፣ ገንዘብ ያውጡ።"),
  component: WalletPage,
});

const WALLET_EXTRA_KEY = "platinum-ethiopia:wallet-extra-v1";
const USED_TX_KEY = "platinum-ethiopia:used-tx-ids-v1";
const METHODS = ["ቴሌብር", "ሲቢኢ ብር", "የኢትዮጵያ ንግድ ባንክ", "አቢሲኒያ ባንክ"];

const MY_ACCOUNTS = {
  name: "Kalab Alelegn (ቃላብ አለልኝ)",
  cbe: "1000547830974",
  telebirr: "0900071005",
};

interface DepositRecord {
  id: string;
  method: "CBE" | "Telebirr";
  txId: string;
  amount: number;
  status: "Approved" | "Pending";
  screenshotName: string;
  at: string;
}

function WalletPage() {
  const { points, signedIn, txs, withdrawals, withdraw } = useStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("ቴሌብር");
  const [acct, setAcct] = useState("");
  const balance = signedIn ? points : 0;
  const unlocked = balance >= MIN_ACTION_POINTS;

  const [depositOpen, setDepositOpen] = useState(false);
  const [etbBalance, setEtbBalance] = useState(0);
  const [convertedPts, setConvertedPts] = useState(0);
  const [walletLoaded, setWalletLoaded] = useState(false);

  // Cheki.et Deposit States
  const [payMethod, setPayMethod] = useState<"CBE" | "Telebirr">("CBE");
  const [txIdInput, setTxIdInput] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [usedTxIds, setUsedTxIds] = useState<string[]>([]);
  const [depositHistory, setDepositHistory] = useState<DepositRecord[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WALLET_EXTRA_KEY) || "{}") as {
        etb?: number;
        converted?: number;
        deposits?: DepositRecord[];
      };
      if (typeof saved.etb === "number") setEtbBalance(saved.etb);
      if (typeof saved.converted === "number") setConvertedPts(saved.converted);
      if (Array.isArray(saved.deposits)) setDepositHistory(saved.deposits);

      const savedTxs = JSON.parse(localStorage.getItem(USED_TX_KEY) || "[]") as string[];
      if (Array.isArray(savedTxs)) setUsedTxIds(savedTxs);
    } catch {
      /* ignore corrupt storage */
    }
    setWalletLoaded(true);
  }, []);

  useEffect(() => {
    if (walletLoaded) {
      localStorage.setItem(
        WALLET_EXTRA_KEY,
        JSON.stringify({ etb: etbBalance, converted: convertedPts, deposits: depositHistory })
      );
      localStorage.setItem(USED_TX_KEY, JSON.stringify(usedTxIds));
    }
  }, [walletLoaded, etbBalance, convertedPts, depositHistory, usedTxIds]);

  const availablePts = Math.max(0, balance - convertedPts);

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} ተቀድቷል (Copied): ${text}`);
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = txIdInput.trim().toUpperCase();

    if (!cleanRef) {
      toast.error("እባክዎ የትራንዛክሽን ቁጥሩን (Transaction ID) ያስገቡ");
      return;
    }
    if (!screenshotFile) {
      toast.error("እባክዎ የደረሰኙን ስክሪንሾት (Screenshot) ይጫኑ");
      return;
    }
    if (usedTxIds.includes(cleanRef)) {
      toast.error("ይህ Transaction ID ከዚህ በፊት ጥቅም ላይ ውሏል! ተመሳሳይ ደረሰኝ መጠቀም አይቻልም።");
      return;
    }

    setVerifying(true);
    try {
      if (payMethod === "CBE") {
        const res = await fetch("https://cheki.et", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bank: "CBE",
            reference: cleanRef,
            account: MY_ACCOUNTS.cbe,
          }),
        });

        const data = await res.json();

        if (data && (data.verified === true || data.status === "verified" || data.amount)) {
          const receiverAcct = String(data.receiverAccount || data.receiver_account || data.account || "");
          const receiverName = String(data.receiverName || data.receiver_name || data.receiver || "").toLowerCase();
          const paidAmount = Number(data.amount || manualAmount || 0);

          const isValidReceiver =
            receiverAcct.includes("547830974") ||
            receiverName.includes("kalab") ||
            receiverName.includes("alelegn") ||
            receiverName.includes("ቃላብ");

          if (!isValidReceiver && (receiverAcct || receiverName)) {
            toast.error("ክፍያው የተላከው ወደ Kalab Alelegn (1000547830974) አካውንት አይደለም!");
            setVerifying(false);
            return;
          }

          if (paidAmount < 10) {
            toast.error("ዝቅተኛው የዲፖዚት መጠን 10 ብር ነው");
            setVerifying(false);
            return;
          }

          setEtbBalance((prev) => prev + paidAmount);
          setUsedTxIds((prev) => [...prev, cleanRef]);
          setDepositHistory((prev) => [
            {
              id: crypto.randomUUID(),
              method: "CBE",
              txId: cleanRef,
              amount: paidAmount,
              status: "Approved",
              screenshotName: screenshotFile.name,
              at: new Date().toISOString(),
            },
            ...prev,
          ]);

          toast.success(`Approved! ${fmt(paidAmount)} ብር በ Cheki.et ተረጋግጦ ወደ ዋሌትዎ ገብቷል!`);
          setTxIdInput("");
          setManualAmount("");
          setScreenshotFile(null);
          setDepositOpen(false);
        } else {
          toast.error(data?.message || "ደረሰኙ በ CBE አልተረጋገጠም፤ ትክክለኛውን Transaction ID ማስገባትዎን ያረጋግጡ።");
        }
      } else {
        // Telebirr verification via Cheki.et / Official Ethiotelecom receipt fallback
        const res = await fetch("https://cheki.et", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bank: "TELEBIRR",
            reference: cleanRef,
          }),
        }).catch(() => null);

        const data = res ? await res.json().catch(() => null) : null;
        const paidAmount = Number(data?.amount || manualAmount || 0);

        if (data && data.verified === true && paidAmount >= 10) {
          setEtbBalance((prev) => prev + paidAmount);
          setUsedTxIds((prev) => [...prev, cleanRef]);
          setDepositHistory((prev) => [
            {
              id: crypto.randomUUID(),
              method: "Telebirr",
              txId: cleanRef,
              amount: paidAmount,
              status: "Approved",
              screenshotName: screenshotFile.name,
              at: new Date().toISOString(),
            },
            ...prev,
          ]);
          toast.success(`Approved! ${fmt(paidAmount)} ብር የቴሌብር ክፍያ ተረጋግጦ ገብቷል!`);
          setTxIdInput("");
          setManualAmount("");
          setScreenshotFile(null);
          setDepositOpen(false);
        } else {
          if (paidAmount < 10) {
            toast.error("እባክዎ የላኩትን የብር መጠን (ቢያንስ 10 ብር) ያስገቡ");
            setVerifying(false);
            return;
          }
          // Open official Telebirr receipt verification page & record with screenshot proof
          window.open(`https://ethiotelecom.et{cleanRef}`, "_blank");
          setEtbBalance((prev) => prev + paidAmount);
          setUsedTxIds((prev) => [...prev, cleanRef]);
          setDepositHistory((prev) => [
            {
              id: crypto.randomUUID(),
              method: "Telebirr",
              txId: cleanRef,
              amount: paidAmount,
              status: "Approved",
              screenshotName: screenshotFile.name,
              at: new Date().toISOString(),
            },
            ...prev,
          ]);
          toast.success(`Approved! የቴሌብር ደረሰኝ (${cleanRef}) እና ስክሪንሾት ተመዝግቦ ${fmt(paidAmount)} ብር ገብቷል!`);
          setTxIdInput("");
          setManualAmount("");
          setScreenshotFile(null);
          setDepositOpen(false);
        }
      }
    } catch {
      toast.error("የኔትወርክ ችግር አጋጥሟል፤ እባክዎ ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።");
    } finally {
      setVerifying(false);
    }
  };

  const submit = () => {
    if (!acct.trim()) {
      toast.error("የሂሳብ ወይም የስልክ ቁጥር ያስገቡ");
      return;
    }
    const r = withdraw(Math.floor(Number(amount)), method, acct.trim());
    if (r.ok) {
      toast.success(r.message);
      setOpen(false);
    } else toast.error(r.error);
  };

  return (
    <div>
      <JoinBanner />
      <PageTitle icon={Wallet} title="ዋሌት" subtitle={`100 ነጥብ = ${100 / POINTS_PER_ETB} ብር`} />

      <section className="relative overflow-hidden rounded-[1.75rem] bg-platinum-gradient p-5 text-platinum-foreground shadow-platinum">
        <p className="text-xs font-semibold opacity-70">ጠቅላላ ሂሳብ</p>
        <p className="mt-1 font-display text-4xl font-extrabold">
          {fmt(balance)} <span className="text-base">ነጥብ</span>
        </p>
        <p className="font-display text-lg font-semibold opacity-80">≈ {fmt(pointsToEtb(balance))} ብር</p>
        <Button
          variant="default"
