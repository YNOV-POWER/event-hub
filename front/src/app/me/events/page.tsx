import { Suspense } from "react";
import { RouteGuard } from "@/auth/RouteGuard";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { MyEventsPage } from "./MyEventsPage";

export default function MyEventsRoutePage() {
  return (
    <RouteGuard requiredRole="ORGANIZER">
      <Suspense fallback={<SkeletonRow count={4} />}>
        <MyEventsPage />
      </Suspense>
    </RouteGuard>
  );
}
