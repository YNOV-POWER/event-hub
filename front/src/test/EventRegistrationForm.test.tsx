import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";
import { expectNoA11yViolations } from "./a11y";

describe("EventRegistrationForm — validation, erreurs 409/422 et accessibilité", () => {
  it("valide les champs côté client avant d'appeler onSubmit", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <EventRegistrationForm
        eventStatus="PUBLISHED"
        remainingSeats={10}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "S'inscrire" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/au moins 2 caractères/i)).toBeInTheDocument();
    expect(screen.getByText(/adresse email valide/i)).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche un message dédié pour 409 EVENT_FULL", async () => {
    const { container } = render(
      <EventRegistrationForm
        eventStatus="PUBLISHED"
        remainingSeats={1}
        serverError={
          new ApiError({
            status: 409,
            code: "EVENT_FULL",
            title: "Event is full",
            detail: "No remaining seats.",
            requestId: "req_409_full",
          })
        }
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/complet/i);
    expect(screen.getByText(/req_409_full/)).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche un message dédié pour 409 ALREADY_REGISTERED", () => {
    render(
      <EventRegistrationForm
        eventStatus="PUBLISHED"
        remainingSeats={5}
        serverError={
          new ApiError({
            status: 409,
            code: "ALREADY_REGISTERED",
            title: "Already registered",
            detail: "Duplicate registration.",
          })
        }
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/déjà inscrit/i);
  });

  it("rattache les erreurs serveur 422 aux champs du formulaire", async () => {
    const { container } = render(
      <EventRegistrationForm
        eventStatus="PUBLISHED"
        remainingSeats={5}
        serverError={
          new ApiError({
            status: 422,
            code: "VALIDATION_FAILED",
            title: "Validation failed",
            detail: "Validation failed.",
            errors: [
              {
                field: "email",
                code: "INVALID_FORMAT",
                message: "Domaine email non autorisé.",
              },
            ],
          })
        }
        onSubmit={vi.fn()}
      />,
    );

    expect(await screen.findByText("Domaine email non autorisé.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Adresse email/i)).toHaveAttribute("aria-invalid", "true");
    await expectNoA11yViolations(container);
  });

  it("affiche le message 422 REGISTRATION_CLOSED et désactive le bouton pendant la soumission", () => {
    const { rerender } = render(
      <EventRegistrationForm
        eventStatus="PUBLISHED"
        remainingSeats={5}
        serverError={
          new ApiError({
            status: 422,
            code: "REGISTRATION_CLOSED",
            title: "Registration closed",
            detail: "Closed.",
          })
        }
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/inscriptions sont closes/i);

    rerender(
      <EventRegistrationForm
        eventStatus="PUBLISHED"
        remainingSeats={5}
        isSubmitting
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Inscription en cours/i })).toBeDisabled();
  });
});
