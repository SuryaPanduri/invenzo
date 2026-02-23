# INVENZO Implementation Roadmap

## Scope and Goal
This roadmap turns the current prototype into a production-ready asset management system in 3 sprints.

Assumption for this plan: standardize on **PostgreSQL** (current backend already uses `pg`).

## Sprint 1 (P0 Stabilization)
Duration: 1 week

### Outcomes
- Single consistent DB stack (PostgreSQL)
- Working and consistent RBAC (`admin`, `manager`, `viewer`)
- Secure and reliable auth/user/asset baseline
- Project quality baseline (lint + tests)

### Backend Tasks
1. Database standardization
- Replace MySQL schema with PostgreSQL migration files under `server/migrations/`.
- Introduce migration runner script (`npm run migrate`).
- Update `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `PORT`.

2. Role normalization
- Enforce lowercase roles at DB level using `CHECK (role IN ('admin','manager','viewer'))`.
- Normalize role in signup/admin user creation (`role?.toLowerCase()`).

3. Validation and error handling
- Add request validation middleware for:
  - `POST /api/users/signup`
  - `POST /api/users/login`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `POST /api/assets`
  - `PUT /api/assets/:id`
- Add centralized error handler and consistent error payload:
  - `{ message: string, code?: string, details?: any }`

4. Security hardening
- Ensure no plaintext passwords in seeds.
- Reject weak passwords on signup/add-user.
- Add basic rate-limit middleware on login.

### Frontend Tasks
1. Fix malformed/fragile pages
- `public/users.html`: add proper `<title>` and remove broken closing tags.
- `public/assets.html`: remove stray closing `</script>`.

2. Role handling consistency
- Always store/use lowercase roles in localStorage and UI checks.
- Ensure dashboard role sections map correctly.

3. Auth UX cleanup
- Standardize logout behavior across pages.
- Handle token expiry by redirecting to login with a clear message.

### Testing Tasks
- Add ESLint and Prettier.
- Add API test suite (Jest + Supertest) for:
  - signup/login
  - RBAC enforcement on users/assets routes
  - asset CRUD happy path + invalid payloads

### Sprint 1 Deliverables
- `server/migrations/001_init.sql`
- `server/migrations/002_seed_users.sql` (bcrypt hashes only)
- `server/middleware/validate.js`
- `server/middleware/errorHandler.js`
- `tests/api/*.test.js`
- Updated README setup steps

---

## Sprint 2 (Core Product Features)
Duration: 1-2 weeks

### Outcomes
- Complete check-in/check-out lifecycle
- Real analytics powered by DB
- Asset history and audit visibility

### Data Model Additions (PostgreSQL)
1. `asset_checkouts`
- `id SERIAL PRIMARY KEY`
- `asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE`
- `checked_out_to_user_id INT NOT NULL REFERENCES users(id)`
- `checked_out_by_user_id INT NOT NULL REFERENCES users(id)`
- `checkout_date TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `due_date TIMESTAMPTZ`
- `returned_at TIMESTAMPTZ`
- `returned_by_user_id INT REFERENCES users(id)`
- `notes TEXT`

2. `asset_audit_logs`
- `id SERIAL PRIMARY KEY`
- `asset_id INT REFERENCES assets(id) ON DELETE SET NULL`
- `actor_user_id INT REFERENCES users(id) ON DELETE SET NULL`
- `action VARCHAR(32) NOT NULL` (`created`, `updated`, `deleted`, `checked_out`, `returned`)
- `metadata JSONB`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### API Endpoints
1. Checkout APIs
- `POST /api/assets/:id/checkout`
  - body: `{ checkedOutToUserId, dueDate?, notes? }`
- `POST /api/assets/:id/return`
  - body: `{ notes? }`
- `GET /api/assets/:id/history`
  - returns checkout history + audit events

2. Analytics APIs
- `GET /api/assets/analytics/summary`
  - returns `{ total, available, checkedOut, overdue }`
- `GET /api/assets/analytics/top-used?limit=10`
- `GET /api/assets/analytics/monthly-checkouts?months=6`

### Frontend Tasks
- Add checkout/return actions in `assets.html` table and asset detail modal.
- Add “Current Assignee”, “Due Date”, and “Overdue” columns.
- Replace chart fallback dummy data with real analytics endpoints.
- Add asset history timeline panel.

### Sprint 2 Deliverables
- `server/routes/checkouts.js` (or nested handlers in assets route)
- `server/controllers/checkoutController.js`
- `server/controllers/analyticsController.js` real SQL queries
- `public/js/assetManage.js` checkout/return flows
- `public/js/dashboard.js` real analytics wiring

---

## Sprint 3 (Scale + Usability)
Duration: 1 week

### Outcomes
- Faster asset operations at scale
- Better admin workflows
- Basic operational readiness

### Feature Tasks
1. List scalability
- Server-side pagination/sort/filter for assets and users:
  - `GET /api/assets?page=1&pageSize=20&status=available&search=laptop&sort=-created_at`

2. Bulk operations
- CSV import for assets
- CSV export for filtered asset list

3. Notifications and reminders
- Flag upcoming due/overdue assets in dashboard
- Optional email reminder hook (future integration point)

4. QR/Barcode readiness
- Store `asset_tag`/`qr_code` fields
- Add quick-search by scan value

### Engineering Tasks
- Add structured logging (request id + user id).
- Add health/readiness split endpoints:
  - `/health/live`
  - `/health/ready`
- Add Dockerfile + docker-compose for local DB bootstrapping.

### Sprint 3 Deliverables
- pagination/filter APIs live
- CSV import/export endpoints + UI
- improved deployment/setup docs

---

## Ordered Execution Checklist
1. Convert schema/docs to PostgreSQL and add migrations.
2. Normalize and enforce roles everywhere.
3. Add validation, error middleware, and auth hardening.
4. Add lint/test framework and baseline API tests.
5. Implement checkout/return APIs + DB tables.
6. Replace analytics placeholders with query-backed endpoints.
7. Add asset history/audit log.
8. Add pagination/filter/sort and CSV import/export.

## Proposed API Contract Conventions
- Success: `{ data: ..., message?: string }`
- Error: `{ message: string, code: string, details?: any }`
- Pagination:
  - `data: []`
  - `meta: { page, pageSize, total, totalPages }`

## Risks and Mitigations
1. Current schema drift may break existing local DBs.
- Mitigation: provide one-time migration + reset script and clear README migration notes.

2. Role mismatch can silently break authorization.
- Mitigation: DB role constraint + normalization at input + tests for every protected route.

3. Analytics query performance with growth.
- Mitigation: add indexes on `asset_checkouts(asset_id, checkout_date, returned_at)` and `assets(status, created_at)`.

## Definition of Done (Per Sprint)
- All new endpoints documented in README.
- Happy path + authorization + validation tests passing.
- No dummy analytics data in production UI.
- Manual smoke flow verified: login -> asset create -> checkout -> return -> analytics updated.
