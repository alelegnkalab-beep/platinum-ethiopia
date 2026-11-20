import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
  Menu as MenuIcon,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
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
  const { signedIn, account, logout } = useStore();
  const navigate = useNavigate();

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <header className="glass fixed inset-x-0 top-0 z-40 border-b">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <SideMenu />
          <Link to="/" className="mr-auto flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-platinum-gradient shadow-platinum">
              <Gem className="size-4 text-platinum-foreground" />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold text-platinum">ፕላቲኒየም</span>
              <span className="block text-[11px] font-semibold tracking-wide text-primary-glow">ኢትዮጵያ</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
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
                <MenuLink to="/schedule" icon={Bot} label="የምርት መልቀቂያ መርሃ ግብር" />
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

// በግራ በኩል ባለ ሦስት ሰረዝ (☰) የሚከፈት ሙሉ ሜኑ
function SideMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const item = "flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-sm text-foreground";
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="ዋና ምናሌ"
        className="mr-1 grid size-9 place-items-center rounded-xl border border-warning/40 bg-warning/15 text-warning"
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" aria-describedby={undefined} className="w-[270px] overflow-y-auto p-4">
        <SheetHeader className="border-b pb-3 text-left">
          <SheetTitle className="text-[15px] font-bold text-warning">PL • ፕላቲኒየም ኢትዮጵያ</SheetTitle>
        </SheetHeader>
        <div className="mt-4 rounded-xl border border-warning/25 bg-warning/10 p-2.5 text-[11px] leading-relaxed text-warning">
          🏢 ድርጅቱ በየቀኑ ጠዋት 1:00 ሰዓት (7:00 LT) 1 አዲስ ኦሪጅናል የኤሌክትሮኒክስ ምርት ይለቃል።
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Link to="/wallet" onClick={close} className={item}>📜 Bid History</Link>
          <Link to="/account" onClick={close} className={item}>👤 My Profile</Link>
          <details className="rounded-xl bg-secondary/50 px-3 py-2.5 text-sm">
            <summary className="cursor-pointer">❓ የድርጅቱ FAQ</summary>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              1. ሲመዘገቡ 100 ነጥብ በነጻ ያገኛሉ።<br />
              2. በየቀኑ ጠዋት 1:00 ሰዓት 1 አዲስ ምርት ይለቀቃል።<br />
              3. 1,000 ነጥብ ሲሞላ በቀጥታ ወደ ቴሌብር ማውጣት ይችላሉ።
            </p>
          </details>
          <details className="rounded-xl bg-secondary/50 px-3 py-2.5 text-sm">
            <summary className="cursor-pointer">ℹ️ About Us</summary>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              ፕላቲኒየም ኢትዮጵያ (Platinum Ethiopia) ኦሪጅናል የኤሌክትሮኒክስ ምርቶችን በግልጽ ጨረታ እና በተመጣጣኝ ዋጋ የሚያቀርብ ዘመናዊ የኢትዮጵያ መገበያያ መድረክ ነው።
            </p>
          </details>
          <Link
            to="/login"
            onClick={close}
            className="mt-1.5 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/15 px-3 py-2.5 text-sm text-destructive"
          >
            🚪 Login / Logout
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
