import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventCard } from "@/components/events/EventCard";
import { CANCELLED_EVENT, FULL_EVENT, LONG_TITLE_EVENT, OPEN_EVENT } from "@/mocks/fixtures";
import { expectNoA11yViolations } from "./a11y";

describe("EventCard", () => {
  it("affiche les informations clés et le nombre de places restantes", async () => {
    const { container } = render(<EventCard event={OPEN_EVENT} />);

    expect(screen.getByText("TypeScript Workshop")).toBeInTheDocument();
    expect(screen.getByText(/Hub Central/)).toBeInTheDocument();
    expect(screen.getByText(/Par Grace/)).toBeInTheDocument();
    expect(screen.getByText("12 places")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche le badge 'Complet' quand remainingSeats vaut 0", async () => {
    const { container } = render(<EventCard event={FULL_EVENT} />);
    expect(screen.getByText("Complet")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche le badge 'Annulé' pour un événement annulé", async () => {
    const { container } = render(<EventCard event={CANCELLED_EVENT} />);
    expect(screen.getByText("Annulé")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("gère un titre long sans erreur d'accessibilité", async () => {
    const { container } = render(<EventCard event={LONG_TITLE_EVENT} />);
    expect(screen.getByText(LONG_TITLE_EVENT.title)).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
