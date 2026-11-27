import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrganizerDashboardPage } from "@/app/dashboard/OrganizerDashboardPage";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import { AuthProvider } from "@/auth/auth-context";
import {
  OrganizerDashboardView,
  computeOrganizerDashboardMetrics,
} from "@/components/organizer/OrganizerDashboardView";
import { Navbar } from "@/components/ui/Navbar";
import { MOCK_ALL_MY_EVENTS_RESPONSE, MOCK_ORGANIZER_EVENTS } from "@/mocks/fixtures";
import { expectNoA11yViolations } from "./a11y";

function renderDashboardPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizerDashboardPage />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("OrganizerDashboard & Navigation Organisateur (Écran 10 — SCRUM-71 / SCRUM-29)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calcule fidèlement les 4 KPIs et les alertes À faire depuis E3", () => {
    const metrics = computeOrganizerDashboardMetrics(
      MOCK_ORGANIZER_EVENTS,
      new Date("2026-12-01T10:00:00.000Z"),
    );

    expect(metrics.upcomingPublished).toHaveLength(5);
    expect(metrics.upcomingThisMonthCount).toBe(3);
    expect(metrics.drafts).toHaveLength(2);
    expect(metrics.averageFillPercent).toBe(74);
    expect(metrics.totalWaitlistCount).toBe(9);
    expect(metrics.waitlistEventsCount).toBe(3);
    expect(metrics.almostFullEvent?.title).toBe("Sommet Architecture & IA");
    expect(metrics.topWaitlistedEvent?.title).toBe("TypeScript Workshop");
  });

  it("affiche Bonjour Grace, les 4 StatCards, Prochains événements et À faire sans violation a11y", async () => {
    const { container } = render(
      <OrganizerDashboardView
        organizerName="Grace"
        events={MOCK_ORGANIZER_EVENTS}
        referenceDate={new Date("2026-12-01T10:00:00.000Z")}
      />,
    );

    expect(screen.getByRole("heading", { name: "Bonjour Grace" })).toBeInTheDocument();
    expect(screen.getByText("Événements à venir")).toBeInTheDocument();
    expect(screen.getByText("74 %")).toBeInTheDocument();
    expect(screen.getByText("En liste d'attente")).toBeInTheDocument();
    expect(screen.getByText("2 brouillons à publier")).toBeInTheDocument();
    expect(screen.getByText("4 personnes en attente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /2 brouillons à publier/i })).toHaveAttribute(
      "href",
      "/me/events?status=DRAFT",
    );

    await expectNoA11yViolations(container);
  });

  it("charge les données via useOrganizerDashboardEvents et gère l'état vide et erreur", async () => {
    vi.spyOn(api, "listMyEvents").mockResolvedValueOnce(MOCK_ALL_MY_EVENTS_RESPONSE);

    const { container, unmount } = renderDashboardPage();
    expect(await screen.findByText("Prochains événements")).toBeInTheDocument();
    await expectNoA11yViolations(container);
    unmount();

    vi.spyOn(api, "listMyEvents").mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 100, totalItems: 0, totalPages: 0 },
    });
    const { container: emptyContainer, unmount: unmountEmpty } = renderDashboardPage();
    expect(
      await screen.findByText("Bienvenue dans votre espace organisateur"),
    ).toBeInTheDocument();
    await expectNoA11yViolations(emptyContainer);
    unmountEmpty();

    vi.spyOn(api, "listMyEvents").mockRejectedValueOnce(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        title: "Error",
        detail: "Failure",
        requestId: "req_dash_500",
      }),
    );
    const { container: errorContainer } = renderDashboardPage();
    expect(await screen.findByText(/req_dash_500/)).toBeInTheDocument();
    await expectNoA11yViolations(errorContainer);
  });

  it("filtre les liens « Mes événements » et « Tableau de bord » uniquement pour ORGANIZER (SCRUM-29)", async () => {
    const { rerender, container } = render(
      <Navbar
        currentPath="/events"
        user={{ displayName: "Ada", role: "PARTICIPANT" }}
      />,
    );

    expect(screen.queryByRole("link", { name: "Mes événements" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Tableau de bord" }),
    ).not.toBeInTheDocument();
    await expectNoA11yViolations(container);

    rerender(
      <Navbar
        currentPath="/me/events"
        user={{ displayName: "Grace", role: "ORGANIZER" }}
      />,
    );

    const myEventsLink = screen.getByRole("link", { name: "Mes événements" });
    const dashboardLink = screen.getByRole("link", { name: "Tableau de bord" });
    expect(myEventsLink).toHaveAttribute("href", "/me/events");
    expect(myEventsLink).toHaveAttribute("aria-current", "page");
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    await expectNoA11yViolations(container);
  });
});
