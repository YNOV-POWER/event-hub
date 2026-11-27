import { Suspense } from "react";
import { RouteGuard } from "@/auth/RouteGuard";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { RegistrantsPage } from "./RegistrantsPage";

export default async function AdminEventRegistrantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RouteGuard requiredRole="ORGANIZER">
      <Suspense fallback={<SkeletonRow count={4} />}>
        <RegistrantsPage eventId={id} />
      </Suspense>
    </RouteGuard>
  );
}
