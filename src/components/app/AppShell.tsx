import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bot,
  CalendarCheck,
  CircleHelp,
  Gem,
  Gift,
  Home,
  ListChecks,
  LogIn,
  LogOut,
  MoreVertical,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmt, useStore } from "@/lib/store";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "መነሻ", icon: Home },
  { to: "/tasks", label: "ታስክ", icon: ListChecks },
  { to: "/daily", label: "ዴይሊ", icon: CalendarCheck },
  { to: "/referral", label: "ሪፈራል", icon: Users },
  { to: "/wallet", label: "ዋሌት", icon: Wallet },
  { to: "/airdrop", label: "ኤርድሮፕ", icon: Gift },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { signedIn, points, hydrated, account, logout } = useStore();
  const navigate = useNavigate();

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <header className="glass fixed inset-x-0 top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-platinum-gradient shadow-platinum">
              <Gem className="size-4 text-platinum-foreground" />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold text-platinum">ፕላቲኒየም</span>
              <span className="block text-[11px] font-semibold tracking-wide text-primary-glow">ኢትዮጵያ</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <Link
              to="/wallet"
              className="flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3.5 text-primary-glow" />
              <span className="font-display">{hydrated && signedIn ? fmt(points) : "—"}</span>
              <span className="text-muted-foreground">ነጥብ</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="ተጨማሪ ምናሌ"
                className="grid size-9 place-items-center rounded-full text-foreground hover:bg-secondary"
              >
                <MoreVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5">
                {signedIn && account && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      {account.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <MenuLink to="/account" icon={UserRound} label="መለያ እና ፕሮፋይል" />
                <MenuLink to="/schedule" icon={Bot} label="የAI መረጃ መርሃ ግብር" />
                <MenuLink to="/features" icon={Sparkles} label="ባህሪያት" />
                <MenuLink to="/faq" icon={CircleHelp} label="ተደጋጋሚ ጥያቄዎች" />
                <DropdownMenuSeparator />
                {signedIn ? (
                  <DropdownMenuItem
                    className="gap-3 rounded-xl py-2.5 text-destructive focus:text-destructive"
                    onSelect={() => {
                      logout();
                      toast("በሰላም ወጥተዋል");
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="size-4" /> ውጣ
                  </DropdownMenuItem>
                ) : (
                  <MenuLink to="/login" icon={LogIn} label="ግባ / ይመዝገቡ" />
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-[4.5rem]">{children}</main>

      <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-md grid-cols-6 px-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: true }}
                className="group flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground data-[status=active]:text-foreground"
              >
                <span className="grid h-7 w-11 place-items-center rounded-full transition group-data-[status=active]:bg-blue-gradient group-data-[status=active]:shadow-glow">
                  <Icon className="size-[18px] group-data-[status=active]:text-primary-foreground" />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
            {/* 24/7 ብልህ AI ረዳት (Smart AI Support Assistant) */}
      <details className="fixed bottom-20 right-4 z-50 group">
        <summary className="list-none cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-black font-bold text-xs shadow-lg hover:bg-amber-400">
          <span>🤖 AI ረዳት (24/7)</span>
        </summary>
        <div className="mt-2 w-80 p-4 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl text-xs text-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-amber-400">ፕላቲኒየም AI ረዳት</span>
            <span className="text-[10px] text-emerald-400">● መስመር ላይ (24/7)</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            ሰላም! ስለ ጨረታው፣ ስለ ቴሌብር ክፍያ ችግር ወይም ስለ ፕላቲኒየም ቶከን አክሲዮን ዝርዝር መረጃ ከፈለጉ ከታች ይምረጡ፦
          </p>
          <div className="space-y-1.5">
            <details className="p-2 rounded-lg bg-white/5">
              <summary className="cursor-pointer font-semibold text-amber-300">💳 የክፍያ ችግር ካጋጠመዎት?</summary>
              <p className="mt-1 text-slate-300 leading-relaxed">
                በቴሌብር ከፍለው ሂሳብዎ ካልገባ የትራንዛክሽን ቁጥርዎን (Transaction ID) በዋሌት (Wallet) ገጽ ላይ ያስገቡ ወይም በቀጥታ ለድጋፍ ሰጪ ቡድናችን ይላኩ፤ በ5 ደቂቃ ውስጥ ይስተካከላል።
              </p>
            </details>
            <details className="p-2 rounded-lg bg-white/5">
              <summary className="cursor-pointer font-semibold text-amber-300">🏆 ጨረታው እንዴት ይሰራል?</summary>
              <p className="mt-1 text-slate-300 leading-relaxed">
                በነጻ በሚያገኙት 100 ነጥብ ወይም በስፒን በሰበሰቡት ነጥብ በየቀኑ ጠዋት 1:00 ላይ በሚወጡ ኦሪጅናል ምርቶች ላይ መጫረት ይችላሉ። ከፍተኛ ዋጋ ያቀረበ ሰው አሸናፊ ይሆናል።
              </p>
            </details>
            <details className="p-2 rounded-lg bg-white/5">
              <summary className="cursor-pointer font-semibold text-amber-300">🚀 የፕላቲኒየም ቶከን አክሲዮን ምንድን ነው?</summary>
              <p className="mt-1 text-slate-300 leading-relaxed">
                በኤርድሮፕ (AirDrop) ገጽ ላይ ከ 1,000 ብር ጀምሮ አክሲዮን ሲገዙ የፕላቲኒየም ቶከን ቀዳሚ ባለድርሻ ይሆናሉ። ቶከኑ በይፋ ላውንች ሲደረግ ልዩ ትርፍ እና የጨረታ ቅድሚያ ያገኛሉ።
              </p>
            </details>
          </div>
        </div>
      </details>

    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/account" | "/schedule" | "/features" | "/faq" | "/login";
  icon: typeof Home;
  label: string;
}) {
  return (
    <DropdownMenuItem asChild className="gap-3 rounded-xl py-2.5">
      <Link to={to}>
        <Icon className="size-4 text-primary-glow" /> {label}
      </Link>
    </DropdownMenuItem>
  );
}
