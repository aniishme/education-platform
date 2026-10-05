# Verification

Verified on 5 October 2026 using Node 24 and Docker PostgreSQL 17.

- `npm.cmd run lint`: passes (frontend, backend and tests).
- `npm.cmd run build`: passes; Vite creates the production `dist/` bundle.
- `npm.cmd test`: three API integration suites pass against real PostgreSQL.
- `npm.cmd run test:e2e`: three Chromium journeys pass, checking both public
  registration roles, role dashboards, user management,
  course/module/lesson creation, publishing, enrolment, saved progress after
  refresh and logout/login, restricted routes, and a 390px mobile learning page.
- Root and backend npm audits: zero reported vulnerabilities after compatible
  dependency updates and replacing nodemon with Node's built-in watcher.
- No TypeScript compilation step applies to this JavaScript project.

API assertions include password changes, duplicate email/enrolment prevention,
draft content restrictions, cross-educator ownership, learner impersonation
prevention, completion/incompletion, progress after lesson deletion, enrolment
cleanup, account deactivation and session revocation.

See README for environment setup, commands, demo credentials and scope limits.
