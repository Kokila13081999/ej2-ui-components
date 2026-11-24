# Syncfusion UI Components

A demo supply chain management (SCM) app built with React 19, Vite, TypeScript and Syncfusion Essential JS 2 (v35.2.12).

* **Login** with a JWT token (`admin` / `admin`). Protected routes, auto-logout when the token expires, logout on any 401.
* **Dashboard** with KPI tiles and component cards: Data Grid, Pivot Table, Chart, Gantt, Schedule, Diagram.
* **Data Grid**: 1,00,000 SCM orders using **custom data binding** (`dataStateChange`), server-side **sorting** (multi-column), **Excel filtering** and **virtual scrolling**.
* **Pivot Table**: the same 1L records, pre-aggregated on the server (about 10.6K rows), with grouping bar, field list and virtual scrolling.
* **Chart**: spline, column and donut charts from the same data.
* **Gantt, Schedule, Diagram**: demo pages with sample SCM data.

## Run it

Requires Node 18 or later.

```bash
cd syncfusion-ui-components

npm run install:all      # installs root, server and client
# optional: add your key in client/.env  ->  VITE_SYNCFUSION_LICENSE=xxxx
npm run dev              # API on :5000 + React on http://localhost:5173
```

Or use two terminals: `cd server && npm start`, then `cd client && npm run dev`.

Production build: `npm run build`, then `npm run preview` (http://localhost:4173).

> Without a license key, Syncfusion shows a trial banner at the top of the page. Copy `client/.env.example` to `client/.env` and set `VITE_SYNCFUSION_LICENSE`.

## Project layout

```
server/                 Express mock API
  data.js               seeded generator for 1,00,000 SCM orders
  query.js              where / sorted / skip / take engine + view cache
  server.js             /api/auth/login, /api/orders, /api/orders/distinct, /api/pivot, /api/summary
client/src/
  auth/                 AuthContext (token, expiry timer), ProtectedRoute / PublicOnlyRoute
  services/             api.ts (fetch + Bearer token), scmService.ts
  layout/AppLayout.tsx  header, sidebar, lazy-route Suspense, error boundary
  pages/                Login, Dashboard, DataGrid, Pivot, Chart, Gantt, Schedule, Diagram
```

## How the Data Grid custom binding works

1. On mount, the page requests `{ skip: 0, take: 100 }` and assigns `{ result, count }` to `grid.dataSource`.
2. Each sort, filter or virtual-scroll action raises `dataStateChange(state)`. The page posts `skip`, `take`, `sorted` and `where` to `POST /api/orders` and assigns the response.
3. For the Excel filter checkbox list (`filterchoicerequest` / `filterSearchBegin`), the page calls `POST /api/orders/distinct`, sending the other columns' active filters too, and passes the rows to `state.dataSource(...)`.
4. Out-of-order responses are dropped, so fast sorting, filtering or scrolling never shows stale rows.

| API endpoints (all except login need `Authorization: Bearer <token>`) | |
|---|---|
| `POST /api/auth/login` | `{ username, password }` → `{ token, expiresAt, user }` |
| `GET  /api/auth/me` | current user |
| `POST /api/orders` | `{ skip, take, sorted, where }` → `{ result, count, serverMs }` |
| `POST /api/orders/distinct` | `{ field, where, take }` → one record per distinct value |
| `GET  /api/pivot` | aggregated rows for the Pivot Table |
| `GET  /api/summary` | KPIs and chart series |

## Performance notes

| Measured (1,00,000 rows, server side) | Time |
|---|---|
| Generate data at start-up | about 250 ms |
| First page / any deep page | under 1 ms |
| Sort on a text column (uncached) | about 40 ms |
| Multi-column sort (uncached) | about 65 ms |
| Filters (contains, date range + OR status, numeric) | 6–15 ms |
| Same sort/filter state again (view cache) | under 1 ms |
| Grid: 40 fast scrollbar jumps | 1 request after scrolling stops (debounced) |

* The server keeps each filtered and sorted view as an index array (LRU of 30). Scroll requests only slice it.
* Text columns are sorted by pre-computed numeric ranks, so no string compares happen at sort time.
* Gzip compression is on for the API. Each page is lazy-loaded, so a Syncfusion package and its CSS download only when you open that page.
* `vite.config.ts` removes the blocking Google Fonts `@import` from the Syncfusion theme CSS. That import breaks lazy-loaded pages on offline or proxied networks. `index.html` loads Inter without blocking instead.
* The Grid's `enableCache` stays off. In 35.2.12, the first large scrollbar jump after the initial load returned cached rows from the wrong position. The server view cache covers repeat requests.

## Configuration

| Variable | Where | Default |
|---|---|---|
| `VITE_SYNCFUSION_LICENSE` | client/.env | (empty, shows trial banner) |
| `VITE_API_URL` | client/.env | `/api` (Vite proxies to :5000) |
| `PORT`, `JWT_SECRET`, `TOKEN_TTL`, `RECORD_COUNT` | server env | `5000`, demo secret, `1h`, `100000` |
