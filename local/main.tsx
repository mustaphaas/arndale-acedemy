import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router";

import { TeacherDashboard } from "@/components/portal";
import { ParentDashboard } from "@/components/school/parent-dashboard";
import { PortalShell } from "@/components/school/portal-shell";
import { StudentDashboard } from "@/components/school/student-dashboard";
import { AppToolkitProvider } from "@/components/ui/toolkit-provider";

import { browserAssignments, useAssignmentSnapshot } from "./assignment-hooks";
import { STORAGE_KEY } from "./assignment-store";
import { LEARNING_STORAGE_KEY, refreshLearningStateFromStorage } from "@/lib/learning-intelligence";
import { DemoHome } from "./demo-home";

import "../app/global.css";

function LocalDemoSync() {
  useAssignmentSnapshot();
  useEffect(() => {
    const refreshFromTab = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        browserAssignments.refresh();
      if (event.key === LEARNING_STORAGE_KEY || event.key === null)
        refreshLearningStateFromStorage();
    };
    const refreshOnFocus = () => {
      browserAssignments.refresh();
      refreshLearningStateFromStorage();
    };
    window.addEventListener("storage", refreshFromTab);
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.removeEventListener("storage", refreshFromTab);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  return null;
}

function RouteScroll() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    let targetId = hash.slice(1);
    try {
      targetId = decodeURIComponent(targetId);
    } catch {
      /* Keep a malformed hash harmless. */
    }
    const frame = window.requestAnimationFrame(() => {
      if (targetId) document.getElementById(targetId)?.scrollIntoView();
      else window.scrollTo(0, 0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash, key]);
  return null;
}

const root = document.getElementById("root");
if (!root) throw new Error("The portal could not find its root element.");

createRoot(root).render(
  <BrowserRouter>
    <AppToolkitProvider>
      <LocalDemoSync />
      <RouteScroll />
      <Routes>
        <Route path="/" element={<DemoHome />} />
        <Route path="/sign-in" element={<DemoHome />} />
        <Route
          element={
            <PortalShell>
              <Outlet />
            </PortalShell>
          }
        >
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/parent" element={<ParentDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppToolkitProvider>
  </BrowserRouter>,
);
