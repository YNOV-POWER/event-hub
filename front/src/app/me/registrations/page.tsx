import { Suspense } from "react";
import { RouteGuard } from "@/auth/RouteGuard";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { MyRegistrationsPage } from "./MyRegistrationsPage";

export default function MyRegistrationsRoutePage() {
  return (
    <RouteGuard>
      <Suspense fallback={<SkeletonRow count={3} />}>
        <MyRegistrationsPage />
      </Suspense>
    </RouteGuard>
  );
}
