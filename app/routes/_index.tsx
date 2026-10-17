import { StudentDashboard } from "@/components/school/student-dashboard";
import { APP_TITLE } from "@/lib/app-config";

export function meta() {
  return [
    { title: APP_TITLE },
    {
      name: "description",
      content: "A cheerful school day, all in one place.",
    },
  ];
}

export default function HomeRoute() {
  return <StudentDashboard />;
}
