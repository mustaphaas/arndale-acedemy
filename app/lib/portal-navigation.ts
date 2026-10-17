import type { PortalRole } from "./school";

export function viewForPath(pathname: string): PortalRole {
  if (pathname === "/parent" || pathname.startsWith("/parent/"))
    return "parent";
  if (pathname === "/teacher" || pathname.startsWith("/teacher/"))
    return "teacher";
  return "student";
}

export function pathForCommand(command: {
  view?: string;
  path?: string;
}): string {
  if (command.path) return command.path;
  if (command.view === "parent") return "/parent";
  if (command.view === "teacher") return "/teacher";
  if (command.view === "student") return "/student";
  return "/";
}
