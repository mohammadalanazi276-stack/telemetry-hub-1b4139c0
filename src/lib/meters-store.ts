import { useSyncExternalStore } from "react";

export type MeterStatus = "ONLINE" | "OFFLINE";
export type MeterType = "Single Phase" | "Three Phase";

export interface Meter {
  id: string;
  meter_id: string;
  customer: string;
  location: string;
  type: MeterType;
  status: MeterStatus;
  last_seen: string; // ISO
  investigated?: boolean;
  tech_dispatched?: boolean;
}

export interface AlertItem {
  id: string;
  meter_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const seed: Meter[] = [
  ["MTR-9021", "Al Rashid Residence", "Riyadh · Al Olaya, Blk 12", "Single Phase", "ONLINE", 1],
  ["MTR-8841", "Nakheel Tower Ops", "Riyadh · King Fahd Rd", "Three Phase", "OFFLINE", 23],
  ["MTR-7734", "Sara Al Mutairi", "Jeddah · Al Hamra, Blk 4", "Single Phase", "ONLINE", 2],
  ["MTR-6620", "Coastal Cold Storage", "Dammam · Industrial 2", "Three Phase", "OFFLINE", 47],
  ["MTR-5512", "Bin Salem Bakery", "Riyadh · Al Malaz", "Three Phase", "ONLINE", 4],
  ["MTR-4408", "Faisal Residence", "Mecca · Al Aziziyah", "Single Phase", "ONLINE", 3],
  ["MTR-3390", "Green Valley Farm", "Qassim · Buraydah North", "Three Phase", "OFFLINE", 96],
  ["MTR-2287", "Layla Abdulaziz", "Medina · Quba District", "Single Phase", "ONLINE", 6],
  ["MTR-1174", "Horizon Data Center", "Riyadh · Exit 10", "Three Phase", "ONLINE", 1],
  ["MTR-1058", "Al Noor Clinic", "Jeddah · Al Salamah", "Single Phase", "ONLINE", 8],
  ["MTR-0942", "Desert Wind Logistics", "Tabuk · Port Rd", "Three Phase", "ONLINE", 5],
  ["MTR-0813", "Omar Al Harbi", "Abha · Al Sadd", "Single Phase", "ONLINE", 11],
].map((r) => {
  const [meter_id, customer, location, type, status, mins] = r as [
    string,
    string,
    string,
    MeterType,
    MeterStatus,
    number,
  ];
  return { id: meter_id, meter_id, customer, location, type, status, last_seen: minsAgo(mins) };
});

interface State {
  meters: Meter[];
  alerts: AlertItem[];
  totalFleet: number;
}

let state: State = {
  meters: seed,
  alerts: seed
    .filter((m) => m.status === "OFFLINE")
    .map((m) => ({
      id: `${m.meter_id}-init`,
      meter_id: m.meter_id,
      message: `${m.meter_id} (${m.location}) lost connection`,
      created_at: m.last_seen,
      read: false,
    })),
  totalFleet: 1250,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  emit();
};

export const metersStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
  ping(meterId: string) {
    set({
      meters: state.meters.map((m) =>
        m.meter_id === meterId
          ? { ...m, status: "ONLINE", last_seen: new Date().toISOString(), investigated: false }
          : m,
      ),
    });
  },
  setOffline(meterId: string) {
    const meter = state.meters.find((m) => m.meter_id === meterId);
    if (!meter) return;
    set({
      meters: state.meters.map((m) =>
        m.meter_id === meterId ? { ...m, status: "OFFLINE", last_seen: new Date().toISOString() } : m,
      ),
      alerts: [
        {
          id: `${meterId}-${Date.now()}`,
          meter_id: meterId,
          message: `${meterId} (${meter.location}) lost connection`,
          created_at: new Date().toISOString(),
          read: false,
        },
        ...state.alerts,
      ],
    });
    return meter;
  },
  simulateOutage() {
    const online = state.meters.filter((m) => m.status === "ONLINE");
    if (!online.length) return null;
    const pick = online[Math.floor(Math.random() * online.length)]!;
    metersStore.setOffline(pick.meter_id);
    return pick;
  },
  markInvestigated(meterId: string) {
    set({
      meters: state.meters.map((m) => (m.meter_id === meterId ? { ...m, investigated: true } : m)),
    });
  },
  dispatchTech(meterId: string) {
    set({
      meters: state.meters.map((m) => (m.meter_id === meterId ? { ...m, tech_dispatched: true } : m)),
    });
  },
  clearAlerts() {
    set({ alerts: state.alerts.map((a) => ({ ...a, read: true })) });
  },
};

export function useMeters() {
  return useSyncExternalStore(metersStore.subscribe, metersStore.get, metersStore.get);
}

export function relativeTime(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  return `${Math.floor(hrs / 24)} day${hrs < 48 ? "" : "s"} ago`;
}

export function offlineMinutes(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}
