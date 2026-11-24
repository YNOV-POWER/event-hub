import { EventDetailPage } from "./EventDetailPage";

export default async function EventDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailPage eventId={id} />;
}
