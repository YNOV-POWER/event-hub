import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegistrantsView } from "@/components/organizer/RegistrantsView";
import { buildCsv, toFileSlug } from "@/i18n/csv";
import {
  DEMO_EMPTY_EVENT,
  DEMO_REGISTRANTS,
  DEMO_TYPESCRIPT_WORKSHOP,
} from "@/mocks/organizerDemo";
import { expectNoA11yViolations } from "./a11y";

const handlers = {
  onPageChange: vi.fn(),
  onExport: vi.fn(),
  onCopyLink: vi.fn(),
};

describe("RegistrantsView (écran 09, US15 / US23)", () => {
  it("affiche les indicateurs et la première page des inscrits", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    const { container } = render(
      <RegistrantsView
        {...handlers}
        event={DEMO_TYPESCRIPT_WORKSHOP}
        registrants={DEMO_REGISTRANTS}
        page={1}
        pageSize={6}
        onExport={onExport}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Inscrits · TypeScript Workshop" }),
    ).toBeVisible();
    expect(screen.getByText("18 / 30")).toBeVisible();
    expect(screen.getByText(/60\s% de remplissage/)).toBeVisible();

    const table = screen.getByRole("table", { name: "Inscrits de TypeScript Workshop" });
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(within(table).getByText("Ada Lovelace")).toBeVisible();
    expect(within(table).getByText("Attente · 1ʳᵉ")).toBeVisible();
    expect(screen.getByText("Affichage 1–6 sur 22")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Exporter en CSV" }));
    expect(onExport).toHaveBeenCalledOnce();
    await expectNoA11yViolations(container);
  });

  it("propose de copier le lien quand il n'y a aucun inscrit", async () => {
    const user = userEvent.setup();
    const onCopyLink = vi.fn();
    const { container } = render(
      <RegistrantsView
        {...handlers}
        event={DEMO_EMPTY_EVENT}
        registrants={[]}
        page={1}
        pageSize={6}
        onCopyLink={onCopyLink}
      />,
    );

    expect(screen.getByText("Aucun inscrit pour l'instant")).toBeVisible();
    expect(screen.getByRole("button", { name: "Exporter en CSV" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Copier le lien" }));
    expect(onCopyLink).toHaveBeenCalledOnce();
    await expectNoA11yViolations(container);
  });

  it("refuse l'accès à un autre organisateur", async () => {
    const { container } = render(
      <RegistrantsView
        {...handlers}
        event={DEMO_TYPESCRIPT_WORKSHOP}
        registrants={[]}
        page={1}
        pageSize={6}
        isForbidden
      />,
    );

    expect(screen.getByText("Accès refusé")).toBeVisible();
    expect(screen.getByRole("link", { name: "Retour" })).toHaveAttribute("href", "/me/events");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});

describe("Export CSV des inscrits", () => {
  it("échappe les séparateurs et neutralise les formules", () => {
    expect(
      buildCsv([
        ["Participant", "Email"],
        ['Ada "Countess" Lovelace', "=HYPERLINK(\"x\")"],
        ["Alan; Turing", "@cmd"],
      ]),
    ).toBe(
      String.fromCharCode(0xfeff) +
        'Participant;Email\r\n"Ada ""Countess"" Lovelace";"\'=HYPERLINK(""x"")"\r\n"Alan; Turing";\'@cmd\r\n',
    );
  });

  it("produit un nom de fichier lisible", () => {
    expect(toFileSlug("Conférence Accessibilité Web")).toBe("conference-accessibilite-web");
    expect(toFileSlug("!!!")).toBe("evenement");
  });
});
