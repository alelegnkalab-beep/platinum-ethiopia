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
// በግራ በኩል ባለ ሦስት ሰረዝ (☰) የሚከፈት ሙሉ ሜኑ (6ቱን ዝርዝሮች ብቻ የያዘ)
if (typeof window !== "undefined") {
  setTimeout(() => {
    const header = document.querySelector("header");
    if (!header || document.getElementById("platinum-left-menu")) return;

    // ነጥብን ከላይኛው ባር ላይ ማንሳት (ዋሌት ውስጥ ብቻ እንዲሆን)
    header.querySelectorAll("span, div, a, button").forEach((el) => {
      if (el.textContent && el.textContent.includes("ነጥብ")) {
        (el as HTMLElement).style.display = "none";
      }
    });

    // የግራ በኩል ሦስት ሰረዝ (☰) ቁልፍ እና ወደ ታች የሚዘረዘር ሜኑ መፍጠር
    const menuWrapper = document.createElement("div");
    menuWrapper.id = "platinum-left-menu";
    menuWrapper.style.cssText = "position:relative;display:inline-flex;align-items:center;margin-right:8px;";

    menuWrapper.innerHTML = `
      <button id="plt-menu-btn" style="font-size:22px;padding:4px 10px;border-radius:10px;background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);cursor:pointer;">☰</button>
      <div id="plt-menu-drawer" style="display:none;position:fixed;top:0;left:0;width:270px;height:100vh;background:#0f172a;border-right:1px solid rgba(245,158,11,0.3);padding:18px;z-index:9999;overflow-y:auto;box-shadow:4px 0 24px rgba(0,0,0,0.7);color:#f8fafc;font-family:sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:14px;">
          <span style="font-weight:bold;color:#fbbf24;font-size:15px;">PL • ፕላቲኒየም ኢትዮጵያ</span>
          <button id="plt-menu-close" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div style="padding:10px;border-radius:10px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);font-size:11px;color:#fde68a;margin-bottom:14px;line-height:1.5;">
          🏢 ድርጅቱ በየቀኑ ጠዋት 1:00 ሰዓት (7:00 LT) 1 አዲስ ኦሪጅናል የኤሌክትሮኒክስ ምርት ይለቃል።
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
          <a href="/bids" style="padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.05);color:#fff;text-decoration:none;">📜 Bid History</a>
          <a href="/profile" style="padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.05);color:#fff;text-decoration:none;">👤 My Profile</a>
        
          <details style="padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.05);">
            <summary style="cursor:pointer;color:#fff;">❓ የድርጅቱ FAQ</summary>
            <p style="margin-top:8px;font-size:11px;color:#cbd5e1;line-height:1.5;">
              1. ሲመዘገቡ 100 ነጥብ በነጻ ያገኛሉ።<br/>
              2. በየቀኑ ጠዋት 1:00 ሰዓት 1 አዲስ ምርት ይለቀቃል።<br/>
              3. 1,000 ነጥብ ሲሞላ በቀጥታ ወደ ቴሌብር ማውጣት ይችላሉ።
            </p>
          </details>
          <details style="padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.05);">
            <summary style="cursor:pointer;color:#fff;">ℹ️ About Us</summary>
            <p style="margin-top:8px;font-size:11px;color:#cbd5e1;line-height:1.5;">
              ፕላቲኒየም ኢትዮጵያ (Platinum Ethiopia) ኦሪጅናል የኤሌክትሮኒክስ ምርቶችን በግልጽ ጨረታ እና በተመጣጣኝ ዋጋ የሚያቀርብ ዘመናዊ የኢትዮጵያ መገበያያ መድረክ ነው።
            </p>
          </details>
          <a href="/login" style="padding:10px 12px;border-radius:10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;text-decoration:none;margin-top:6px;">🚪 Login / Logout</a>
        </div>
      </div>
    `;

    header.prepend(menuWrapper);
    const btn = document.getElementById("plt-menu-btn");
    const drawer = document.getElementById("plt-menu-drawer");
    const closeBtn = document.getElementById("plt-menu-close");
    if (btn && drawer && closeBtn) {
      btn.onclick = () => (drawer.style.display = "block");
      closeBtn.onclick = () => (drawer.style.display = "none");
    }
  }, 400);
}
