# Verification

Verified on 5 October 2026 using Node 24 and Docker PostgreSQL 17.

- `npm.cmd run lint`: passes (frontend, backend and tests).
- `npm.cmd run build`: passes; Vite creates the production `dist/` bundle.
- `npm.cmd test`: five API/parser/seed tests pass against real PostgreSQL.
- `npm.cmd run test:e2e`: six Chromium journeys pass, checking both public
  registration roles, role dashboards, user management,
  course/module/lesson creation, publishing, enrolment, saved progress after
  refresh and logout/login, restricted routes, video/playlist authoring and
  safe embeds, course outcomes, category browsing, sorting, recommendations,
  rich role dashboards, and 390px mobile catalogue/dashboard/course/lesson pages.
- Workspace journeys also create all three roles through the admin UI, log in
  with the new accounts, check duplicate feedback and editing, and verify the
  course studio/editor, learner library filters and separate progress analytics
  on desktop and 390px mobile screens.
- Root and backend npm audits: zero reported vulnerabilities after compatible
  dependency updates and replacing nodemon with Node's built-in watcher.
- No TypeScript compilation step applies to this JavaScript project.

API assertions include password changes, duplicate email/enrolment prevention,
draft content restrictions, cross-educator ownership, learner impersonation
prevention, completion/incompletion, progress after lesson deletion, enrolment
cleanup, account deactivation and session revocation.

The expanded seed template contains 12 courses, 35 modules and 73 lessons. Seed tests
run the development seed twice and compare persisted courses, sections, lessons,
enrolments and completion records to prove repeatability. Recommendation tests
check that enrolled courses are excluded and enrolled categories take priority.
Dashboard tests check role-scoped completions and real weekly totals.
Admin creation tests verify password hashing, login with the assigned role,
duplicate email prevention, rejected unauthorised creation and preservation of
the administrator's session. Learner analytics tests verify module percentages,
completion history/activity and isolation from other users' records.

YouTube parser tests cover short/watch/Shorts links, start times, video-plus-playlist
links, playlist embeds and invalid/unsafe URLs. Browser tests intercept the remote
YouTube iframe request and assert its constructed URL; external playback and
creator embedding permissions are not tested. Browser screenshots in the
gitignored `test-results/` folder were also reviewed for layout issues.

Docker PostgreSQL was running and healthy during verification. Existing lesson
IDs, enrolments and saved progress were retained through the additive migration.

See README for environment setup, commands, demo credentials and scope limits.
