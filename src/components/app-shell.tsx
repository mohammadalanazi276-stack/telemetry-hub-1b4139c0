import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Bell, Gauge, ListTree, PlugZap, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useMeters, metersStore } from "@/lib/meters-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/meters", label: "Meters List", icon: ListTree },
  { to: "/disconnected", label: "Disconnected Logs", icon: PlugZap },
  { to: "/settings", label: "Alert Settings", icon: SlidersHorizontal },
];

function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);
  return <span className="font-mono text-sm text-muted-foreground tabular-nums">{now || "--:--:--"}</span>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { meters, alerts } = useMeters();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const offline = meters.filter((m) => m.status === "OFFLINE").length;
  const degraded = offline > 0;
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen grid-lines">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-panel/85 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Activity className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-wide">Smart Meter Monitor</h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">Grid telemetry control</p>
          </div>
        </div>

        <div
          className={cn(
            "ml-2 hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:flex",
            degraded
              ? "border-offline/40 bg-offline/10 text-offline"
              : "border-online/40 bg-online/10 text-online",
          )}
        >
          <span className={degraded ? "dot-offline" : "dot-online"} />
          {degraded ? "Degraded" : "Operational"}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Clock />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Alerts">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-offline px-1 text-[10px] font-bold text-background">
                    {unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Active alerts
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => metersStore.clearAlerts()}
                >
                  Mark all read
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {alerts.length === 0 && (
                <DropdownMenuItem disabled>No alerts recorded</DropdownMenuItem>
              )}
              {alerts.slice(0, 8).map((a) => (
                <DropdownMenuItem key={a.id} className="flex-col items-start gap-0.5">
                  <span className="text-xs font-medium text-offline">{a.message}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-r border-border bg-panel/60 p-3 md:block">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-md border border-border bg-card/60 p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Offline now</p>
            <p className="mt-1 font-mono text-2xl text-offline">{offline}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs",
                  path === item.to ? "bg-primary/15 text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
