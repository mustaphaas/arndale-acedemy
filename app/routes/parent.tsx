import { APP_TITLE } from "@/lib/app-config";
import { ParentDashboard } from "@/components/portal";

export function meta() {
  return [{ title: `Family dashboard · ${APP_TITLE}` }];
}

export default function ParentRoute() {
  return <ParentDashboard />;
}
