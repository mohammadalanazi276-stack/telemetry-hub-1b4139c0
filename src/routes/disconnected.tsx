import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AlertBanner, DisconnectedPanel, useOutageWatcher } from "@/components/dashboard-parts";
import { useMeters } from "@/lib/meters-store";

export const Route = createFileRoute("/disconnected")({
  head: () => ({
    meta: [
      { title: "Disconnected Logs · Smart Meter Monitor" },
      { name: "description", content: "Log of smart meters that lost connection, sorted by outage duration." },
      { property: "og:title", content: "Disconnected Logs · Smart Meter Monitor" },
      { property: "og:description", content: "Review outage history and dispatch technicians." },
    ],
  }),
  component: DisconnectedPage,
});

function DisconnectedPage() {
  useOutageWatcher();
  const { alerts } = useMeters();
  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Disconnected Logs</h2>
          <p className="text-sm text-muted-foreground">Outage events and remediation status</p>
        </div>
        <AlertBanner />
        <DisconnectedPanel />
        <section className="panel-surface p-4">
          <h3 className="mb-3 text-sm font-semibold">Event log</h3>
          <ul className="space-y-2">
            {alerts.length === 0 && <li className="text-sm text-muted-foreground">No events recorded.</li>}
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-xs"
              >
                <span className="font-mono text-offline">{a.meter_id}</span>
                <span className="text-muted-foreground">{a.message}</span>
                <span className="ml-auto font-mono text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
