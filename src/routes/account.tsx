import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gavel, Heart, LogOut, MessageCircle, Sparkles, UserRound } from "lucide-react";
import { PageTitle, Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { pointsToEtb } from "@/lib/rules";
import { fmt, useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () => pageHead("መለያ እና ፕሮፋይል", "የእርስዎ መለያ፣ ነጥቦች እና የጨረታ እንቅስቃሴ።"),
  component: AccountPage,
});

function AccountPage() {
  const { signedIn, account, points, products, logout } = useStore();
  const navigate = useNavigate();

  if (!signedIn || !account)
    return (
      <div>
        <PageTitle icon={UserRound} title="መለያ እና ፕሮፋይል" />
        <Panel className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">መለያዎን ለማየት ይግቡ</p>
          <Button asChild variant="glow" size="xl" className="w-full">
            <Link to="/login">ግባ / ይመዝገቡ</Link>
          </Button>
        </Panel>
      </div>
    );

  const myBids = products.flatMap((p) => p.bids.filter((b) => b.mine).map((b) => ({ ...b, product: p.name })));
  const likes = products.filter((p) => p.liked).length;
  const comments = products.reduce((n, p) => n + p.comments.filter((c) => c.mine).length, 0);

  return (
    <div>
      <PageTitle icon={UserRound} title="መለያ እና ፕሮፋይል" />
      <Panel className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-platinum-gradient text-2xl font-extrabold text-platinum-foreground">
          {account.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{account.name}</p>
          <p className="font-display text-sm text-muted-foreground">{account.phone}</p>
          <p className="text-xs text-muted-foreground">
            ከ {new Date(account.joinedAt).toLocaleDateString("am-ET")} ጀምሮ · ኮድ {account.code}
          </p>
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon={Sparkles} label="ነጥብ" value={`${fmt(points)} (${fmt(pointsToEtb(points))} ብር)`} />
        <Stat icon={Gavel} label="ጨረታዎች" value={String(myBids.length)} />
        <Stat icon={Heart} label="ላይኮች" value={String(likes)} />
        <Stat icon={MessageCircle} label="አስተያየቶች" value={String(comments)} />
      </div>

      <h2 className="mb-2 mt-6 text-sm font-bold">የእኔ ጨረታዎች</h2>
      {myBids.length === 0 ? (
        <p className="rounded-2xl border bg-surface p-4 text-center text-xs text-muted-foreground">እስካሁን ጨረታ አላስገቡም</p>
      ) : (
        <ul className="space-y-2">
          {myBids.map((b) => (
            <li key={b.id} className="flex justify-between rounded-2xl border bg-surface p-3 text-sm">
              <span>{b.product}</span>
              <span className="font-display font-semibold">{fmt(b.amountEtb)} ብር</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="soft"
        size="xl"
        className="mt-6 w-full text-destructive"
        onClick={() => {
          logout();
          navigate({ to: "/" });
        }}
      >
        <LogOut /> ውጣ
      </Button>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-surface p-3">
      <Icon className="size-4 text-primary-glow" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-sm font-bold">{value}</p>
    </div>
  );
}
