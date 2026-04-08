# REST API routing structure (US-032)

Resource-based routes under `/api`:

| Prefix | Module | Notes |
|--------|--------|--------|
| `/api/auth` | Authentication | Register, login, logout, current user |
| `/api/users` | Users | Admin-only role updates |
| `/api/employees` | Employees | Manager+ list (extends for US-005/US-006) |
| `/api/payroll` | Payroll | Payroll runs (stub) |
| `/api/reports` | Reports | Summary reports (stub) |

- Unmatched paths return **404** with JSON: `{ "error": "Not found." }`.
- Health check: **GET** `/api/health` → `{ "status": "ok" }`.

## Persistence (US-034)

The backend uses **MongoDB** with **Mongoose** (ODM). Relational migration scripts in the backlog are satisfied with `database/migrations/` against MongoDB collections User, Employee, and AuditLog.
