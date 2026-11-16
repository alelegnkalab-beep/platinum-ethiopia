import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gem, Gift, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WELCOME_BONUS_POINTS, pointsToEtb } from "@/lib/rules";
import { useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead("ግባ / ይመዝገቡ", "ይመዝገቡ እና ወዲያውኑ 100 ነጥብ (10 ብር) ስጦታ ያግኙ።"),
  component: LoginPage,
});

function LoginPage() {
  const { join, signedIn, account, logout } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ref, setRef] = useState("");

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r.slice(0, 20));
  }, []);

  if (signedIn && account)
    return (
      <Panel className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">እንደ</p>
        <p className="text-lg font-bold">{account.name}</p>
        <p className="mb-5 text-sm text-muted-foreground">ገብተዋል</p>
        <div className="grid gap-2">
          <Button asChild variant="glow" size="xl">
            <Link to="/">ወደ ጨረታዎች</Link>
          </Button>
          <Button variant="soft" size="xl" onClick={() => logout()}>
            <LogOut /> ውጣ
          </Button>
        </div>
      </Panel>
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const p = phone.replace(/\s/g, "");
    if (n.length < 2) return toast.error("እባክዎ ሙሉ ስምዎን ያስገቡ");
    if (!/^(\+251|0)?9\d{8}$|^(\+251|0)?7\d{8}$/.test(p)) return toast.error("ትክክለኛ የስልክ ቁጥር ያስገቡ (09xxxxxxxx)");
    const r = join(n.slice(0, 60), p, ref);
    if (r.ok) {
      toast.success(r.message);
      navigate({ to: "/" });
    }
  };

  return (
    <div className="pt-4">
      <div className="mb-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-platinum-gradient shadow-platinum">
          <Gem className="size-7 text-platinum-foreground" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-platinum">ፕላቲኒየም ኢትዮጵያ</h1>
        <p className="text-sm text-muted-foreground">ይግቡ ወይም አዲስ መለያ ይክፈቱ</p>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-3xl border border-primary/30 bg-banner p-4">
        <Gift className="size-6 shrink-0 text-primary-glow" />
        <p className="text-sm">
          ልክ እንደተቀላቀሉ <b>{WELCOME_BONUS_POINTS} ነጥብ ({pointsToEtb(WELCOME_BONUS_POINTS)} ብር)</b> ስጦታ!
        </p>
      </div>

      <Panel>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="ሙሉ ስም" id="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="ለምሳሌ፡ አበበ ተሰማ" className="h-12 rounded-2xl" />
          </Field>
          <Field label="ስልክ ቁጥር" id="phone">
            <Input id="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={14} placeholder="09xxxxxxxx" className="h-12 rounded-2xl" />
          </Field>
          <Field label="የሪፈራል ኮድ (አማራጭ)" id="ref">
            <Input id="ref" value={ref} onChange={(e) => setRef(e.target.value)} maxLength={20} placeholder="PLT…" className="h-12 rounded-2xl" />
          </Field>
          <Button type="submit" variant="glow" size="xl" className="w-full">
            ይቀላቀሉ
          </Button>
        </form>
      </Panel>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
