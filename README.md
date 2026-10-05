# StudyFlow — Mini Udemy LMS

A final-year university MVP for discovering, authoring and completing self-paced courses. The existing React/Vite frontend and Express backend are retained, with PostgreSQL running in Docker.

## Features and roles

- **ADMIN:** platform statistics; list/filter/edit users; activate/deactivate accounts; manage courses and visibility; inspect enrolled learners and progress.
- **EDUCATOR:** dashboard; create/edit/delete own courses; ordered modules and lessons; text, optional video URL and thumbnail URL; publish/unpublish; view learners and real completion statistics.
- **LEARNER:** register/login; search/filter published courses; enrol once; view enrolments; resume the last accessed lesson; mark lessons complete/incomplete; persistent course and overall progress.
- All roles can edit their profile and change their password. Theme and accessibility preferences stay on the device.
- Loading, empty and error states; role navigation; responsive layouts; API validation and permission checks.
- An expanded marketplace with category covers, course subtitles, learning outcomes, prerequisites, lesson/module counts, real enrolment counts, category browsing and sorting.
- Embedded YouTube videos and playlists at course, module and lesson level. Educators paste links; no video storage, streaming service or API key is required.
- Recommendations match enrolled categories, then rank by actual enrolments. Already-enrolled courses and unpublished courses are excluded.
- Dashboards include seven-day completion activity, recent completions/enrolments, topic breakdowns, resume cards and educator/admin course performance. New accounts have honest empty states; demo accounts have stored demonstration activity.

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
shared/youtube.mjs       Shared YouTube URL validation and safe embed construction
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

The catalogue contains **12 courses, 35 modules and 73 lessons**, with original explanations, worked examples, practice labs, capstones, outcomes and prerequisites. Subjects include HTML/CSS, JavaScript, React, Node/Express, Python, SQL, Git, Linux, data analysis, algorithms, computer science and UI/UX. Companion videos are credited to their original creators; see [resource credits](COURSE_RESOURCES.md).

Additional demo educators: `priya@example.com`, `jordan@example.com`. Additional demo learners: `maya@example.com`, `oliver@example.com`, `aisha@example.com`, `lucas@example.com`, `emma@example.com`. All use the same development password above. Sam has six enrolments, including a completed Git course; other learners provide varied course progress for educator/admin demonstrations. These are real database fixtures, not hardcoded UI percentages. Existing progress is preserved when upgrading; individual totals can differ after normal use. Public registration permits LEARNER or EDUCATOR; administrators are seeded or managed by another admin.

## Major user flows

1. **Admin:** login → dashboard statistics → Manage Users → filter role → edit or activate/deactivate → Manage Courses → edit/change visibility → inspect learners.
2. **Educator:** register as Educator or demo login → My Courses → Create course → save draft → add module → add lessons → edit → select PUBLISHED → Save course → Learners & progress.
3. **Learner:** register/login → Courses → search/filter → View course → Enrol for free → select lesson → Mark lesson complete → My Learning/Progress → logout/login → resume persisted progress.

Course/module/lesson edits save separately. Order starts at zero; ties sort by ID. Publishing requires at least one lesson. Thumbnails use HTTP(S) URLs, with category covers as a fallback. Lesson study time is an educator estimate for reading/practice, not measured video runtime or watched minutes.

### Add a YouTube video or playlist

1. Create/edit a course and paste a video or playlist into **Video URL** for its preview/default resource.
2. Optionally add a module-specific resource using **New module video or playlist URL**, or the existing module's **Video URL**.
3. Add a lesson with notes, description, order and estimated study time. Its **Video URL** overrides the module/course resource; leaving it blank uses the module resource, then the course resource.
4. Open **Preview video resource** in the editor, save the relevant form, and publish when your curriculum is ready.

Supported examples: `https://www.youtube.com/watch?v=rfscVS0vtbw`, `https://youtu.be/rfscVS0vtbw?t=90`, and `https://www.youtube.com/playlist?list=PLAYLIST_ID`. Shorts/live URLs and video links with a playlist are also accepted. Playlists use YouTube's player menu to switch videos. **Playlist URLs do not automatically create LMS lessons**; add lessons explicitly so each has its own notes and completion record. No videos are downloaded or uploaded to this application. Other valid HTTP(S) video URLs remain external links.

The player uses the privacy-enhanced `youtube-nocookie.com` embed host. Availability, ads, chapter navigation and embedding permission are controlled by YouTube and the original creator; an **Open on YouTube** link is always provided. Completing a lesson is a deliberate learner action, not an automatic result of playing a video. Seed courses share a companion full-course video across relevant lessons; use its chapter list to find a topic.

### Upgrade an existing PostgreSQL installation

Run `npm.cmd run migrate --prefix Backend`, then `npm.cmd run seed --prefix Backend`. Additive columns store subtitle, outcomes, prerequisites, course/module video URLs, demo catalogue keys and lesson study time. Original generic seed content is enriched while retaining its lesson IDs and saved progress. Subsequent seeds leave existing marked course content, module/lesson edits, passwords and completion records alone. New fixture enrolments create demonstration activity once. Never delete the Docker volume to apply this upgrade.

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
| `GET /api/dashboard/details` | Role-scoped activity, categories and recent registrations/enrolments |
| `GET /api/courses/recommended` | Published recommendations, excluding the current user's enrolments |
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

No payments, streaming infrastructure, certificates, email delivery, password reset or local file uploads. YouTube playback depends on external availability. Playlist-to-lesson import and automatic video watch tracking are outside scope. Guided demo curricula are original introductory material, not accredited instruction; companion videos may use older tool versions. Contact is a demonstration form and does not deliver messages. Notification preferences are local settings; deadline/email delivery is not implemented. The schema setup does not import historical MySQL data. Categories are simple text fields.
