# Small Business Payroll Processing System

## Project Overview

A web application designed to give small businesses an affordable, simplified payroll processing solution. The system enables businesses to calculate employee wages, overtime, bonuses, reimbursements, and tax deductions — reducing errors, saving time, and eliminating dependence on expensive third-party payroll services.

## Course

**CIS 424 – Software Development With Agile Methodologies**

## Features

- Employee management (add, edit, deactivate employees)
- Wage and salary calculation (hourly and salaried)
- Overtime calculation
- Bonus and reimbursement tracking
- Tax deduction computation (federal, state, local)
- Payroll run history and reporting
- User authentication and role-based access

## Project Structure

```
├── frontend/               # Vite + React + Tailwind client (US-029)
├── backend/                # Express API (US-030, US-032–US-034)
├── database/migrations/   # MongoDB index sync + seed/rollback (US-031, Mongo path)
└── docs/requirements/     # API routing notes (US-032)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher; LTS recommended)
- npm
- MongoDB **Atlas** — connection string in `backend/.env` (see Team setup)

### Installation

1. Clone the repository and open the project root folder.

2. Backend — install dependencies and configure environment:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   Edit `backend/.env`: set `MONGO_URI`, `JWT_SECRET` (long random string), and optionally `CLIENT_ORIGIN` (comma-separated browser origins, e.g. `http://localhost:5173` for Vite and `http://localhost:3000` for static `serve`).

3. Frontend — install dependencies and (optional) API URL:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   ```
   In development you usually **do not** need `VITE_API_URL`: the Vite dev server proxies `/api` to the backend on port 5000. Set `VITE_API_URL` in `frontend/.env.local` only if the API lives on another host or port.

4. Run MongoDB migrations (index sync + optional seed employee):
   ```bash
   cd ../backend
   npm run migrate
   ```
   Rollback removes seeded documents: `npm run migrate:rollback`.

5. Start the backend:
   ```bash
   npm run dev
   ```
   Expect: `Server running on port …` and `Database connected successfully.`  
   **GET** `http://localhost:5000/api/health` should return `{ "status": "ok" }`.

6. Start the frontend (Vite dev server) in a **second** terminal — keep the backend running:
   ```bash
   cd ../frontend
   npm run dev
   ```
   Open the URL shown in the terminal (default **http://localhost:5173**). Registration and login need the backend on port **5000**; if you see a network error, confirm step 5 is running and `GET http://localhost:5000/api/health` returns `{"status":"ok"}`.

### Production-style frontend build

```bash
cd frontend
npm run build
npx serve -s dist
```

Ensure `CLIENT_ORIGIN` in `backend/.env` includes the origin you use to open the app (e.g. `http://localhost:3000`) so cookies and CORS work.

### Tests and coverage

```bash
cd backend && npm test
cd backend && npm run test:coverage

cd ../frontend && npm test
cd ../frontend && npm run test:coverage
```

### Troubleshooting (Windows)

**`node` is not recognized** when you run `npm run dev` (but `npm` works): Node is installed, but **`node.exe` is not on your PATH** in this terminal. `nodemon` needs `node` on PATH.

1. **Restart Cursor** (or reboot) so it picks up the PATH from the Node.js installer.
2. Or **refresh PATH in PowerShell** for this session:
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   ```
3. **Permanent fix:** Windows → *Environment Variables* → edit **User** or **System** `Path` → add `C:\Program Files\nodejs` → OK, then open a **new** terminal.

**Database connection errors (Atlas):** Confirm **`MONGO_URI`** in `backend/.env` matches Atlas (**Connect** → SRV string) and that **Network Access** allows your IP (or `0.0.0.0/0` for shared dev, if your team allows). Auth failures often mean wrong user/password in the URI or IP not whitelisted.

**`ECONNREFUSED 127.0.0.1:27017`:** Your `MONGO_URI` points at **local** MongoDB, but nothing is running on that machine. This project expects **Atlas** — use a `mongodb+srv://…` URI instead, or install and run MongoDB locally only if you intentionally use `mongodb://127.0.0.1:27017/...`.

See `backend/.env.example` for variable names.

### Team setup (MongoDB Atlas + `.env`)

- **Do not commit** `backend/.env` or `frontend/.env.local` — they are gitignored. Each developer copies from **`.env.example`** and fills in real values locally.
- **Network Access (IP whitelist):** A project **Owner/Admin** in Atlas must add IPs under **Project → Network Access → Add IP Address**. Options: (1) each teammate adds **their current IP** when it changes, (2) use **Allow access from anywhere** (`0.0.0.0/0`) only for **shared class/dev** clusters (weaker security; rotate credentials and restrict in production).
- **`MONGO_URI`:** Use the Atlas **Connect** string (SRV) with the team’s DB user and `payroll_db` (or your agreed database name). Share **connection details through a private channel** (password manager, class LMS, encrypted doc) — **never** put real passwords in Git, Slack screenshots, or public README.
- **`JWT_SECRET`:** Any long random string per machine is fine for local testing; the team can optionally share one **dev-only** secret out-of-band if you need consistent tokens across machines (still not committed to the repo).
- **`CLIENT_ORIGIN`:** Keep `http://localhost:5173` and `http://localhost:3000` in the list so Vite and `serve` both work.

## Team

| Name | Role |
|------|------|
|      |      |
|      |      |
|      |      |

## Agile Process

This project follows Scrum methodology:

- **Sprint Length:** 2 weeks
- **Sprint artifacts** are stored in `docs/sprints/`
- **Meeting notes** are stored in `docs/meeting-notes/`

## License

This project is developed for academic purposes as part of CIS 424.
