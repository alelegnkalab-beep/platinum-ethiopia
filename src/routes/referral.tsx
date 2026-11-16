import { createFileRoute } from "@tanstack/react-router";
import { Copy, Share2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { JoinBanner, PageTitle, Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { REFERRAL_POINTS, WELCOME_BONUS_POINTS } from "@/lib/rules";
import { fmt, useStore } from "@/lib/store";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/referral")({
  head: () => pageHead("ሪፈራል", "ጓደኞችዎን ይጋብዙ፣ ለእያንዳንዱ 50 ነጥብ ያግኙ።"),
  component: ReferralPage,
});

function ReferralPage() {
  const { account, signedIn, referrals } = useStore();
  const code = signedIn && account ? account.code : "—";
  const link = typeof window !== "undefined" && signedIn ? `${window.location.origin}/login?ref=${code}` : "";

  const copy = async (v: string) => {
    if (!signedIn) return toast.error("እባክዎ መጀመሪያ ይግቡ");
    await navigator.clipboard.writeText(v);
    toast.success("ተቀድቷል");
  };
  const share = async () => {
    if (!signedIn) return toast.error("እባክዎ መጀመሪያ ይግቡ");
    const text = `ፕላቲኒየም ኢትዮጵያን ተቀላቀል! ${WELCOME_BONUS_POINTS} ነጥብ ስጦታ ታገኛለህ። ኮዴ፡ ${code}`;
    if (navigator.share) await navigator.share({ title: "ፕላቲኒየም ኢትዮጵያ", text, url: link }).catch(() => {});
    else copy(`${text} ${link}`);
  };

  return (
    <div>
      <JoinBanner />
      <PageTitle icon={Users} title="ሪፈራል" subtitle={`ለእያንዳንዱ ጓደኛ ${REFERRAL_POINTS} ነጥብ`} />

      <Panel className="bg-banner text-center">
        <p className="text-xs text-muted-foreground">የእርስዎ የሪፈራል ኮድ</p>
        <p className="my-2 font-display text-3xl font-extrabold tracking-widest text-platinum">{code}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="soft" className="h-11 rounded-2xl" onClick={() => copy(code)}>
            <Copy /> ኮድ ቅዳ
          </Button>
          <Button variant="glow" className="h-11 rounded-2xl" onClick={share}>
            <Share2 /> ሊንክ አጋራ
          </Button>
        </div>
      </Panel>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Panel>
          <p className="text-xs text-muted-foreground">የተጋበዙ</p>
          <p className="font-display text-2xl font-bold">{referrals}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">የተገኘ ነጥብ</p>
          <p className="font-display text-2xl font-bold text-platinum">{fmt(referrals * REFERRAL_POINTS)}</p>
        </Panel>
      </div>

      <h2 className="mb-3 mt-6 text-sm font-bold">እንዴት ይሰራል?</h2>
      <ol className="space-y-2">
        {[
          "የሪፈራል ሊንክዎን ለጓደኞችዎ ያጋሩ",
          `ጓደኛዎ በሊንኩ ተመዝግቦ ${WELCOME_BONUS_POINTS} ነጥብ ያገኛል`,
          `እርስዎ ለእያንዳንዱ ጓደኛ ${REFERRAL_POINTS} ነጥብ ያገኛሉ`,
        ].map((s, i) => (
          <li key={s} className="flex items-center gap-3 rounded-2xl border bg-surface p-3 text-sm">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-gradient font-display text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
      {referrals === 0 && (
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <UserPlus className="size-4" /> እስካሁን የጋበዙት ጓደኛ የለም
        </p>
      )}
    </div>
  );
}
