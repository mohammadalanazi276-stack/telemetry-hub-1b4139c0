# Telemetry Hub

Build a modern, full-stack Smart Meter Monitoring Dashboard using React, Tailwind CSS, Lucide Icons, and Supabase.

### 1. Overall Layout & Theme

- Dark mode responsive interface with a sleek, clean, industrial telemetry aesthetic.

- Top Navigation Bar showing: Application Title ("Smart Meter Monitor"), System Status Indicator (Operational/Degraded), Current Time, and a Notification Bell with badge counter for active alerts.

- Sidebar Navigation: Dashboard, Meters List, Disconnected Logs, Alert Settings.

### 2. Dashboard KPI Summary Cards

Create top summary cards showing:

- Total Meters (e.g., 1,250)

- Connected / Online Meters (Green badge)

- Offline / Non-communicating Meters (Red badge)

- Connection Success Rate percentage with a mini trend chart.

### 3. Main Meters Table & Data View

Display an interactive table with the following columns:

- Meter ID (e.g., MTR-9021)

- Customer Name / Location

- Meter Type (Single Phase / Three Phase)

- Last Connection Timestamp (Relative format like "2 mins ago" and full date on hover)

- Status Badge: 

  - 'ONLINE' (Green pulsing indicator)

  - 'OFFLINE' (Red blinking indicator)

- Actions: "View Telemetry History" and "Trigger Manual Ping" buttons.

Features for the table:

- Search bar by Meter ID or Location.

- Filter by status: All, Online Only, Offline Only.

- Sorting by Last Connection timestamp.

### 4. Real-Time Alert System

- Prominent Red Alert Banner at the top of the dashboard whenever any meter loses connection (e.g., "ALERT: Meter MTR-8841 lost connection 3 mins ago!").

- Toast notifications that appear in real-time when a meter status flips from ONLINE to OFFLINE.

- A "Disconnected Meters Panel" listing all currently offline meters, sorted by longest duration offline, with a quick button to "Mark as Investigated" or "Send Tech Team".

### 5. Mock Data & Logic

- Populate with realistic mock data (at least 10 smart meters, 3 of which are currently OFFLINE with last connection times exceeding 15 minutes).

- Include a simulated toggle or button ("Simulate Meter Outage") to instantly turn an online meter offline so I can test the alert logic and visual notification.

- Setup Supabase integration readiness for `meters` table (meter_id, location, status, last_seen, created_at) and `alerts` table.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/64d653ff-4e32-4802-9706-8bf318287024).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
