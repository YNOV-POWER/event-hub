import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventListPage } from "@/app/events/EventListPage";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import { MOCK_EVENT_LIST_RESPONSE } from "@/mocks/fixtures";
import { expectNoA11yViolations } from "./a11y";

const pushMock = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/events",
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EventListPage />
    </QueryClientProvider>,
  );
}

describe("EventListPage — 5 états d'interface et filtres URL", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    currentSearch = "";
  });

  it("affiche les squelettes en état de chargement puis les cartes en succès", async () => {
    let resolvePromise!: (value: typeof MOCK_EVENT_LIST_RESPONSE) => void;
    vi.spyOn(api, "listEvents").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { container } = renderPage();
    expect(screen.getByLabelText(/Chargement des événements/i)).toBeInTheDocument();

    resolvePromise(MOCK_EVENT_LIST_RESPONSE);

    expect(await screen.findByText("TypeScript Workshop")).toBeInTheDocument();
    expect(screen.getByText("Jazz au parc")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche l'état vide avec action de réinitialisation si des filtres sont actifs", async () => {
    currentSearch = "category=CONCERT";
    vi.spyOn(api, "listEvents").mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 9, totalItems: 0, totalPages: 0 },
    });

    const user = userEvent.setup();
    const { container } = renderPage();

    expect(await screen.findByText("Aucun événement")).toBeInTheDocument();
    const resetButtons = screen.getAllByRole("button", { name: /Réinitialiser les filtres/i });
    expect(resetButtons.length).toBeGreaterThan(0);

    await user.click(resetButtons[0]!);
    expect(pushMock).toHaveBeenCalledWith("/events", { scroll: false });
    await expectNoA11yViolations(container);
  });

  it("affiche l'état erreur avec requestId et bouton Réessayer", async () => {
    const listSpy = vi
      .spyOn(api, "listEvents")
      .mockRejectedValueOnce(
        new ApiError({
          status: 500,
          code: "INTERNAL_ERROR",
          title: "Internal server error",
          detail: "Boom",
          requestId: "req_err_500_test",
        }),
      )
      .mockResolvedValueOnce(MOCK_EVENT_LIST_RESPONSE);

    const user = userEvent.setup();
    const { container } = renderPage();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/req_err_500_test/)).toBeInTheDocument();
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole("button", { name: /Réessayer/i }));
    await waitFor(() => expect(listSpy).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("TypeScript Workshop")).toBeInTheDocument();
  });

  it("met à jour les filtres dans l'URL au clic sur une catégorie", async () => {
    vi.spyOn(api, "listEvents").mockResolvedValue(MOCK_EVENT_LIST_RESPONSE);
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("TypeScript Workshop");
    await user.click(screen.getByRole("button", { name: "Atelier" }));

    expect(pushMock).toHaveBeenCalledWith("/events?category=WORKSHOP", { scroll: false });
  });
});
