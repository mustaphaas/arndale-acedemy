# Arndale Academy

A primary school web portal with a welcoming sign-in page, a pupil learning dashboard, and a parent overview. The interface extends the existing Littleleaf Garden design: a soft pink, blue, and mint background, clear cards, and friendly, readable controls.

## Screens

| Route              | Purpose                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `/sign-in`         | Branded email/password sign-in and account creation, with student and parent destinations |
| `/` and `/student` | Student learning plan, task details, homework completion, and progress                    |
| `/parent`          | Parent homework overview, task filters, subject completion, and school support            |
| `/teacher`         | Existing class assignment creation and removal                                            |

The sign-in form uses Agent-Native's existing authentication endpoints. Creating an account is followed by an actual login before the visitor is redirected. Original sign-in continuations are preserved. All app screens include sign-out.

## What is live and what is sample information

Homework is read from the existing `assignments` table. Completion counts and subject progress are calculated from those stored records. Opening a task does not complete it: a pupil must explicitly choose to mark it done. Loading failures, empty lists, and a fully completed list have separate states.

The learner name, class profile, timetable, and school notices are labelled as sample information. Attendance and assessment results are not recorded in this data model and are not presented as invented statistics. Contact/help controls do not send messages or claim that a teacher received one.

**Current data boundary:** this repository currently models one shared classroom assignment list. It does not yet model school roles, individual pupil submissions, or verified parent–child relationships. The dashboard selector changes the view, not account permissions. Do not load real pupil records until server-side school membership, role permissions, guardian links, and individual completion records are implemented. New registrations establish a framework account only; they do not grant a verified school role.

## Develop locally

Requires Node.js 22.22 or later and the package manager declared in `package.json`.

```bash
cp .env.example .env
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

Local development uses PGlite. Production requires a persistent PostgreSQL `DATABASE_URL` and the framework's normal authentication/deployment configuration. `.env.example` documents `AUTH_DISABLED` for local development only; it is not part of the portal implementation.

## Verification

```bash
pnpm test -- tests/use-navigation-state.spec.ts tests/portal-render.spec.tsx server/lib/portal-login.spec.ts app/components/school
pnpm typecheck
pnpm agent-native:doctor
```

Browser smoke should cover student/parent login, account creation followed by a session, original destination restoration, opening and completing a task, the parent filters, narrow-screen navigation, and sign-out.

## Project layout

- `app/components/school/`: persistent portal shell, student screen, and parent screen
- `app/styles/school-portal.css`: the common background, branding, navigation, and responsive shell
- `app/components/portal.tsx`: the retained teacher assignment workflow
- `app/lib/school.ts`: common assignment type and explicitly labelled sample profile
- `server/lib/portal-login.ts`: self-contained branded login document using framework auth
- `actions/`: the existing classroom operations shared by the UI and app agent
- `drizzle/`: database schema and migrations

See `DEVELOPING.md` for the framework conventions and `docs/superpowers/specs/2026-10-17-primary-school-portals.md` for the scope of this UI update.
