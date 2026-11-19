import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Clock, Lock, Wallet } from "lucide-react";
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

const METHODS = ["ቴሌብር", "ሲቢኢ ብር", "የኢትዮጵያ ንግድ ባንክ", "አቢሲኒያ ባንክ"];

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
  const availablePts = Math.max(0, balance - convertedPts);


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
          size="xl"
          className="mt-5 w-full"
          disabled={!signedIn}
          onClick={() => {
            if (!unlocked) {
              toast.error(`ለማውጣት ቢያንስ ${fmt(MIN_ACTION_POINTS)} ነጥብ (100 ብር) ያስፈልጋል`);
              return;
            }
            setAmount(String(balance));
            setOpen(true);
          }}
        >
          {unlocked ? <ArrowUpRight /> : <Lock />} ገንዘብ አውጣ
        </Button>
      </section>
            <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="glow"
          size="xl"
          className="w-full font-bold"
          onClick={() => setDepositOpen(!depositOpen)}
        >
          <ArrowDownRight className="mr-1 size-5" /> ዲፖዚት (Deposit)
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="w-full font-bold"
          disabled={!signedIn}
          onClick={() => {
            if (!unlocked && etbBalance <= 0) {
              toast.error(`ለማውጣት ቢያንስ ${fmt(MIN_ACTION_POINTS)} ነጥብ ያስፈልጋል`);
              return;
            }
            setAmount(String(etbBalance > 0 ? etbBalance : balance));
            setOpen(true);
          }}
        >
          <ArrowUpRight className="mr-1 size-5" /> ዊዝድሮው (Withdraw)
        </Button>
      </div>

      {depositOpen && (
        <Panel className="mt-3 border-amber-500/40 bg-amber-500/5">
          <p className="text-sm font-bold text-amber-400">💳 በቴሌብር ዲፖዚት ያድርጉ</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ወደ <span className="font-bold text-foreground">0900071005</span> ብር ልከው የትራንዛክሽን ቁጥሩን ያስገቡ (ሚኒመም 10 ብር)።
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const depAmt = Number(formData.get("depAmount") || 0);
              if (depAmt >= 10) {
                setEtbBalance((prev) => prev + depAmt);
                toast.success(`${depAmt} ብር ዲፖዚት ጥያቄ ተልኳል!`);
                setDepositOpen(false);
              }
            }}
            className="mt-3 space-y-2"
          >
            <Input name="depAmount" type="number" min={10} required placeholder="የብር መጠን (ቢያንስ 10 ብር)" className="h-11 rounded-xl" />
            <Input name="txId" type="text" required placeholder="የቴሌብር ትራንዛክሽን ቁጥር" className="h-11 rounded-xl" />
            <Button type="submit" variant="glow" className="w-full h-11 rounded-xl font-bold">
              ዲፖዚት አረጋግጥ
            </Button>
          </form>
        </Panel>
      )}

      <Panel className="mt-4 border-primary/30 bg-surface">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">የፖይንት ካርድ (Available Points)</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">{fmt(availablePts)} ነጥብ</p>
            <p className="mt-1 text-xs text-muted-foreground">
              የአካውንት ብር (ለጨረታ እና ዊዝድሮው)፦ <span className="font-bold text-foreground">{fmt(etbBalance)} ብር</span>
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl font-bold"
            disabled={availablePts <= 0}
            onClick={() => {
              const addedEtb = Math.floor(availablePts / 10);
              if (addedEtb <= 0) {
                toast.error("ለመቀየር ቢያንስ 10 ነጥብ ያስፈልጋል");
                return;
              }
              setConvertedPts((prev) => prev + addedEtb * 10);
              setEtbBalance((prev) => prev + addedEtb);
              toast.success(`${addedEtb * 10} ነጥብ ወደ ${addedEtb} ብር ተቀይሯል!`);
            }}
          >
            ወደ ብር ቀይር (Convert)
          </Button>
        </div>
      </Panel>


      {!unlocked && (
        <Panel className="mt-4">
          <p className="text-sm font-semibold">ለማውጣት እና ለመጫረት ቢያንስ {fmt(MIN_ACTION_POINTS)} ነጥብ (100 ብር)</p>
          <Progress value={(balance / MIN_ACTION_POINTS) * 100} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            {fmt(balance)} / {fmt(MIN_ACTION_POINTS)} · የሚቀረው {fmt(MIN_ACTION_POINTS - balance)} ነጥብ
          </p>
        </Panel>
      )}

      {withdrawals.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 text-sm font-bold">የማውጫ ጥያቄዎች</h2>
          <ul className="space-y-2">
            {withdrawals.map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-2xl border bg-surface p-3 text-sm">
                <span>
                  {fmt(w.etb)} ብር · {w.method}
                  <span className="block text-xs text-muted-foreground">{w.account}</span>
                </span>
                <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-xs text-warning">
                  <Clock className="size-3" /> በሂደት ላይ
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mb-2 mt-6 text-sm font-bold">የግብይት ታሪክ</h2>
      {!signedIn || txs.length === 0 ? (
        <p className="rounded-2xl border bg-surface p-4 text-center text-xs text-muted-foreground">ምንም ግብይት የለም</p>
      ) : (
        <ul className="space-y-2">
          {txs.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl border bg-surface p-3">
              <span
                className={
                  t.points >= 0
                    ? "grid size-9 place-items-center rounded-xl bg-success/15 text-success"
                    : "grid size-9 place-items-center rounded-xl bg-destructive/15 text-destructive"
                }
              >
                {t.points >= 0 ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{t.label}</p>
                <p className="text-[11px] text-muted-foreground">{new Date(t.at).toLocaleString("am-ET")}</p>
              </div>
              <span className={t.points >= 0 ? "font-display text-sm font-bold text-success" : "font-display text-sm font-bold"}>
                {t.points >= 0 ? "+" : ""}
                {fmt(t.points)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-3xl bg-popover sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ገንዘብ አውጣ</DialogTitle>
            <DialogDescription>ዝቅተኛው {fmt(MIN_ACTION_POINTS)} ነጥብ (100 ብር)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="wd-amount">
                መጠን (ነጥብ)
              </label>
              <Input
                id="wd-amount"
                type="number"
                inputMode="numeric"
                min={MIN_ACTION_POINTS}
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 h-12 rounded-2xl font-display text-lg"
              />
              <p className="mt-1 text-xs text-primary-glow">≈ {fmt(pointsToEtb(Number(amount) || 0))} ብር</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">የመክፈያ ዘዴ</label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="mt-1 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="wd-acct">
                ስልክ / የሂሳብ ቁጥር
              </label>
              <Input
                id="wd-acct"
                value={acct}
                onChange={(e) => setAcct(e.target.value)}
                placeholder="09xxxxxxxx"
                maxLength={30}
                className="mt-1 h-12 rounded-2xl"
              />
            </div>
            <Button variant="glow" size="xl" className="w-full" onClick={submit}>
              ጥያቄ ላክ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
