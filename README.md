# Arndale Academy

A primary school portal with student, parent and teacher views. The interface
extends the existing Littleleaf Garden design: a soft pink, blue and mint
background, clear cards, and friendly, readable controls.

Start with the browser demo to try homework workflows using `localStorage`.
The original Agent-Native application remains available with its authenticated
backend and shared database; its setup is documented separately below.

## Browser demo with local storage

The browser demo has a branded welcome page and a view chooser. It does not
create accounts, log users in, or run the application backend. The student,
parent and teacher choices open demo views rather than grant account permissions.

### Start locally

Use Node.js 22.22 or newer and the pnpm version declared in `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:local
```

Open the URL printed by Vite.

| Route              | Browser demo screen                                                                  |
| ------------------ | ------------------------------------------------------------------------------------ |
| `/` and `/sign-in` | Branded welcome page and student, parent or teacher view chooser; no credential form |
| `/student`         | Student learning plan, task details, homework completion and progress                |
| `/parent`          | Parent homework overview, filters and completion progress                            |
| `/teacher`         | Class assignments with creation and removal controls                                 |

The shell's **Demo home** link returns to the welcome page. The `/sign-in`
address is also a demo welcome page in this mode; there is no login or account
creation flow.

### What is saved

The demo starts with four sample assignments. Assignment creation, changes,
deletion and completion are saved in this browser's `localStorage`. Add a task
in the teacher view, open it in the student view, explicitly mark it complete,
and check the parent view. Opening a task does not complete it.

Refreshing or reopening the same site in the same browser profile keeps the
saved homework. Samples are seeded only when the storage key is absent.
Deleting every assignment preserves the empty list across reloads; it does not
restore the samples. Other open tabs update when this site's saved data changes.

The versioned storage key is `arndale-academy.assignments.v1`. If browser storage
is blocked, full or unreadable, the portal displays a storage error and does not
claim that a failed change was saved. Invalid saved data is preserved for
recovery rather than overwritten with defaults.

Data belongs to one browser profile and site origin. It is not synchronized
with a teacher, parent or pupil on another device. A preview address and a
custom domain have separate stores. Clearing the site's browser data erases
the saved homework; private browsing may remove it when that session ends.
See the [browser localStorage documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

### Sample information and demo boundaries

Homework counts and subject progress are calculated from the saved assignment
records. Loading failures, empty lists and fully completed lists have separate
states. The learner name, class profile, timetable and school notices are
labelled as sample information. Attendance and assessment results are not
recorded in this data model and are not presented as invented statistics.

The demo represents one classroom assignment list. It has no authenticated
school roles, separate pupil submissions, verified parent–child relationships,
or cross-device sync. Contact and help controls do not send messages or claim
that a teacher received one.

### Build and check

```bash
pnpm test:local
pnpm typecheck:local
pnpm build:local
pnpm preview:local
```

`build:local` writes the static site to `dist-local/`. The local scripts use a
separate browser entry and an assignment adapter; they do not start the
Agent-Native server or run database migrations. The browser demo requires no
`DATABASE_URL`, `NETLIFY_DATABASE_URL` or `BETTER_AUTH_SECRET`.

A browser smoke check should cover the welcome chooser, opening each view
directly, teacher creation, student completion, parent progress, deletion and
reload persistence. Also check an empty saved list, visible storage errors and
narrow-screen navigation.

## Deploy the browser demo to Cloudflare Workers

In the existing Worker's **Settings → Builds**, select a branch containing
these changes, use the repository root, and set both commands:

| Setting        | Value                                               |
| -------------- | --------------------------------------------------- |
| Build command  | `pnpm build:local`                                  |
| Deploy command | `npx wrangler deploy --config wrangler.local.jsonc` |

The branch must contain the browser entry, local scripts and
`wrangler.local.jsonc`. The explicit configuration selects the static demo.
No database or authentication environment variables are needed for this build
or deployment.

`wrangler.local.jsonc` targets the Worker named `arndale-acedemy` and serves
`dist-local/` as static assets. Its single-page-application fallback supports
opening and refreshing `/sign-in`, `/student`, `/parent` and `/teacher`
directly. Change the Worker name only when targeting a different Worker.

For a manual deployment after authenticating Wrangler:

```bash
pnpm build:local
npx wrangler deploy --config wrangler.local.jsonc
```

Cloudflare reference: [static single-page applications](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/).

## Original application with an authenticated backend

The original `dev`, `build` and `start` scripts still use Agent-Native, its
server actions and its authentication system. They are separate from the
browser demo's `*:local` scripts. The static deployment does not disable or
modify the original backend's authentication.

### Backend setup

Use the Node.js and pnpm versions described above, then:

```bash
cp .env.example .env
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

Local backend development uses PGlite. A production backend requires a
persistent PostgreSQL `DATABASE_URL`, `BETTER_AUTH_SECRET`, and the framework's
normal authentication and hosting configuration. Follow `.env.example`,
`DEVELOPING.md` and `drizzle/START_HERE.md` for setup and migrations.
`.env.example` documents `AUTH_DISABLED` for local backend development only;
that option is not used to implement the browser demo.

Moving to the backend does not automatically import browser demo records into
PostgreSQL.

### Authenticated screens and sign-in

| Route              | Backend application screen                                                                |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `/sign-in`         | Branded email/password sign-in and account creation, with student and parent destinations |
| `/` and `/student` | Student learning plan, task details, homework completion and progress                     |
| `/parent`          | Parent homework overview, task filters, subject completion and school support             |
| `/teacher`         | Existing class assignment creation and removal                                            |

The sign-in form uses Agent-Native's existing authentication endpoints.
Creating an account is followed by an actual login before redirecting the
visitor. Original sign-in continuations are preserved, and authenticated app
screens include sign-out.

Homework is read from the existing `assignments` table. Completion counts and
subject progress are calculated from those stored records. Opening a task does
not complete it: the pupil must explicitly choose to mark it done. The sample
profile, timetable and school notice boundaries described above also apply to
these screens.

**Current data boundary:** the backend currently models one shared classroom
assignment list. It does not yet model school roles, individual pupil
submissions or verified parent–child relationships. The dashboard selector
changes the view, not account permissions. Before using real pupil records,
implement server-side school membership, role permissions, guardian links and
individual completion records. New registrations establish a framework
account only; they do not grant a verified school role.

### Backend verification

```bash
pnpm test -- tests/use-navigation-state.spec.ts tests/portal-render.spec.tsx server/lib/portal-login.spec.ts app/components/school
pnpm typecheck
pnpm agent-native:doctor
```

Browser smoke should cover student and parent login, account creation followed
by a session, original destination restoration, opening and completing a task,
parent filters, narrow-screen navigation and sign-out.

## Project layout

- `local/`: browser demo entry, welcome chooser, assignment store, adapter and persistence tests
- `vite.local.config.ts`: static build and browser dependency boundary
- `wrangler.local.jsonc`: Cloudflare static asset and SPA routing configuration
- `app/components/school/`: shared portal shell, student screen and parent screen
- `app/styles/school-portal.css`: shared background, branding, navigation and responsive shell
- `app/components/portal.tsx`: retained teacher assignment workflow
- `app/lib/school.ts`: shared assignment type and explicitly labelled sample profile
- `app/lib/assignment-hooks.ts`: original server hooks; the static build selects the browser adapter
- `app/`: shared UI and original application routes and entry points
- `actions/`: classroom operations shared by the backend UI and app agent
- `server/lib/portal-login.ts`: branded login document using framework authentication
- `server/`: original server plugins and database client
- `drizzle/`: database schema and migrations

See `DEVELOPING.md` for framework conventions and
`docs/superpowers/specs/2026-10-17-primary-school-portals.md` for the scope of the
primary school UI. Framework reference: [Agent-Native documentation](https://agent-native.com/docs).
