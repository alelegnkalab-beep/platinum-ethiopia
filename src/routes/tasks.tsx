import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ExternalLink, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { JoinBanner, PageTitle, Panel } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TASK_POINTS } from "@/lib/rules";
import { fmt, useStore } from "@/lib/store";
import { SOCIAL_TASKS, type TaskId } from "@/lib/tasks";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tasks")({
  head: () => pageHead("ታስክ", "5 የማህበራዊ ሚዲያ ታስኮችን ይጨርሱ፣ ለእያንዳንዱ 100 ነጥብ ያግኙ።"),
  component: TasksPage,
});

function TasksPage() {
  const { tasks, completeTask, signedIn } = useStore();
  const [opened, setOpened] = useState<TaskId[]>([]);
  const done = tasks.length;
  const total = SOCIAL_TASKS.length;

  return (
    <div>
      <JoinBanner />
      <PageTitle icon={ListChecks} title="ታስክ" subtitle={`ይከተሉን፣ ለእያንዳንዱ ${TASK_POINTS} ነጥብ ያግኙ`} />

      <Panel className="mb-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">የተጠናቀቁ</p>
            <p className="font-display text-2xl font-bold">
              {done}/{total}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">የተገኘ ነጥብ</p>
            <p className="font-display text-2xl font-bold text-platinum">
              {fmt(done * TASK_POINTS)}
              <span className="text-sm text-muted-foreground">/{fmt(total * TASK_POINTS)}</span>
            </p>
          </div>
        </div>
        <Progress value={(done / total) * 100} className="mt-3 h-2" />
      </Panel>

      <ul className="space-y-3">
        {SOCIAL_TASKS.map((t) => {
          const isDone = tasks.includes(t.id);
          const isOpened = opened.includes(t.id);
          return (
            <li key={t.id} className="flex items-center gap-3 rounded-3xl border bg-surface p-3.5 shadow-card">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-platinum-gradient font-display text-sm font-extrabold text-platinum-foreground">
                {t.name.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.action}</p>
                <p className="mt-0.5 text-xs font-semibold text-primary-glow">+{TASK_POINTS} ነጥብ</p>
              </div>
              {isDone ? (
                <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
                  <Check className="size-3.5" /> ተጠናቋል
                </span>
              ) : !signedIn ? (
                <Button asChild variant="soft" size="sm" className="rounded-full">
                  <Link to="/login">ግባ</Link>
                </Button>
              ) : isOpened ? (
                <Button
                  variant="platinum"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    const r = completeTask(t.id, t.name);
                    if (r.ok) toast.success(r.message);
                    else toast.error(r.error);
                  }}
                >
                  ነጥብ ውሰድ
                </Button>
              ) : (
                <Button asChild variant="glow" size="sm" className="rounded-full">
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpened((o) => [...o, t.id])}
                  >
                    ተከተል <ExternalLink />
                  </a>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
          {/* የዕድል ስፒን (Spin) ክፍል */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 text-center space-y-3">
        <div className="text-3xl">🎡</div>
        <h3 className="text-lg font-bold text-amber-300">የዕድል ስፒን (Lucky Spin)</h3>
        <p className="text-xs text-slate-300">
          በ 10 ብር ወይም በሰበሰቡት ነጥብ ያሽከርክሩ እና እስከ 500 ነጥብ ወይም የቴሌብር ሽልማት ያግኙ!
        </p>
        <div className="flex gap-2 justify-center pt-1">
          <Button
            className="rounded-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
            onClick={() => toast.success("🎡 ስፒን እየተሽከረከረ ነው... 25 ነጥብ አሸንፈዋል!")}
          >
            በ 10 ብር አሽከርክር
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-amber-500/50 text-amber-300"
            onClick={() => toast.success("🎡 በነጥብ አሽከርክረው 10 ነጥብ አግኝተዋል!")}
          >
            በ 50 ነጥብ ሞክር
          </Button>
        </div>
      </div>
  
    </div>
  );
}
