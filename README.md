# INVENZO - Asset Management System

INVENZO is a web-based asset management system built with HTML/CSS/JavaScript, Node.js, Express, and PostgreSQL.

## Current Features
- JWT-based authentication (`signup`, `login`)
- Role-based authorization (`admin`, `manager`, `viewer`)
- Asset CRUD APIs and dashboard views
- Basic analytics endpoint
- PostgreSQL migration runner

## Tech Stack
- Frontend: HTML, CSS, JavaScript, Bootstrap
- Backend: Node.js, Express
- Database: PostgreSQL (`pg`)
- Auth: JWT + bcrypt

## Setup
1. Install dependencies
```bash
npm install
```

2. Create env file from example (either location works)
```bash
cp .env.example .env
# or
cp server/.env.example server/.env
```

3. Update env values (`.env` or `server/.env`)
```env
PORT=3000
JWT_SECRET=change_me_super_secret
DB_TARGET=local
DATABASE_URL_LOCAL=postgres://postgres:postgres@localhost:5432/invenzo
# DATABASE_URL_REMOTE=postgres://user:pass@host:5432/invenzo_prod
```

4. Run migrations
```bash
npm run migrate
```

5. Start app
```bash
npm run dev
```

6. Open app
- `http://localhost:3000/login.html`

## NPM Scripts
- `npm run dev` - run with nodemon
- `npm start` - run server
- `npm run migrate` - apply SQL migrations
- `npm run lint` - run eslint
- `npm test` - run jest tests
- `npm run format` - run prettier

## API (Core)
- `POST /api/users/signup`
- `POST /api/users/login`
- `POST /api/users/forgot-password`
- `POST /api/users/reset-password`
- `GET /api/users` (auth + role)
- `POST /api/users` (admin)
- `PUT /api/users/:id` (admin/manager)
- `DELETE /api/users/:id` (admin)
- `GET /api/assets` (auth)
- `POST /api/assets` (admin)
- `PUT /api/assets/:id` (admin/manager)
- `DELETE /api/assets/:id` (admin)
- `GET /api/assets/analytics` (auth)
- `GET /api/assets/analytics/summary` (auth)
- `GET /api/assets/analytics/top-used` (auth)
- `GET /api/assets/analytics/monthly-checkouts` (auth)
- `POST /api/assets/:id/checkout` (admin/manager)
- `POST /api/assets/:id/return` (admin/manager)
- `GET /api/assets/:id/history` (auth)

## Migrations
- `server/migrations/001_init.sql`
- `server/migrations/002_seed_users.sql`

## Notes
- Legacy `sql/schema.sql` is deprecated; use `npm run migrate`.
- Env loading supports both root `.env` and `server/.env`.
- DB switching supports:
  - `DB_TARGET=local` -> `DATABASE_URL_LOCAL`
  - `DB_TARGET=remote` -> `DATABASE_URL_REMOTE`
- Fallback priority:
  1. `DATABASE_URL` (or selected `DATABASE_URL_LOCAL/REMOTE`)
  2. `PG*` or `DB*` variables
- For hosting, set `DB_TARGET=remote` and provide `DATABASE_URL_REMOTE`.
