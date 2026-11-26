import { RouteGuard } from "@/auth/RouteGuard";
import { EventFormPage } from "../EventFormPage";

export default function AdminNewEventPage() {
  return (
    <RouteGuard requiredRole="ORGANIZER">
      <EventFormPage />
    </RouteGuard>
  );
}
