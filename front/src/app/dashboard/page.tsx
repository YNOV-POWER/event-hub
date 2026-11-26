import { RouteGuard } from "@/auth/RouteGuard";
import { OrganizerDashboardPage } from "./OrganizerDashboardPage";

export default function DashboardRoutePage() {
  return (
    <RouteGuard requiredRole="ORGANIZER">
      <OrganizerDashboardPage />
    </RouteGuard>
  );
}
