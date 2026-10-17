# Primary school portal design

## User request

Add a student dashboard, a parent dashboard, and a login landing page to the existing Arndale Academy repository, using its existing background.

## Existing application

Work starts from development commit 2d39886f59655f9bdff46a79d4364764be940ee6. Preserve the Littleleaf Garden visual language and its pastel pink, blue, and mint background. The framework already provides real email/password authentication and classroom assignment actions. Main is an older blank scaffold.

## Experience

- A full branded sign-in page at the framework's /sign-in route offers student and parent destinations, accessible email/password controls, registration, useful errors, and account help. Use the existing session endpoints and continuation helper.
- The student dashboard remains available at / and also at /student. It shows a clear next homework task, a labelled sample timetable, progress calculated from the assignment list, and an explicit completion action after opening a task.
- The parent dashboard at /parent shows the learner profile, homework counts, filters, subject completion, and empty attendance/results states where records do not exist.
- Preserve /teacher and its assignment creation/deletion workflow.
- Keep the common navigation mounted above the route outlet. Provide working in-page navigation, a mobile menu, sign-out, readable typography, and reduced-motion support.
- Use Arndale Academy as the school identity and retain the existing Littleleaf visual direction.

## Data and scope

The existing sample learner, class timetable, and school notices are explicitly labelled as example information. Assignment counters use stored records and show loading, failure, and empty states. Do not manufacture grades, attendance percentages, message delivery, or AI capabilities.

This change does not establish school roles or parent-child data isolation: the current database contains only a shared classroom assignment list. Persona selection chooses a destination and never grants a role. Document this limitation before connecting real pupil records. Preserve framework authentication and do not introduce parallel sessions.

## Verification

Run focused tests for sign-in continuation and registration-before-login sequencing, route mapping, and any new progress calculations. Run the repository typecheck and doctor once after integration. Managed browser QA requires the control-browser capability; if it remains unavailable, report that visual/live sign-in smoke could not be completed. Do not start an unsupported preview server. Preserve locked dependencies and avoid production builds as AGENTS.md directs.

## Delivery

Save tested changes in a feature branch based on development and open a reviewable pull request. Do not merge or publish a live school portal without a verified deployment target.
