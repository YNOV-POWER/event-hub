import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyEventsPage } from "@/app/me/events/MyEventsPage";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import {
  CANCELLED_ORGANIZER_EVENT,
  DRAFT_ORGANIZER_EVENT,
  MOCK_ALL_MY_EVENTS_RESPONSE,
  MOCK_MY_EVENTS_RESPONSE,
  PUBLISHED_ORGANIZER_EVENT,
} from "@/mocks/fixtures";
import { expectNoA11yViolations } from "./a11y";

const pushMock = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => "/me/events",
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function renderMyEventsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MyEventsPage />
    </QueryClientProvider>,
  );
}

describe("MyEventsPage (Écran 07 — SCRUM-31 / SCRUM-33 / SCRUM-37 / SCRUM-69)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pushMock.mockReset();
    currentSearch = "";
  });

  it("affiche le chargement puis le tableau avec statuts et actions selon chaque état", async () => {
    let resolveList!: (value: typeof MOCK_ALL_MY_EVENTS_RESPONSE) => void;
    vi.spyOn(api, "listMyEvents").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    );

    const { container } = renderMyEventsPage();
    expect(
      screen.getByLabelText(/Chargement de vos événements organisateur/i),
    ).toBeInTheDocument();

    resolveList(MOCK_ALL_MY_EVENTS_RESPONSE);

    expect(await screen.findByText("Conférence Accessibilité Web")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Workshop")).toBeInTheDocument();
    expect(screen.getByText("Atelier Figma")).toBeInTheDocument();

    // US06 : « Publier » uniquement sur les événements DRAFT (2 brouillons dans le jeu complet)
    const publishButtons = screen.getAllByRole("button", { name: /Publier/i });
    expect(publishButtons).toHaveLength(2);

    // US08 : « Annuler » masqué sur l'événement CANCELLED (« Atelier Figma »)
    expect(
      screen.queryByRole("button", { name: /Annuler « Atelier Figma »/i }),
    ).not.toBeInTheDocument();

    // US26 : « Dupliquer » présent sur l'événement CANCELLED
    expect(
      screen.getByRole("button", { name: /Dupliquer « Atelier Figma »/i }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });

  it("publie un brouillon et met à jour son statut sans rechargement réseau (US06)", async () => {
    const listSpy = vi
      .spyOn(api, "listMyEvents")
      .mockResolvedValue(MOCK_MY_EVENTS_RESPONSE);
    const publishSpy = vi.spyOn(api, "publishEvent").mockResolvedValue({
      data: {
        ...DRAFT_ORGANIZER_EVENT,
        status: "PUBLISHED",
      },
    });

    const user = userEvent.setup();
    const { container } = renderMyEventsPage();

    await screen.findByText("Conférence Accessibilité Web");
    await user.click(
      screen.getByRole("button", {
        name: /Publier « Conférence Accessibilité Web »/i,
      }),
    );

    await waitFor(() =>
      expect(publishSpy).toHaveBeenCalledWith(DRAFT_ORGANIZER_EVENT.id),
    );

    // Bannière de confirmation US06 + disparition du bouton Publier sur cet événement, sans nouvel appel GET
    expect(
      await screen.findByText("« Conférence Accessibilité Web » a été publié."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /Publier « Conférence Accessibilité Web »/i,
      }),
    ).not.toBeInTheDocument();
    expect(listSpy).toHaveBeenCalledTimes(1);
    await expectNoA11yViolations(container);
  });

  it("affiche les messages dédiés 422 (date passée + lien Modifier) et 409 lors de la publication (US06)", async () => {
    vi.spyOn(api, "listMyEvents").mockResolvedValue(MOCK_MY_EVENTS_RESPONSE);
    vi.spyOn(api, "publishEvent")
      .mockRejectedValueOnce(
        new ApiError({
          status: 422,
          code: "VALIDATION_FAILED",
          title: "Validation failed",
          detail: "startsAt is in the past",
          requestId: "req_pub_422",
          errors: [{ field: "startsAt", code: "PAST_DATE", message: "Past date" }],
        }),
      )
      .mockRejectedValueOnce(
        new ApiError({
          status: 409,
          code: "INVALID_STATE_TRANSITION",
          title: "Invalid transition",
          detail: "Already published",
          requestId: "req_pub_409",
        }),
      );

    const user = userEvent.setup();
    const { container } = renderMyEventsPage();

    await screen.findByText("Conférence Accessibilité Web");
    const publishBtn = screen.getByRole("button", {
      name: /Publier « Conférence Accessibilité Web »/i,
    });

    await user.click(publishBtn);
    const alert422 = await screen.findByRole("alert");
    expect(alert422).toHaveTextContent(
      "Impossible de publier : la date de début est passée.",
    );
    expect(within(alert422).getByRole("link", { name: "Modifier" })).toHaveAttribute(
      "href",
      `/admin/events/${DRAFT_ORGANIZER_EVENT.id}/edit`,
    );
    await expectNoA11yViolations(container);

    await user.click(publishBtn);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cet événement a déjà été publié ou annulé.",
    );
    await expectNoA11yViolations(container);
  });

  it("ouvre la modale de confirmation d'annulation et met à jour le statut sans rechargement (US08)", async () => {
    const listSpy = vi
      .spyOn(api, "listMyEvents")
      .mockResolvedValue(MOCK_MY_EVENTS_RESPONSE);
    const cancelSpy = vi.spyOn(api, "cancelEvent").mockResolvedValue({
      data: {
        ...PUBLISHED_ORGANIZER_EVENT,
        status: "CANCELLED",
        confirmedCount: 0,
        remainingSeats: PUBLISHED_ORGANIZER_EVENT.capacity,
      },
    });

    const user = userEvent.setup();
    const { container } = renderMyEventsPage();

    await screen.findByText("TypeScript Workshop");
    await user.click(
      screen.getByRole("button", { name: /Annuler « TypeScript Workshop »/i }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Annuler « TypeScript Workshop » ?");
    expect(dialog).toHaveTextContent(
      "18 inscrits seront notifiés et leurs inscriptions annulées.",
    );
    await expectNoA11yViolations(container);

    await user.click(within(dialog).getByRole("button", { name: "Annuler l'événement" }));

    await waitFor(() =>
      expect(cancelSpy).toHaveBeenCalledWith(PUBLISHED_ORGANIZER_EVENT.id),
    );
    expect(
      await screen.findByText("« TypeScript Workshop » a été annulé."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Annuler « TypeScript Workshop »/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Dupliquer « TypeScript Workshop »/i }),
    ).toBeInTheDocument();
    expect(listSpy).toHaveBeenCalledTimes(1);
  });

  it("duplique un événement annulé en brouillon et synchronise le filtre URL (US26 / US05)", async () => {
    vi.spyOn(api, "listMyEvents").mockResolvedValue(MOCK_MY_EVENTS_RESPONSE);
    const dupSpy = vi.spyOn(api, "duplicateEvent").mockResolvedValue({
      data: {
        ...CANCELLED_ORGANIZER_EVENT,
        id: "00000000-0000-4000-8200-000000000098",
        title: "Atelier Figma (copie)",
        status: "DRAFT",
      },
    });

    const user = userEvent.setup();
    renderMyEventsPage();

    await screen.findByText("Atelier Figma");
    await user.click(
      screen.getByRole("button", { name: /Dupliquer « Atelier Figma »/i }),
    );

    await waitFor(() =>
      expect(dupSpy).toHaveBeenCalledWith(CANCELLED_ORGANIZER_EVENT.id),
    );
    expect(await screen.findByText("Atelier Figma (copie)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Brouillons/i }));
    expect(pushMock).toHaveBeenCalledWith("/me/events?status=DRAFT", { scroll: false });
  });

  it("affiche l'état vide et l'état d'erreur avec requestId", async () => {
    vi.spyOn(api, "listMyEvents").mockResolvedValueOnce({
      data: [],
      meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    });

    const { container, unmount } = renderMyEventsPage();
    expect(await screen.findByText("Aucun événement")).toBeInTheDocument();
    const createLinks = screen.getAllByRole("link", { name: /Créer un événement/i });
    expect(createLinks.length).toBeGreaterThanOrEqual(1);
    await expectNoA11yViolations(container);
    unmount();

    vi.spyOn(api, "listMyEvents").mockRejectedValueOnce(
      new ApiError({
        status: 500,
        code: "INTERNAL_ERROR",
        title: "Error",
        detail: "Boom",
        requestId: "req_my_events_err_01",
      }),
    );

    const { container: errContainer } = renderMyEventsPage();
    expect(await screen.findByText("Une erreur est survenue")).toBeInTheDocument();
    expect(screen.getByText(/req_my_events_err_01/)).toBeInTheDocument();
    await expectNoA11yViolations(errContainer);
  });
});
