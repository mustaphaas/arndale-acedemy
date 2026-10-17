import { runInNewContext } from "node:vm";

import { encodeContinuation } from "@agent-native/core/shared";
import { describe, expect, it } from "vitest";

import { createPortalLoginHtml } from "./portal-login";

type Request = { path: string; options: RequestInit };
type Reply = { body: unknown; status?: number };

class PageElement {
  value = "";
  textContent = "";
  type = "text";
  hidden = false;
  disabled = false;
  focused = false;
  attributes = new Map<string, string>();
  listeners = new Map<
    string,
    Array<(event: { preventDefault(): void }) => unknown>
  >();

  get validity() {
    return {
      typeMismatch:
        this.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value),
    };
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  addEventListener(
    name: string,
    handler: (event: { preventDefault(): void }) => unknown,
  ) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), handler]);
  }

  focus() {
    this.focused = true;
  }

  async trigger(name: string) {
    if (this.disabled) return;
    await Promise.all(
      (this.listeners.get(name) ?? []).map((handler) =>
        handler({ preventDefault() {} }),
      ),
    );
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function flush() {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

function openPage({
  at = "/sign-in",
  basePath = "",
  reply = () => ({ body: { error: "Not authenticated" } }),
}: {
  at?: string;
  basePath?: string;
  reply?: (request: Request) => Reply | Promise<Reply>;
} = {}) {
  const html = createPortalLoginHtml({ basePath });
  const elements = new Map<string, PageElement>();
  for (const match of html.matchAll(/<[a-z][^>]*\bid="([^"]+)"[^>]*>/gi)) {
    const element = new PageElement();
    const type = match[0].match(/\btype="([^"]+)"/);
    if (type) element.type = type[1];
    elements.set(match[1], element);
  }
  const requests: Request[] = [];
  const redirects: string[] = [];
  const location = new URL(at, "https://school.example");
  const context = {
    document: {
      getElementById(id: string) {
        const element = elements.get(id);
        if (!element) throw new Error(`Missing page element: ${id}`);
        return element;
      },
    },
    window: {
      location: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        replace(path: string) {
          redirects.push(path);
        },
      },
    },
    fetch: async (path: string, options: RequestInit = {}) => {
      const request = { path, options };
      requests.push(request);
      const result = await reply(request);
      return new Response(JSON.stringify(result.body), {
        status: result.status ?? 200,
      });
    },
    URL,
    URLSearchParams,
    AbortController,
    setTimeout,
    clearTimeout,
    btoa,
    atob,
  };

  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    runInNewContext(match[1], context);
  }

  const element = (id: string) => {
    const found = elements.get(id);
    if (!found) throw new Error(`Missing page element: ${id}`);
    return found;
  };
  return {
    element,
    requests,
    redirects,
    posts: () =>
      requests.filter((request) => request.options.method === "POST"),
    credentials(email = "family@example.com", password = "Schoolbag-1234") {
      element("school-email").value = email;
      element("school-password").value = password;
    },
    click: (id: string) => element(id).trigger("click"),
    submit: () => element("auth-form").trigger("submit"),
  };
}

describe("the school login document", () => {
  it("waits for registration and then login before opening the selected dashboard", async () => {
    const registration = deferred<Reply>();
    const login = deferred<Reply>();
    const page = openPage({
      reply: ({ path }) => {
        if (path.endsWith("/register")) return registration.promise;
        if (path.endsWith("/login")) return login.promise;
        return { body: { error: "Not authenticated" } };
      },
    });
    await flush();
    page.credentials();
    await page.click("parent-destination");
    await page.click("auth-mode-toggle");
    const submission = page.submit();
    await flush();

    expect(page.posts().map(({ path }) => path)).toEqual([
      "/_agent-native/auth/register",
    ]);
    expect(page.redirects).toEqual([]);
    registration.resolve({ body: { ok: true } });
    await flush();
    expect(page.posts().map(({ path }) => path)).toEqual([
      "/_agent-native/auth/register",
      "/_agent-native/auth/login",
    ]);
    expect(page.redirects).toEqual([]);

    login.resolve({ body: { ok: true } });
    await submission;
    expect(page.redirects).toEqual(["/parent"]);
    expect(JSON.parse(String(page.posts()[0].options.body))).toEqual({
      email: "family@example.com",
      password: "Schoolbag-1234",
      callbackURL: "/parent",
    });
    expect(JSON.parse(String(page.posts()[1].options.body))).toEqual({
      email: "family@example.com",
      password: "Schoolbag-1234",
    });
    expect(
      page
        .posts()
        .every(({ options }) => options.credentials === "same-origin"),
    ).toBe(true);
    expect(page.element("school-password").value).toBe("");
  });

  it("does not attempt login after registration is rejected", async () => {
    const page = openPage({
      reply: ({ path }) =>
        path.endsWith("/register")
          ? {
              status: 403,
              body: {
                error:
                  "Registration is unavailable. Contact the school office.",
              },
            }
          : { body: { error: "Not authenticated" } },
    });
    await flush();
    page.credentials();
    await page.click("auth-mode-toggle");
    await page.submit();

    expect(page.posts().map(({ path }) => path)).toEqual([
      "/_agent-native/auth/register",
    ]);
    expect(page.redirects).toEqual([]);
    expect(page.element("form-error").textContent).toContain(
      "Registration is unavailable",
    );
    expect(page.element("auth-submit").disabled).toBe(false);
  });

  it("keeps failed login on the page with a recoverable inline error", async () => {
    const page = openPage({
      reply: ({ path }) =>
        path.endsWith("/login")
          ? {
              status: 401,
              body: { error: "Email or password was not recognised." },
            }
          : { body: { error: "Not authenticated" } },
    });
    await flush();
    page.credentials();
    await page.submit();

    expect(page.redirects).toEqual([]);
    expect(page.element("form-error").textContent).toBe(
      "Email or password was not recognised.",
    );
    expect(page.element("auth-submit").disabled).toBe(false);
    expect(page.element("auth-form").attributes.get("aria-busy")).toBe("false");
  });

  it("retries login instead of re-registering when account creation already succeeded", async () => {
    let loginAttempts = 0;
    const page = openPage({
      reply: ({ path }) => {
        if (path.endsWith("/register")) return { body: { ok: true } };
        if (path.endsWith("/login")) {
          loginAttempts += 1;
          return loginAttempts === 1
            ? {
                status: 403,
                body: { error: "Please verify your email before signing in." },
              }
            : { body: { ok: true } };
        }
        return { body: { error: "Not authenticated" } };
      },
    });
    await flush();
    page.credentials();
    await page.click("auth-mode-toggle");
    await page.submit();

    expect(page.redirects).toEqual([]);
    expect(page.element("form-error").textContent).toContain(
      "Your account was created.",
    );
    expect(page.element("auth-submit-label").textContent).toBe("Sign in");
    await page.submit();
    expect(page.posts().map(({ path }) => path)).toEqual([
      "/_agent-native/auth/register",
      "/_agent-native/auth/login",
      "/_agent-native/auth/login",
    ]);
    expect(page.redirects).toEqual(["/"]);
  });

  it.each([{ ok: "true" }, { twoFactorRedirect: true }, {}, { ok: false }])(
    "does not treat a non-success login response as a session: %j",
    async (body) => {
      const page = openPage({
        reply: ({ path }) =>
          path.endsWith("/login")
            ? { body }
            : { body: { error: "Not authenticated" } },
      });
      await flush();
      page.credentials();
      await page.submit();
      expect(page.redirects).toEqual([]);
      expect(page.element("form-error").textContent.length).toBeGreaterThan(0);
    },
  );

  it("recovers from a failed network request without redirecting", async () => {
    const page = openPage({
      reply: ({ path }) => {
        if (path.endsWith("/login")) throw new TypeError("Failed to fetch");
        return { body: { error: "Not authenticated" } };
      },
    });
    await flush();
    page.credentials();
    await page.submit();
    expect(page.redirects).toEqual([]);
    expect(page.element("form-error").textContent).toContain("connection");
    expect(page.element("auth-submit").disabled).toBe(false);
  });

  it.each(["/parent#homework", "/student?view=week", "/teacher#assignments"])(
    "preserves the framework continuation %s for an existing session",
    async (target) => {
      const page = openPage({
        at: `/sign-in?c=${encodeContinuation(target)}`,
        reply: () => ({ body: { email: "family@example.com" } }),
      });
      await flush();
      expect(page.redirects).toEqual([target]);
      expect(page.requests.map(({ path }) => path)).toEqual([
        "/_agent-native/auth/session",
      ]);
      expect(page.requests[0].options.cache).toBe("no-store");
    },
  );

  it.each([
    {
      target: "/parent/?filter=open#homework",
      dashboard: "parent",
      studentPressed: "false",
      parentPressed: "true",
    },
    {
      target: "/teacher/?view=class#assignments",
      dashboard: "teacher",
      studentPressed: "false",
      parentPressed: "false",
    },
    {
      target: "/student/?view=week#progress",
      dashboard: "student",
      studentPressed: "true",
      parentPressed: "false",
    },
  ])(
    "preserves trailing-slash continuation $target and identifies its dashboard",
    async ({ target, dashboard, studentPressed, parentPressed }) => {
      const page = openPage({
        at: `/sign-in?c=${encodeContinuation(target)}`,
        reply: ({ path }) =>
          path.endsWith("/login")
            ? { body: { ok: true } }
            : { body: { error: "Not authenticated" } },
      });
      await flush();
      expect(
        page.element("student-destination").attributes.get("aria-pressed"),
      ).toBe(studentPressed);
      expect(
        page.element("parent-destination").attributes.get("aria-pressed"),
      ).toBe(parentPressed);
      expect(page.element("destination-note").textContent).toContain(
        `${dashboard} dashboard`,
      );
      page.credentials();
      await page.submit();
      expect(page.redirects).toEqual([target]);
    },
  );

  it.each([
    "https://elsewhere.example/parent",
    "//elsewhere.example/parent",
    "/sign-in?return=/parent",
    "/_agent-native/auth/logout",
    "/not-a-dashboard",
  ])("rejects unsafe or unrelated continuation %s", async (target) => {
    const forged = btoa(encodeURIComponent(target)).replace(/=+$/, "");
    const page = openPage({
      at: `/sign-in?c=${encodeURIComponent(forged)}`,
      reply: () => ({ body: { email: "family@example.com" } }),
    });
    await flush();
    expect(page.redirects).toEqual(["/"]);
  });

  it("lets a destination choice replace a teacher continuation without assigning any role", async () => {
    const page = openPage({
      at: `/sign-in?c=${encodeContinuation("/teacher")}`,
      reply: ({ path }) =>
        path.endsWith("/login")
          ? { body: { ok: true } }
          : { body: { error: "Not authenticated" } },
    });
    await flush();
    await page.click("parent-destination");
    page.credentials();
    await page.submit();
    expect(page.redirects).toEqual(["/parent"]);
    expect(JSON.parse(String(page.posts()[0].options.body))).not.toHaveProperty(
      "role",
    );
  });

  it("keeps endpoints and selected dashboards within a configured app mount", async () => {
    const page = openPage({
      at: "/schools/arndale/sign-in",
      basePath: "/schools/arndale",
      reply: ({ path }) =>
        path.endsWith("/login")
          ? { body: { ok: true } }
          : { body: { error: "Not authenticated" } },
    });
    await flush();
    await page.click("student-destination");
    page.credentials();
    await page.submit();
    expect(page.requests.map(({ path }) => path)).toEqual([
      "/schools/arndale/_agent-native/auth/session",
      "/schools/arndale/_agent-native/auth/login",
    ]);
    expect(page.redirects).toEqual(["/schools/arndale/student"]);
  });

  it("rejects a continuation to another mounted app", async () => {
    const page = openPage({
      at: `/schools/arndale/sign-in?c=${encodeContinuation("/schools/other/parent")}`,
      basePath: "/schools/arndale",
      reply: () => ({ body: { email: "family@example.com" } }),
    });
    await flush();
    expect(page.redirects).toEqual(["/schools/arndale"]);
  });

  it("validates signup locally and focuses the field needing attention", async () => {
    const page = openPage();
    await flush();
    page.credentials("not-an-email", "short");
    await page.click("auth-mode-toggle");
    await page.submit();
    expect(page.posts()).toEqual([]);
    expect(page.element("email-error").textContent.length).toBeGreaterThan(0);
    expect(page.element("school-email").focused).toBe(true);

    page.credentials("family@example.com", "short");
    await page.submit();
    expect(page.posts()).toEqual([]);
    expect(page.element("password-error").textContent).toContain("12");
    expect(page.element("school-password").focused).toBe(true);
  });

  it("toggles password visibility with an accessible pressed state", async () => {
    const page = openPage();
    await page.click("password-visibility");
    expect(page.element("school-password").type).toBe("text");
    expect(
      page.element("password-visibility").attributes.get("aria-pressed"),
    ).toBe("true");
    await page.click("password-visibility");
    expect(page.element("school-password").type).toBe("password");
    expect(
      page.element("password-visibility").attributes.get("aria-pressed"),
    ).toBe("false");
  });
});
