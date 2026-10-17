import {
  safeJsonForHtml,
  signInJourneyInlineScript,
} from "@agent-native/core/shared";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MAX_LENGTH_MESSAGE,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from "@agent-native/core/shared/password-policy";

interface PortalLoginOptions {
  /** Resolved by the framework, never inferred from a continuation URL. */
  basePath?: string;
}

const book = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5C9 4.3 5.5 4 3 5v14c3-1 6-.7 9 1.5 3-2.2 6-2.5 9-1.5V5c-2.5-1-6-.7-9 1.5Z"/><path d="M12 6.5v14M6 8.5c1.2-.1 2.1.1 3 .5M15 9c.9-.4 1.8-.6 3-.5"/></svg>`;
const leaf = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 3.5c-7-1-13 2-13 8 0 3 2 5 5 5 6 0 9-6 8-13Z"/><path d="M4 21c1-5 4-9 9-12"/></svg>`;
const heart = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.1 5.8a5.2 5.2 0 0 0-7.4 0l-.7.7-.7-.7a5.2 5.2 0 0 0-7.4 7.4L12 21l8.1-7.8a5.2 5.2 0 0 0 0-7.4Z"/></svg>`;
const arrow = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>`;
const family = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg>`;

// Keep the browser code literal: the test harness executes these exact scripts,
// including the framework's continuation helper, without a second implementation.
const loginBehavior = String.raw`
(function () {
  "use strict";
  var config = portalLoginConfig;
  var journey = __anCreateSignInJourney(config.basePath, config.homePath);
  var base = journey.basePath;
  var form = document.getElementById("auth-form");
  var emailInput = document.getElementById("school-email");
  var passwordInput = document.getElementById("school-password");
  var emailError = document.getElementById("email-error");
  var passwordError = document.getElementById("password-error");
  var formError = document.getElementById("form-error");
  var formStatus = document.getElementById("form-status");
  var submitButton = document.getElementById("auth-submit");
  var submitLabel = document.getElementById("auth-submit-label");
  var modeToggle = document.getElementById("auth-mode-toggle");
  var visibilityButton = document.getElementById("password-visibility");
  var studentButton = document.getElementById("student-destination");
  var parentButton = document.getElementById("parent-destination");
  var mode = "signin";
  var busy = false;
  var submitted = false;
  var redirecting = false;

  function localPath(path) {
    var pathname = new URL(path, "https://school.invalid").pathname;
    var local = base ? pathname.slice(base.length) || "/" : pathname;
    return local.replace(/\/+$/, "") || "/";
  }

  function dashboardDestination(path) {
    var normalized = journey.normalizeAppPath(path);
    if (!normalized) return null;
    var local = localPath(normalized);
    return ["/", "/student", "/parent", "/teacher"].indexOf(local) >= 0
      ? normalized : null;
  }

  var destination = dashboardDestination(
    journey.journeyForLocation(window.location).resumeHref
  ) || journey.homeHref();

  function updateDestination() {
    var local = localPath(destination);
    var parent = local === "/parent";
    var teacher = local === "/teacher";
    studentButton.setAttribute("aria-pressed", String(!parent && !teacher));
    parentButton.setAttribute("aria-pressed", String(parent));
    document.getElementById("destination-note").textContent = teacher
      ? "Return to your teacher dashboard after sign-in."
      : "Open your " + (parent ? "parent" : "student") + " dashboard after sign-in.";
  }

  function chooseDestination(kind) {
    if (busy) return;
    destination = dashboardDestination(base + (kind === "parent" ? "/parent" : "/student"))
      || journey.homeHref();
    updateDestination();
  }

  function renderMode() {
    var registering = mode === "register";
    document.title = (registering ? "Create account" : "Sign in") + " · Arndale Academy";
    document.getElementById("auth-heading").textContent = registering ? "A new beginning." : "Welcome back.";
    document.getElementById("auth-intro").textContent = registering
      ? "Create an account to get started with the portal."
      : "Sign in and pick up where you left off.";
    document.getElementById("auth-kicker").textContent = registering
      ? "Let’s get you started" : "Your school day starts here";
    document.getElementById("account-prompt").textContent = registering
      ? "Already have an account?" : "New to the portal?";
    modeToggle.textContent = registering ? "Sign in" : "Create an account";
    submitLabel.textContent = registering ? "Create account" : "Sign in";
    passwordInput.setAttribute("autocomplete", registering ? "new-password" : "current-password");
    document.getElementById("password-hint").hidden = !registering;
  }

  function setBusy(value) {
    busy = value;
    form.setAttribute("aria-busy", String(value));
    [emailInput, passwordInput, submitButton, modeToggle, studentButton, parentButton]
      .forEach(function (control) { control.disabled = value; });
    if (!value) renderMode();
  }

  function clearErrors() {
    [emailError, passwordError, formError].forEach(function (element) {
      element.textContent = "";
      element.hidden = true;
    });
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
    formStatus.textContent = "";
  }

  function fieldError(input, output, message) {
    input.setAttribute("aria-invalid", "true");
    output.textContent = message;
    output.hidden = false;
    input.focus();
    formStatus.textContent = message;
  }

  function validate() {
    emailInput.value = emailInput.value.trim();
    if (!emailInput.value || emailInput.validity.typeMismatch) {
      fieldError(emailInput, emailError, "Enter your email address, for example name@example.com.");
      return false;
    }
    if (!passwordInput.value) {
      fieldError(passwordInput, passwordError, "Enter your password.");
      return false;
    }
    if (mode === "register" && passwordInput.value.length < config.passwordMinLength) {
      fieldError(passwordInput, passwordError, config.passwordMinMessage);
      return false;
    }
    if (mode === "register" && passwordInput.value.length > config.passwordMaxLength) {
      fieldError(passwordInput, passwordError, config.passwordMaxMessage);
      return false;
    }
    return true;
  }

  function authPath(operation) {
    return base + "/_agent-native/auth/" + operation;
  }

  async function requestJson(operation, body) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 20000);
    try {
      var response;
      try {
        response = await fetch(authPath(operation), {
          method: body ? "POST" : "GET",
          credentials: "same-origin",
          cache: "no-store",
          redirect: "error",
          headers: body
            ? { "Content-Type": "application/json", "Accept": "application/json" }
            : { "Accept": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
      } catch (_) {
        throw new Error("We couldn’t connect to the portal. Check your connection and try again.");
      }
      var data;
      try { data = await response.json(); }
      catch (_) { throw new Error("The portal didn’t respond as expected. Please try again."); }
      return { response: response, data: data };
    } finally {
      clearTimeout(timeout);
    }
  }

  async function authenticate(operation, credentials) {
    var result = await requestJson(operation, credentials);
    if (!result.response.ok || !result.data || result.data.ok !== true) {
      var message = result.data && typeof result.data.error === "string"
        ? result.data.error.trim().slice(0, 280) : "";
      throw new Error(message || (operation === "register"
        ? "We couldn’t create your account. Please try again or ask the school office for help."
        : "We couldn’t finish signing you in. Please try again or ask the school office for help."));
    }
  }

  function openDashboard(message) {
    if (redirecting) return;
    redirecting = true;
    passwordInput.value = "";
    setBusy(true);
    submitLabel.textContent = "Opening your dashboard…";
    formStatus.textContent = message;
    window.location.replace(destination);
  }

  studentButton.addEventListener("click", function () { chooseDestination("student"); });
  parentButton.addEventListener("click", function () { chooseDestination("parent"); });
  modeToggle.addEventListener("click", function () {
    if (busy) return;
    mode = mode === "register" ? "signin" : "register";
    clearErrors();
    renderMode();
    emailInput.focus();
  });
  visibilityButton.addEventListener("click", function () {
    var show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    visibilityButton.textContent = show ? "Hide" : "Show";
    visibilityButton.setAttribute("aria-pressed", String(show));
    visibilityButton.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (busy) return;
    clearErrors();
    if (!validate()) return;
    submitted = true;
    var accountCreated = false;
    var credentials = { email: emailInput.value, password: passwordInput.value };
    setBusy(true);
    try {
      if (mode === "register") {
        submitLabel.textContent = "Creating your account…";
        formStatus.textContent = "Creating your account. One moment…";
        await authenticate("register", {
          email: credentials.email,
          password: credentials.password,
          callbackURL: destination
        });
        accountCreated = true;
        // Registration does not establish a session. A retry must now sign in,
        // rather than trying to register this account a second time.
        mode = "signin";
        renderMode();
      }
      submitLabel.textContent = "Signing in…";
      formStatus.textContent = accountCreated
        ? "Account created. Signing you in…" : "Signing you in. One moment…";
      await authenticate("login", credentials);
      openDashboard("You’re signed in. Opening your dashboard…");
    } catch (error) {
      formStatus.textContent = "";
      formError.textContent = (accountCreated ? "Your account was created. " : "")
        + (error instanceof Error ? error.message : "Something went wrong. Please try again.");
      formError.hidden = false;
    } finally {
      if (!redirecting) setBusy(false);
    }
  });

  form.setAttribute("action", authPath("login"));
  updateDestination();
  renderMode();
  setBusy(false);

  // The documented session endpoint returns { email, ... } for a real session,
  // not a nested user. A failed probe leaves the normal form ready to use.
  requestJson("session").then(function (result) {
    if (!submitted && !redirecting && result.response.ok && result.data
      && !result.data.error && typeof result.data.email === "string"
      && result.data.email.trim()) {
      openDashboard("Welcome back. Opening your dashboard…");
    }
  }).catch(function () { /* Normal sign-in remains available. */ });
})();
`;

/** A public document only: the framework continues to own sessions and access. */
export function createPortalLoginHtml({
  basePath = "",
}: PortalLoginOptions = {}) {
  const config = safeJsonForHtml({
    basePath,
    homePath: "/",
    passwordMinLength: PASSWORD_MIN_LENGTH,
    passwordMaxLength: PASSWORD_MAX_LENGTH,
    passwordMinMessage: PASSWORD_MIN_LENGTH_MESSAGE,
    passwordMaxMessage: PASSWORD_MAX_LENGTH_MESSAGE,
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#eef2f6">
  <meta name="description" content="A welcoming place for Arndale Academy pupils and families to keep learning, progress, and school days together.">
  <title>Sign in · Arndale Academy</title>
  <style>
    :root {
      color-scheme: light;
      --portal-background: radial-gradient(ellipse at 9% 8%, rgba(248, 217, 228, .58), transparent 31%), radial-gradient(ellipse at 87% 18%, rgba(194, 220, 244, .62), transparent 34%), radial-gradient(ellipse at 72% 91%, rgba(215, 237, 220, .58), transparent 36%), linear-gradient(125deg, #f7f8fa 0%, #eef2f6 48%, #f8f3f7 100%);
      --ink: #293b4b;
      --muted: #637482;
      --green: #356952;
      --green-deep: #28573f;
      --line: #d9e1e3;
      --glass: rgba(255, 255, 255, .7);
      --error: #9b343d;
      --error-surface: #fff2f2;
      --focus: #49796b;
      --radius: 28px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    body {
      min-width: 280px;
      min-height: 100vh;
      min-height: 100svh;
      margin: 0;
      color: var(--ink);
      background: var(--portal-background);
      background-attachment: fixed;
    }
    button, input { font: inherit; }
    button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
    button:disabled { cursor: wait; }
    button, summary, input { outline-offset: 4px; }
    :focus-visible { outline: 3px solid var(--focus); }
    svg { display: block; width: 24px; height: 24px; flex-shrink: 0; }
    .page { max-width: 1264px; margin: 0 auto; padding: 36px 52px 25px; }
    .brand-bar { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { display: flex; align-items: center; gap: 13px; }
    .brand-mark {
      display: grid;
      width: 48px;
      height: 48px;
      flex: 0 0 48px;
      place-items: center;
      border: 1px solid rgba(255,255,255,.94);
      border-radius: 16px;
      color: var(--green);
      background: linear-gradient(145deg, #fffef9, #edf2d9);
      box-shadow: 0 5px 16px rgba(76,99,76,.08), inset 0 1px #fff;
    }
    .brand-mark svg { width: 27px; height: 27px; }
    .brand strong { display: block; font-size: 18px; font-weight: 700; letter-spacing: -.5px; }
    .brand small { display: block; margin-top: 5px; color: var(--muted); font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
    .brand-note { margin: 0; color: var(--muted); font-size: 13px; }
    .landing {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(350px, .9fr);
      grid-template-rows: auto 1fr;
      align-items: start;
      gap: 38px 76px;
      margin: 75px 0 56px;
    }
    .intro { grid-column: 1; grid-row: 1; padding-top: 20px; }
    .eyebrow { display: flex; align-items: center; gap: 9px; margin: 0 0 24px; color: var(--green); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
    .eyebrow::before { width: 21px; height: 1px; background: currentColor; content: ""; }
    h1 { margin: 0; font-size: clamp(44px, 5.25vw, 72px); line-height: 1.08; font-weight: 650; letter-spacing: -.065em; }
    h1 span { display: block; }
    h1 .green { margin-top: 3px; color: var(--green); }
    .introduction { max-width: 420px; margin: 26px 0 0; color: var(--muted); font-size: 16px; line-height: 1.75; }
    .benefits { grid-column: 1; grid-row: 2; }
    .benefit-list { display: grid; gap: 21px; margin: 0; padding: 0; list-style: none; }
    .benefit-list li { display: flex; align-items: center; gap: 15px; }
    .benefit-icon { display: grid; width: 45px; height: 45px; flex: 0 0 45px; place-items: center; border: 1px solid rgba(255,255,255,.95); border-radius: 14px; box-shadow: inset 0 1px #fff, 0 5px 15px rgba(54,74,80,.03); }
    .benefit-icon svg { width: 22px; height: 22px; }
    .mint { color: #53735f; background: rgba(220,238,224,.68); }
    .blue { color: #587893; background: rgba(219,232,247,.72); }
    .peach { color: #9b7158; background: rgba(250,231,215,.68); }
    .benefit-list strong { font-size: 14px; font-weight: 650; letter-spacing: -.2px; }
    .benefit-list p { margin: 5px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
    .garden-note { display: flex; align-items: center; gap: 14px; margin: 36px 0 0; color: #6b7c6b; }
    .garden-note svg { width: 73px; height: 57px; }
    .garden-note span { max-width: 185px; font-size: 12px; line-height: 1.65; }
    .auth-card {
      grid-column: 2;
      grid-row: 1 / span 2;
      position: relative;
      width: 100%;
      padding: 32px;
      border: 1px solid rgba(255,255,255,.98);
      border-radius: var(--radius);
      background: var(--glass);
      box-shadow: 0 24px 70px rgba(70,88,106,.085), 0 4px 16px rgba(70,88,106,.04), inset 0 1px #fff;
      backdrop-filter: blur(28px) saturate(145%);
      -webkit-backdrop-filter: blur(28px) saturate(145%);
    }
    .card-kicker { display: flex; align-items: center; gap: 7px; margin: 0 0 12px; color: var(--green); font-size: 10px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
    .card-kicker svg { width: 16px; height: 16px; }
    h2 { margin: 0; font-size: 29px; font-weight: 650; letter-spacing: -1.1px; }
    .card-intro { margin: 10px 0 25px; color: var(--muted); font-size: 13px; line-height: 1.65; }
    .destination-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 5px; border: 1px solid #e2e8e7; border-radius: 15px; background: rgba(236,241,240,.68); }
    .destination-switch button { display: flex; min-height: 45px; align-items: center; justify-content: center; gap: 8px; padding: 9px 10px; border: 1px solid transparent; border-radius: 11px; color: #60716d; background: transparent; font-size: 13px; font-weight: 650; transition: background .16s ease, box-shadow .16s ease; }
    .destination-switch svg { width: 18px; height: 18px; }
    .destination-switch button[aria-pressed="true"] { border-color: #fff; color: var(--green); background: rgba(255,255,255,.98); box-shadow: 0 2px 7px rgba(67,86,74,.08); }
    .destination-switch button:hover { background: rgba(255,255,255,.72); }
    .destination-switch button:disabled { opacity: .68; }
    .destination-note { min-height: 18px; margin: 11px 0 24px; color: var(--muted); font-size: 11px; line-height: 1.6; text-align: center; }
    .form-field { margin-top: 19px; }
    label { display: block; margin-bottom: 8px; color: #40564f; font-size: 12px; font-weight: 650; }
    .field-wrap { position: relative; }
    input { display: block; width: 100%; min-width: 0; min-height: 50px; padding: 13px 15px; border: 1px solid #dce3e3; border-radius: 12px; color: var(--ink); background: rgba(255,255,255,.9); font-size: 15px; line-height: 1.45; transition: border-color .16s ease, box-shadow .16s ease; }
    input::placeholder { color: #94a09f; font-size: 13px; }
    input:hover { border-color: #b9cbc3; }
    input:focus { border-color: #6e9986; outline: 0; box-shadow: 0 0 0 3px rgba(108,158,137,.16); }
    input[aria-invalid="true"] { border-color: #b6656c; }
    input:disabled { opacity: .7; }
    #school-password { padding-right: 68px; }
    .visibility-button { position: absolute; top: 3px; right: 5px; min-width: 52px; min-height: 44px; padding: 8px; border: 0; border-radius: 8px; color: #587667; background: transparent; font-size: 11px; font-weight: 650; }
    .visibility-button:hover { background: #edf4ef; }
    .field-hint { margin: 7px 0 0; color: var(--muted); font-size: 11px; line-height: 1.6; }
    .field-error { margin: 7px 0 0; color: var(--error); font-size: 12px; line-height: 1.6; }
    .form-error { margin: 18px 0 0; padding: 12px 13px; border: 1px solid #eed3d5; border-radius: 11px; color: var(--error); background: var(--error-surface); font-size: 12px; line-height: 1.65; overflow-wrap: anywhere; }
    .submit-button { display: flex; width: 100%; min-height: 51px; align-items: center; justify-content: center; gap: 12px; margin-top: 25px; padding: 12px 17px; border: 1px solid rgba(53,98,77,.24); border-radius: 12px; color: #fff; background: linear-gradient(115deg, #46765e, #386752); box-shadow: 0 6px 14px rgba(53,100,79,.14), inset 0 1px rgba(255,255,255,.13); font-size: 14px; font-weight: 650; transition: background .16s ease, transform .16s ease, box-shadow .16s ease; }
    .submit-button svg { width: 18px; height: 18px; }
    .submit-button:hover:not(:disabled) { background: linear-gradient(115deg, #3a684f, #2c583f); box-shadow: 0 7px 18px rgba(53,100,79,.21); transform: translateY(-1px); }
    .submit-button:disabled { opacity: .75; }
    .submit-spinner { display: none; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: turn .8s linear infinite; }
    form[aria-busy="true"] .submit-spinner { display: block; }
    form[aria-busy="true"] .submit-button > svg { display: none; }
    .form-status { margin: 10px 0 0; color: var(--green); font-size: 12px; line-height: 1.55; text-align: center; }
    .form-status:empty { display: none; }
    .account-switch { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; column-gap: 4px; margin: 13px 0 7px; color: var(--muted); font-size: 12px; }
    .text-button { min-height: 44px; padding: 10px 5px; border: 0; border-radius: 7px; color: var(--green); background: transparent; font-size: 12px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: transparent; }
    .text-button:hover { text-decoration-color: currentColor; }
    .text-button:disabled { opacity: .6; }
    .account-help { margin-top: 9px; border-top: 1px solid var(--line); padding-top: 8px; }
    .account-help summary { display: flex; min-height: 44px; align-items: center; justify-content: space-between; gap: 15px; border-radius: 6px; color: var(--muted); list-style: none; cursor: pointer; font-size: 12px; }
    .account-help summary::-webkit-details-marker { display: none; }
    .account-help summary svg { width: 15px; height: 15px; transition: transform .18s ease; }
    .account-help[open] summary svg { transform: rotate(180deg); }
    .account-help p { margin: 2px 0 5px; color: var(--muted); font-size: 12px; line-height: 1.75; }
    .footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid rgba(140,158,162,.17); padding-top: 20px; color: #73838a; font-size: 11px; line-height: 1.6; }
    .footer p { margin: 0; }
    .footer-note { display: flex; align-items: center; gap: 7px; }
    .footer-note svg { width: 14px; height: 14px; color: #7a9c80; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    noscript p { padding: 13px; border: 1px solid #ead6b4; border-radius: 10px; background: #fff8e9; font-size: 13px; line-height: 1.6; }
    @keyframes turn { to { transform: rotate(360deg); } }
    @media (min-width: 1450px) { .page { padding-top: 48px; }.landing { margin-top: 100px; margin-bottom: 80px; } }
    @media (max-width: 1080px) { .page { padding-inline: 32px; }.landing { gap: 30px 40px; }.auth-card { padding: 27px; }h1 { font-size: 54px; } }
    @media (max-width: 800px) {
      .page { max-width: 610px; padding: 26px 24px 22px; }
      .brand-note { display: none; }
      .landing { grid-template-columns: minmax(0, 1fr); gap: 28px; margin: 37px 0; }
      .intro { grid-column: 1; grid-row: 1; padding: 0; }
      .eyebrow { margin-bottom: 17px; font-size: 10px; }
      h1 { font-size: 48px; }
      .introduction { max-width: 450px; margin-top: 18px; font-size: 14px; }
      .auth-card { grid-column: 1; grid-row: 2; padding: 28px; }
      .benefits { grid-column: 1; grid-row: 3; padding: 7px 5px; }
      .garden-note { margin-top: 26px; }
      .footer { align-items: flex-start; flex-direction: column; gap: 7px; }
    }
    @media (max-width: 400px) {
      .page { padding-inline: 18px; }
      .brand strong { font-size: 16px; }.brand small { font-size: 9px; }
      h1 { font-size: 42px; }
      .auth-card { padding: 23px 19px; border-radius: 23px; }
      h2 { font-size: 27px; }.destination-switch button { font-size: 12px; }
    }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }.submit-button:hover:not(:disabled) { transform: none; } }
    @media (forced-colors: active) { .auth-card, input, button, .benefit-icon { border: 1px solid ButtonText; }.destination-switch button[aria-pressed="true"] { outline: 2px solid Highlight; }.submit-button { background: ButtonFace; color: ButtonText; } }
  </style>
</head>
<body>
  <div class="page">
    <header class="brand-bar">
      <div class="brand">
        <span class="brand-mark">${book}</span>
        <div><strong>Arndale Academy</strong><small>Primary School Portal</small></div>
      </div>
      <p class="brand-note">A little more connected. Every school day.</p>
    </header>

    <main class="landing">
      <section class="intro" aria-labelledby="welcome-heading">
        <p class="eyebrow">A place to learn. A place to grow.</p>
        <h1 id="welcome-heading"><span>Little steps.</span><span class="green">Brighter futures.</span></h1>
        <p class="introduction">From the first lesson to the last little victory, bring your school day together in one welcoming place.</p>
      </section>

      <section class="benefits" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" class="sr-only">Together for every part of the school day</h2>
        <ul class="benefit-list">
          <li><span class="benefit-icon mint">${book}</span><div><strong>Ready for a day of discovery</strong><p>Find homework and make a little learning happen.</p></div></li>
          <li><span class="benefit-icon blue">${leaf}</span><div><strong>Small wins, growing confidence</strong><p>Follow progress, one completed task at a time.</p></div></li>
          <li><span class="benefit-icon peach">${heart}</span><div><strong>Home and school, a little closer</strong><p>Keep families connected to the learning day.</p></div></li>
        </ul>
        <div class="garden-note" aria-hidden="true">
          <svg viewBox="0 0 92 72" fill="none"><ellipse cx="46" cy="63" rx="30" ry="4" fill="#a9bfaa" fill-opacity=".18"/><path d="M21 54c9-4 18-3 25 3 8-6 17-7 25-3V35c-9-2-17 0-25 6-8-6-16-8-25-6v19Z" fill="#fff" fill-opacity=".7" stroke="#9cb9a7" stroke-width="1.4"/><path d="M46 41v16m0-18V20" stroke="#7b9d85" stroke-width="1.5" stroke-linecap="round"/><path d="M46 28c-10 0-15-5-14-13 9-1 15 4 14 13Z" fill="#bbd3ba" stroke="#95b596" stroke-width="1.2"/><path d="M46 22c0-8 5-13 14-13 1 8-4 14-14 13Z" fill="#d9e8cb" stroke="#95b596" stroke-width="1.2"/><path d="M28 42c5 0 9 1 13 4m10 0c4-3 8-4 13-4m-36 7c4 0 8 1 11 3m14 0c3-2 7-3 11-3" stroke="#b9c9be" stroke-width="1.2" stroke-linecap="round"/><circle cx="74" cy="18" r="7" fill="#f2deab" fill-opacity=".8"/><path d="M19 18v6m-3-3h6" stroke="#d3aaa4" stroke-width="1.5" stroke-linecap="round"/></svg>
          <span>A little care. A little curiosity.<br>So much room to grow.</span>
        </div>
      </section>

      <section class="auth-card" aria-labelledby="auth-heading">
        <p class="card-kicker">${leaf}<span id="auth-kicker">Your school day starts here</span></p>
        <h2 id="auth-heading">Welcome back.</h2>
        <p class="card-intro" id="auth-intro">Sign in and pick up where you left off.</p>

        <div class="destination-switch" role="group" aria-label="Choose your dashboard">
          <button type="button" id="student-destination" aria-pressed="true">${book}<span>Student</span></button>
          <button type="button" id="parent-destination" aria-pressed="false">${family}<span>Parent</span></button>
        </div>
        <p id="destination-note" class="destination-note">Open your student dashboard after sign-in.</p>

        <form id="auth-form" method="post" aria-busy="false" novalidate>
          <div class="form-field">
            <label for="school-email">School email</label>
            <input id="school-email" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" placeholder="Your email address" required aria-describedby="email-hint email-error">
            <p id="email-hint" class="field-hint">Use the email address you use with school.</p>
            <p id="email-error" class="field-error" hidden></p>
          </div>
          <div class="form-field">
            <label for="school-password">Password</label>
            <div class="field-wrap">
              <input id="school-password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required aria-describedby="password-hint password-error">
              <button id="password-visibility" class="visibility-button" type="button" aria-controls="school-password" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
            <p id="password-hint" class="field-hint" hidden>Choose a password with at least ${PASSWORD_MIN_LENGTH} characters.</p>
            <p id="password-error" class="field-error" hidden></p>
          </div>
          <p id="form-error" class="form-error" role="alert" hidden></p>
          <button id="auth-submit" class="submit-button" type="submit" disabled><span id="auth-submit-label">Sign in</span><span class="submit-spinner" aria-hidden="true"></span>${arrow}</button>
          <p id="form-status" class="form-status" role="status" aria-live="polite"></p>
        </form>

        <p class="account-switch"><span id="account-prompt">New to the portal?</span><button id="auth-mode-toggle" type="button" class="text-button">Create an account</button></p>
        <details class="account-help">
          <summary>Need a hand signing in?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
          <p>Ask the school office which email address to use or how to get help with your account. If you’re a pupil, a parent or carer can help you sign in.</p>
        </details>
        <noscript><p>Please enable JavaScript to sign in to the school portal.</p></noscript>
      </section>
    </main>

    <footer class="footer"><p>Arndale Academy · Primary School Portal</p><p class="footer-note">${leaf}Growing together, every day.</p></footer>
  </div>
  <script>${signInJourneyInlineScript()}</script>
  <script>var portalLoginConfig = ${config};\n${loginBehavior}</script>
</body>
</html>`;
}
