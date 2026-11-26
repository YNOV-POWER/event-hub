import { RouteGuard } from "@/auth/RouteGuard";
import { EventFormPage } from "../../EventFormPage";

export default async function AdminEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard requiredRole="ORGANIZER">
      <EventFormPage eventId={id} />
    </RouteGuard>
  );
}
