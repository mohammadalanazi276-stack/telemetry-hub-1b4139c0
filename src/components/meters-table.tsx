import { useMemo, useState } from "react";
import { ArrowUpDown, History, RadioTower, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { metersStore, relativeTime, useMeters, type MeterStatus } from "@/lib/meters-store";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: MeterStatus }) {
  const online = status === "ONLINE";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        online ? "border-online/40 bg-online/10 text-online" : "border-offline/40 bg-offline/10 text-offline",
      )}
    >
      <span className={online ? "dot-online" : "dot-offline"} />
      {status}
    </span>
  );
}

type Filter = "ALL" | "ONLINE" | "OFFLINE";

export function MetersTable() {
  const { meters } = useMeters();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meters
      .filter((m) => (filter === "ALL" ? true : m.status === filter))
      .filter(
        (m) =>
          !q ||
          m.meter_id.toLowerCase().includes(q) ||
          m.location.toLowerCase().includes(q) ||
          m.customer.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const d = new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
        return sortDesc ? d : -d;
      });
  }, [meters, query, filter, sortDesc]);

  return (
    <section className="panel-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Meter ID or location…"
            className="pl-9"
          />
        </div>
        <div className="flex rounded-md border border-border p-0.5">
          {(["ALL", "ONLINE", "OFFLINE"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "ALL" ? "All" : f === "ONLINE" ? "Online only" : "Offline only"}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setSortDesc((s) => !s)}>
          <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
          Last seen {sortDesc ? "newest" : "oldest"}
        </Button>
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3 font-medium">Meter ID</th>
                <th className="px-4 py-3 font-medium">Customer / Location</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Last connection</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.meter_id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{m.meter_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.customer}</div>
                    <div className="text-xs text-muted-foreground">{m.location}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.type}</td>
                  <td className="px-4 py-3">
                    <Tooltip>
                      <TooltipTrigger className="cursor-help font-mono text-xs">
                        {relativeTime(m.last_seen)}
                      </TooltipTrigger>
                      <TooltipContent>{new Date(m.last_seen).toLocaleString()}</TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast(`Telemetry history · ${m.meter_id}`, {
                            description: `Last 24h load profile for ${m.location}`,
                          })
                        }
                      >
                        <History className="mr-1.5 h-3.5 w-3.5" />
                        History
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          metersStore.ping(m.meter_id);
                          toast.success(`Ping acknowledged by ${m.meter_id}`);
                        }}
                      >
                        <RadioTower className="mr-1.5 h-3.5 w-3.5" />
                        Ping
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No meters match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TooltipProvider>
    </section>
  );
}
