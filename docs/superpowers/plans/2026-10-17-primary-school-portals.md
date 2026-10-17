# Primary School Portals Implementation Plan

> For agentic workers: implement the bounded work in this session, using parallel agents for isolated screen modules and one final independent review.

**Goal:** Deliver a coherent primary school login, student dashboard, and parent dashboard using the existing pastel background.

**Architecture:** Retain Agent-Native authentication and shared assignment actions. Mount a shared portal shell in the existing root layout. Keep the teacher screen; move student and parent content into focused modules.

**Tech stack:** React 19, React Router 8, Agent-Native 0.209.2, Tailwind/CSS, Tabler icons, Vitest.

**Spec:** docs/superpowers/specs/2026-10-17-primary-school-portals.md

## Global constraints

- Keep /, /parent, and /teacher valid; add /student as a student alias.
- Authentication uses createAuthPlugin, framework login/register endpoints, and signInJourneyInlineScript.
- Preserve existing background, action names, and dependency versions.
- Use the local UI adapters for controls and overlays; no alert/confirm/prompt.
- Sample profile/timetable/notice data must be labelled. No invented live school statistics.
- No new role grants or claims of parent-child record isolation.

## Review focus

- Registration succeeds without a session: chain login before redirect.
- A visitor arrives through /parent continuation: resume the correct dashboard.
- Assignment data is empty or unavailable: avoid fake completion and distinguish load failures.
- A pupil opens a task: opening must not mark it completed.
- Narrow screens and keyboard use: no clipped controls, clear focus, reachable navigation and logout.

## Tasks

1. Shared shell and routing (root): create app/components/school/portal-shell.tsx and app/styles/school-portal.css; integrate in Layout.tsx; export shared assignment types from app/lib/school.ts; update route/navigation mappings and branding. Test route behavior.
2. Student screen (agent): create app/components/school/student-dashboard.tsx and student-dashboard.css. Consume the existing assignment query/mutation and shared Assignment type. Export StudentDashboard with no shell wrapper. Use local dialog adapter. Task opening is separate from explicit completion.
3. Parent screen (agent): create app/components/school/parent-dashboard.tsx and parent-dashboard.css. Consume existing assignment query and shared Assignment type. Export ParentDashboard with no shell wrapper. Add accurate homework/progress filters and honest missing-record states.
4. Login (agent): create server/lib/portal-login.ts and focused tests; configure existing server/plugins/auth.ts. Full responsive HTML, Student/Parent tabs, register/login sequencing, continuation, recovery, and framework logout compatibility. Do not change root public-path rules.
5. Integration (root): wire routes, preserve teacher operation, update README/AGENTS/brand metadata, format changed files, run focused tests, one typecheck, one doctor, and independent code review. Report managed browser limitation if capability unavailable. Push feature branch and open PR to development.

## Progress

- [x] Source and existing auth/background inspected.
- [x] Isolated feature branch created from development.
- [x] Screen and login implementation.
- [x] Integration, automated verification, and independent source review.
- [x] Reviewable feature branch prepared for GitHub delivery.

## Verification results

On 2026-10-17, the five focused Vitest files passed all 37 tests. These cover
login request sequencing and continuations (25), student summaries/filters (4),
parent summaries (3), portal navigation (3), and integrated server rendering (2).
The tests execute the login document's actual inline scripts. The student task
opening/completion separation was inspected in source; the render smoke does
not replace a browser interaction test.

The installed Agent-Native CLI's `typecheck` command completed successfully.
Its `doctor` command reported no findings. An independent source review found
no Critical or Important regressions. Its trailing-slash login continuation
finding was corrected and covered by three regression cases.

Browser smoke remains outstanding because this managed environment does not
expose the required browser capability. Actual cookie/session round trips,
mobile layout, keyboard focus, download behavior, and speech synthesis have
not been verified in a browser. This work is prepared for a draft PR, not a
live school deployment.

Decision: use the existing shared classroom data without expanding into an unrequested school tenancy/role subsystem. The README and delivery must state that this is not yet isolated per learner.
