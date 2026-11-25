import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyRegistrationsPage } from "@/app/me/registrations/MyRegistrationsPage";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import { MOCK_MY_REGISTRATIONS_RESPONSE } from "@/mocks/fixtures";
import { expectNoA11yViolations } from "./a11y";

const pushMock = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/me/registrations",
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MyRegistrationsPage />
    </QueryClientProvider>,
  );
}

describe("MyRegistrationsPage (Écran 06 — US14 / US13 / US21 / US28)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    currentSearch = "";
  });

  it("affiche le squelette de chargement puis les sections À venir, Passées et le bandeau de promotion", async () => {
    let resolvePromise!: (value: typeof MOCK_MY_REGISTRATIONS_RESPONSE) => void;
    vi.spyOn(api, "listMyRegistrations").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { container } = renderPage();
    expect(screen.getByLabelText(/Chargement de vos inscriptions/i)).toBeInTheDocument();

    resolvePromise(MOCK_MY_REGISTRATIONS_RESPONSE);

    expect(await screen.findByText("TypeScript Workshop")).toBeInTheDocument();
    expect(screen.getByText(/Bonne nouvelle : une place s'est libérée/i)).toBeInTheDocument();
    expect(screen.getByText(/Attente · 3ᵉ/)).toBeInTheDocument();
    expect(screen.getByText("Participé")).toBeInTheDocument();
    expect(screen.getByText("Annulé")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche l'état vide avec un lien vers le catalogue", async () => {
    vi.spyOn(api, "listMyRegistrations").mockResolvedValue({ data: [] });

    const { container } = renderPage();
    expect(await screen.findByText("Aucune inscription")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir les événements" })).toHaveAttribute(
      "href",
      "/events",
    );
    await expectNoA11yViolations(container);
  });

  it("affiche l'état erreur avec requestId et permet de réessayer", async () => {
    const spy = vi
      .spyOn(api, "listMyRegistrations")
      .mockRejectedValueOnce(
        new ApiError({
          status: 500,
          code: "INTERNAL_ERROR",
          title: "Internal server error",
          detail: "DB error",
          requestId: "req_my_reg_500",
        }),
      )
      .mockResolvedValueOnce(MOCK_MY_REGISTRATIONS_RESPONSE);

    const user = userEvent.setup();
    const { container } = renderPage();

    expect(await screen.findByText(/Impossible de charger vos inscriptions/i)).toBeInTheDocument();
    expect(screen.getByText(/req_my_reg_500/)).toBeInTheDocument();
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole("button", { name: /Réessayer/i }));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("TypeScript Workshop")).toBeInTheDocument();
  });

  it("ouvre la modale de confirmation, désinscrit de façon optimiste et affiche un toast", async () => {
    vi.spyOn(api, "listMyRegistrations").mockResolvedValue(MOCK_MY_REGISTRATIONS_RESPONSE);
    const cancelSpy = vi.spyOn(api, "cancelMyRegistration").mockResolvedValue(undefined);

    const user = userEvent.setup();
    const { container } = renderPage();

    await screen.findByText("TypeScript Workshop");
    const unsubscribeButtons = screen.getAllByRole("button", { name: "Se désinscrire" });
    await user.click(unsubscribeButtons[0]!);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/Se désinscrire de « TypeScript Workshop »/i);
    await expectNoA11yViolations(container);

    await user.click(screen.getByRole("button", { name: "Me désinscrire" }));
    await waitFor(() =>
      expect(cancelSpy).toHaveBeenCalledWith("00000000-0000-4000-8200-000000000001"),
    );
    expect(
      await screen.findByText(/Vous êtes désinscrit·e de « TypeScript Workshop »/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("TypeScript Workshop")).not.toBeInTheDocument();
  });

  it("met à jour le paramètre URL tab au clic sur Passées", async () => {
    vi.spyOn(api, "listMyRegistrations").mockResolvedValue(MOCK_MY_REGISTRATIONS_RESPONSE);
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("TypeScript Workshop");
    await user.click(screen.getByRole("button", { name: /Passées/i }));
    expect(pushMock).toHaveBeenCalledWith("/me/registrations?tab=past", { scroll: false });
  });
});
