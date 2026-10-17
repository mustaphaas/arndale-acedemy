import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ParentDashboard } from "../app/components/school/parent-dashboard";
import { PortalShell } from "../app/components/school/portal-shell";
import { StudentDashboard } from "../app/components/school/student-dashboard";
import { AppToolkitProvider } from "../app/components/ui/toolkit-provider";
import type { Assignment } from "../app/lib/school";

function renderPortal(path: string, records?: Assignment[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (records)
    queryClient.setQueryData(["action", "list-assignments", {}], records);
  const markup = renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AppToolkitProvider>
        <QueryClientProvider client={queryClient}>
          <PortalShell>
            {path === "/parent" ? <ParentDashboard /> : <StudentDashboard />}
          </PortalShell>
        </QueryClientProvider>
      </AppToolkitProvider>
    </MemoryRouter>,
  );
  queryClient.clear();
  return markup;
}

describe("integrated portal rendering", () => {
  it("renders the student screen with one navigation and an honest initial loading state", () => {
    const html = renderPortal("/student");
    expect(html.match(/<nav\b/g)).toHaveLength(1);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('id="homework"');
    expect(html).toContain("Sample profile");
  });

  it("renders the parent screen with stored homework instead of a loading or invented empty state", () => {
    const html = renderPortal("/parent", [
      {
        id: "task-1",
        title: "Read chapter two",
        subject: "English",
        description: "Read with a grown-up.",
        dueDate: "Friday",
        completed: false,
      },
      {
        id: "task-2",
        title: "Count to one hundred",
        subject: "Maths",
        description: "Practise counting.",
        dueDate: "Today",
        completed: true,
      },
    ]);
    expect(html.match(/<nav\b/g)).toHaveLength(1);
    expect(html).toContain("Read chapter two");
    expect(html).toContain("Count to one hundred");
    expect(html).not.toContain("Loading homework");
    expect(html).toContain('id="attendance"');
  });
});
