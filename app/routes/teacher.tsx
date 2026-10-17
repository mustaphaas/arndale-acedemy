import { APP_TITLE } from "@/lib/app-config";
import { TeacherDashboard } from "@/components/portal";

export function meta() {
  return [{ title: `Teacher dashboard · ${APP_TITLE}` }];
}

export default function TeacherRoute() {
  return <TeacherDashboard />;
}
