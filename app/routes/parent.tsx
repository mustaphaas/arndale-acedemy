import { ParentDashboard } from "@/components/school/parent-dashboard";
import { APP_TITLE } from "@/lib/app-config";

export function meta() {
  return [{ title: `Family dashboard · ${APP_TITLE}` }];
}

export default function ParentRoute() {
  return <ParentDashboard />;
}
