import { useEffect, useRef } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { AlertTriangle, CheckCircle2, Cpu, Wrench, WifiOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { metersStore, offlineMinutes, relativeTime, useMeters } from "@/lib/meters-store";
import { cn } from "@/lib/utils";

const trend = [97.4, 98.1, 97.9, 98.6, 99.1, 98.2, 97.6, 98.9].map((v, i) => ({ i, v }));

export function useOutageWatcher() {
  const { meters } = useMeters();
  const prev = useRef<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const m of meters) {
      next[m.meter_id] = m.status;
      if (prev.current[m.meter_id] === "ONLINE" && m.status === "OFFLINE") {
        toast.error(`ALERT: ${m.meter_id} went OFFLINE`, {
          description: `${m.customer} · ${m.location}`,
        });
      }
    }
    prev.current = next;
  }, [meters]);
}

export function KpiCards() {
  const { meters, totalFleet } = useMeters();
  const offline = meters.filter((m) => m.status === "OFFLINE").length;
  const online = meters.length - offline;
  const rate = ((online / meters.length) * 100).toFixed(1);

  const cards = [
    { label: "Total Meters", value: totalFleet.toLocaleString(), icon: Cpu, tone: "text-primary" },
    { label: "Connected / Online", value: online, icon: CheckCircle2, tone: "text-online" },
    { label: "Offline / Non-comm", value: offline, icon: WifiOff, tone: "text-offline" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="panel-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <c.icon className={cn("h-4 w-4", c.tone)} />
          </div>
          <p className={cn("mt-3 font-mono text-3xl font-semibold", c.tone)}>{c.value}</p>
        </div>
      ))}
      <div className="panel-surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Success Rate</p>
          <Zap className="h-4 w-4 text-warning" />
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold">{rate}%</p>
        <div className="mt-1 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#spark)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AlertBanner() {
  const { meters } = useMeters();
  const latest = meters
    .filter((m) => m.status === "OFFLINE")
    .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())[0];
  if (!latest) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-offline/50 bg-offline/12 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-offline" />
      <p className="text-sm font-medium text-offline">
        ALERT: Meter {latest.meter_id} lost connection {relativeTime(latest.last_seen)}!
      </p>
      <span className="ml-auto hidden text-xs text-muted-foreground sm:block">{latest.location}</span>
    </div>
  );
}

export function SimulateOutageButton() {
  return (
    <Button
      variant="outline"
      className="border-warning/50 text-warning hover:bg-warning/10"
      onClick={() => {
        const m = metersStore.simulateOutage();
        if (!m) toast("All meters are already offline");
      }}
    >
      <AlertTriangle className="mr-2 h-4 w-4" />
      Simulate Meter Outage
    </Button>
  );
}

export function DisconnectedPanel() {
  const { meters } = useMeters();
  const offline = meters
    .filter((m) => m.status === "OFFLINE")
    .sort((a, b) => new Date(a.last_seen).getTime() - new Date(b.last_seen).getTime());

  return (
    <section className="panel-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-offline" />
        <h2 className="text-sm font-semibold">Disconnected Meters</h2>
        <span className="ml-auto font-mono text-xs text-muted-foreground">{offline.length} active</span>
      </div>
      <div className="space-y-2">
        {offline.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">All meters reporting normally.</p>
        )}
        {offline.map((m) => (
          <div
            key={m.meter_id}
            className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card/60 p-3"
          >
            <span className="dot-offline" />
            <div className="min-w-0">
              <p className="font-mono text-xs text-offline">{m.meter_id}</p>
              <p className="truncate text-xs text-muted-foreground">
                {m.customer} · {m.location}
              </p>
            </div>
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              offline {offlineMinutes(m.last_seen)} min
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={m.investigated ? "secondary" : "outline"}
                onClick={() => {
                  metersStore.markInvestigated(m.meter_id);
                  toast.success(`${m.meter_id} marked as investigated`);
                }}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                {m.investigated ? "Investigated" : "Mark Investigated"}
              </Button>
              <Button
                size="sm"
                variant={m.tech_dispatched ? "secondary" : "default"}
                onClick={() => {
                  metersStore.dispatchTech(m.meter_id);
                  toast.success(`Tech team dispatched to ${m.location}`);
                }}
              >
                <Wrench className="mr-1.5 h-3.5 w-3.5" />
                {m.tech_dispatched ? "Team en route" : "Send Tech Team"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
