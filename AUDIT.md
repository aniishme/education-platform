# Initial audit

Retain React 19/Vite and the CommonJS Express API.

- Catalogue/admin CRUD partly use APIs; other pages use JSON/localStorage.
- Login hashes passwords but issues no credential; backend routes are public.
- Missing educator role, ownership, modules, editor and publishing workflow.
- Lesson controllers reference tables missing from the MySQL schema.
- Enrolment callers can impersonate users; progress is hardcoded.
- Dashboards show invented study activity; README describes mock authentication.
- No repeatable database setup or tests; ESLint misclassifies backend files.

Plan: Docker PostgreSQL, database cookie sessions, API role/ownership checks,
sections/lessons, persistent progress, role dashboards and integration tests.
