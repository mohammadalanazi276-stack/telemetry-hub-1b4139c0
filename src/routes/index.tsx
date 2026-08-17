import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  AlertBanner,
  DisconnectedPanel,
  KpiCards,
  SimulateOutageButton,
  useOutageWatcher,
} from "@/components/dashboard-parts";
import { MetersTable } from "@/components/meters-table";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Meter Monitor · Live Grid Dashboard" },
      {
        name: "description",
        content:
          "Real-time smart meter telemetry dashboard: connection status, offline alerts, and fleet health KPIs.",
      },
      { property: "og:title", content: "Smart Meter Monitor · Live Grid Dashboard" },
      {
        property: "og:description",
        content: "Monitor smart meter connectivity, outages, and telemetry in real time.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  useOutageWatcher();
  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold">Fleet Overview</h2>
            <p className="text-sm text-muted-foreground">Live connectivity across the metering network</p>
          </div>
          <div className="ml-auto">
            <SimulateOutageButton />
          </div>
        </div>
        <AlertBanner />
        <KpiCards />
        <MetersTable />
        <DisconnectedPanel />
      </div>
    </AppShell>
  );
}
