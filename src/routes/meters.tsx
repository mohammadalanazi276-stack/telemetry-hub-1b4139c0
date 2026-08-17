import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { SimulateOutageButton, useOutageWatcher } from "@/components/dashboard-parts";
import { MetersTable } from "@/components/meters-table";

export const Route = createFileRoute("/meters")({
  head: () => ({
    meta: [
      { title: "Meters List · Smart Meter Monitor" },
      { name: "description", content: "Searchable list of every smart meter with live connection status." },
      { property: "og:title", content: "Meters List · Smart Meter Monitor" },
      { property: "og:description", content: "Search, filter and ping smart meters across the network." },
    ],
  }),
  component: MetersPage,
});

function MetersPage() {
  useOutageWatcher();
  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold">Meters List</h2>
            <p className="text-sm text-muted-foreground">All registered endpoints in the fleet</p>
          </div>
          <div className="ml-auto">
            <SimulateOutageButton />
          </div>
        </div>
        <MetersTable />
      </div>
    </AppShell>
  );
}
