import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Alert Settings · Smart Meter Monitor" },
      { name: "description", content: "Configure outage thresholds and notification channels for meter alerts." },
      { property: "og:title", content: "Alert Settings · Smart Meter Monitor" },
      { property: "og:description", content: "Tune outage thresholds and alert delivery channels." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [threshold, setThreshold] = useState(15);
  const [toasts, setToasts] = useState(true);
  const [email, setEmail] = useState(false);
  const [autoDispatch, setAutoDispatch] = useState(false);

  const rows = [
    { label: "In-app toast notifications", desc: "Fire a toast the moment a meter drops", v: toasts, set: setToasts },
    { label: "Email escalation", desc: "Notify the ops mailing list on outage", v: email, set: setEmail },
    {
      label: "Auto-dispatch tech team",
      desc: "Create a field ticket after the threshold is exceeded",
      v: autoDispatch,
      set: setAutoDispatch,
    },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Alert Settings</h2>
          <p className="text-sm text-muted-foreground">Thresholds and delivery channels</p>
        </div>

        <section className="panel-surface space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Offline threshold (minutes)</Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="max-w-32 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              A meter is escalated once it has not reported for {threshold} minutes.
            </p>
          </div>

          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3 rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <div className="ml-auto">
                <Switch checked={r.v} onCheckedChange={r.set} />
              </div>
            </div>
          ))}

          <Button onClick={() => toast.success("Alert settings saved")}>Save settings</Button>
        </section>
      </div>
    </AppShell>
  );
}
