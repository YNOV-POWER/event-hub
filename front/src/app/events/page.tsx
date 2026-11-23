import { Suspense } from "react";
import { EventGrid } from "@/components/events/EventGrid";
import { EventListPage } from "./EventListPage";

export default function EventsRoutePage() {
  return (
    <Suspense fallback={<EventGrid events={[]} isLoading skeletonCount={6} />}>
      <EventListPage />
    </Suspense>
  );
}
