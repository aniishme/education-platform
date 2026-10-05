# StudyFlow — Mini Udemy LMS

A final-year university MVP for discovering, authoring and completing self-paced courses. The existing React/Vite frontend and Express backend are retained, with PostgreSQL running in Docker.

## Features and roles

- **ADMIN:** platform statistics; list/filter/edit users; activate/deactivate accounts; manage courses and visibility; inspect enrolled learners and progress.
- **EDUCATOR:** dashboard; create/edit/delete own courses; ordered modules and lessons; text, optional video URL and thumbnail URL; publish/unpublish; view learners and real completion statistics.
- **LEARNER:** register/login; search/filter published courses; enrol once; view enrolments; resume the last accessed lesson; mark lessons complete/incomplete; persistent course and overall progress.
- All roles can edit their profile and change their password. Theme and accessibility preferences stay on the device.
- Loading, empty and error states; role navigation; responsive layouts; API validation and permission checks.

## Technology stack

React 19, React Router 7, Vite 8, plain CSS; Node.js, Express 5, `pg`, bcrypt; PostgreSQL 17 in Docker. ESLint, Node's test runner and Playwright handle verification. The project uses JavaScript; there is no TypeScript check.

## Current system architecture

```text
React browser UI (localhost:5173)
  → relative /api requests through Vite's development proxy
  → Express API (localhost:5000)
  → parameterised pg queries
  → Docker PostgreSQL (localhost:5433 → container:5432)
```

Login/registration creates an opaque random cookie session (`HttpOnly`, `SameSite=Lax`, seven-day expiry; `Secure` in production). Only the token's SHA-256 hash is stored in PostgreSQL. The frontend checks `/api/auth/me` on refresh and holds display information in memory, with no authentication data in localStorage. Logout deletes the session; deactivation revokes all sessions. Password changes revoke previous sessions and issue a replacement. The API checks current database roles and course ownership independently of route guards. Mutation requests with an unexpected browser Origin are rejected.

Relationships: User → owned Courses → Sections → Lessons; User ↔ Course through unique Enrolments; User ↔ Lesson through unique LessonProgress. Deletion cascades remove related records; a deleted last lesson clears the resume pointer. Progress is `round(completed lessons / current total lessons × 100)`; zero lessons means 0%. Overall learner progress uses totals across enrolled courses. Leaving a course removes its completion records. Unpublished courses remain listed in existing enrolments but content is unavailable until republished.

## Structure

```text
src/pages/               Public pages, dashboards, course editor and learning UI
src/admin/               User management and admin entry points
src/components/          Navigation, forms, settings and shared states
src/services/api.js      Credentialled JSON API client
src/utils/               Session state, settings and data loading
Backend/app.js           Express middleware, routes and errors
Backend/server.js        HTTP entry point
Backend/security.js      Sessions, role guards and validation
Backend/courseAccess.js  Ownership and content access
Backend/routes/          Auth, courses, learning and admin APIs
Backend/database/        PostgreSQL schema, migration and demo seed
Backend/test/            Real database HTTP integration tests
tests/                   Playwright browser journeys
compose.yaml             PostgreSQL service and persistent volume
AUDIT.md                 Initial findings
```

`Backend/database/studyflow.sql` is the original **MySQL/MariaDB archive**, retained for reference only. Do not run it against PostgreSQL. The new migration creates a fresh database; historical MySQL records are not automatically imported.

## Setup

Requirements: Node.js **22.12+** (Node 24 recommended), npm, Docker Desktop with its Linux engine running.

From the project root in PowerShell:

```powershell
npm.cmd ci
npm.cmd ci --prefix Backend
Copy-Item .env.example .env
Copy-Item Backend/.env.example Backend/.env
docker compose up -d db
npm.cmd run migrate --prefix Backend
npm.cmd run seed --prefix Backend
```

Use `npm` instead of `npm.cmd` on macOS/Linux, and your shell's copy command for environment files. Only copy examples on initial setup; preserve existing configuration. Wait for PostgreSQL to be healthy (`docker compose ps`) before migrating. The seed is repeatable and does not reset existing passwords or course edits.

Start two terminals:

```powershell
# API with Node's built-in file watcher
npm.cmd run dev --prefix Backend
```

```powershell
# Frontend
npm.cmd run dev
```

Open **http://localhost:5173**. `npm.cmd start --prefix Backend` starts the API without watching. `/api/health` checks its database connection.

### Environment variables

| File | Variable | Purpose |
|---|---|---|
| `.env` | `POSTGRES_PASSWORD` | Docker development database password |
| `Backend/.env` | `DATABASE_URL` | PostgreSQL URL; password must match Docker configuration |
| `Backend/.env` | `PORT` | API port, default 5000; update Vite's proxy if changing it |
| `Backend/.env` | `FRONTEND_ORIGIN` | Allowed browser origin, default `http://localhost:5173` |
| `Backend/.env` | `NODE_ENV` | `development` locally; `production` enables Secure cookies and requires HTTPS |

Example passwords are development-only; environment files are gitignored. PostgreSQL binds to loopback on **5433** to avoid common local conflicts. Data persists in a Docker named volume. Changing `POSTGRES_PASSWORD` after first startup does not change an existing database volume's password.

### Demo accounts

All accounts use **`DemoPass123!`** (development only):

| Role | Email |
|---|---|
| ADMIN | `admin@example.com` |
| EDUCATOR | `educator@example.com` |
| LEARNER | `learner@example.com` |

The seed adds Web Development Fundamentals (HTML/CSS), Database Management and Python Programming, with modules and text lessons. The learner has one completed lesson in each enrolled course. Public registration permits LEARNER or EDUCATOR; administrators are seeded or managed by another admin.

## Major user flows

1. **Admin:** login → dashboard statistics → Manage Users → filter role → edit or activate/deactivate → Manage Courses → edit/change visibility → inspect learners.
2. **Educator:** register as Educator or demo login → My Courses → Create course → save draft → add module → add lessons → edit → select PUBLISHED → Save course → Learners & progress.
3. **Learner:** register/login → Courses → search/filter → View course → Enrol for free → select lesson → Mark lesson complete → My Learning/Progress → logout/login → resume persisted progress.

Course/module/lesson edits save separately. Order starts at zero; ties sort by ID. Publishing requires at least one lesson. Thumbnails/videos use HTTP(S) URLs; videos open externally without streaming infrastructure.

## API outline

| Endpoints | Access |
|---|---|
| `POST /api/auth/signup`, `/login`, `/logout`; `GET /api/auth/me` | Registration/login/logout/session validation |
| `PUT /api/auth/profile`, `/password` | Authenticated account |
| `GET /api/courses`, `/courses/:id` | Published catalogue; owner/admin can view drafts |
| `POST /api/courses`; `PUT/DELETE /api/courses/:id` | Admin or owning educator |
| `POST /api/courses/:id/sections`; `PUT/DELETE /api/courses/sections/:id` | Admin or owning educator |
| `POST /api/courses/sections/:id/lessons`; `PUT/DELETE /api/courses/lessons/:id` | Admin or owning educator |
| `GET /api/courses/:id/learners` | Admin or owning educator |
| `GET/POST /api/enrolments`; `DELETE /api/enrolments/:id` | Scoped lists; learner enrolment; own removal or admin |
| `GET /api/lessons/:id`, `/api/courses/:id/progress` | Enrolled learner or owner/admin |
| `PUT /api/lessons/:id/progress` | Enrolled learner; `{completed: true/false}` |
| `GET /api/dashboard` | Role-specific statistics |
| `GET /api/users`; `PUT /api/users/:id`, `/users/:id/status` | Admin |
| `GET /api/activity`, `/learner-growth` | Admin |

## Verification

With PostgreSQL running and migrated:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd test
npm.cmd exec playwright -- install chromium
npm.cmd run test:e2e
```

API tests start an ephemeral HTTP server, create uniquely named accounts/courses and clean up. They cover validation, authentication, RBAC, ownership, enrolment uniqueness, saved progress, deletion cascades and deactivation. Use a development database. Browser tests register both public roles, use demo accounts, create/delete a temporary course and verify management, authoring/publishing, learning persistence, forbidden routes and mobile layout. Test accounts are cleaned up. Stop manually running API/Vite servers before browser tests; the runner starts both. Demo passwords must remain unchanged for browser tests. Failed runs retain traces in gitignored `test-results/`.

For a production-build preview, run `npm.cmd run preview` alongside the API and set `FRONTEND_ORIGIN=http://localhost:4173` in `Backend/.env`, then restart the backend. Deployment is outside this local MVP: a host would serve `dist/` and proxy `/api` to Express under the same HTTPS origin.

## Limitations

No payments, streaming, certificates, email delivery, password reset or uploads. Thumbnail/video resources use external URLs. Demo lessons are introductory and can be expanded for assessment. Contact is a demonstration form and does not deliver messages. Notification preferences are local settings; deadline/email delivery is not implemented. The schema setup is repeatable for fresh PostgreSQL databases, not an import of historical MySQL data. Categories are simple text fields.
