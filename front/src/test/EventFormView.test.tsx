import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { EventFormView } from "@/components/organizer/EventFormView";
import { DEMO_CANCELLED_EVENT, DEMO_TYPESCRIPT_WORKSHOP } from "@/mocks/organizerDemo";
import { expectNoA11yViolations } from "./a11y";

describe("EventFormView (écran 08, US05 / US07)", () => {
  it("préremplit l'événement et envoie les dates en UTC", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <EventFormView event={DEMO_TYPESCRIPT_WORKSHOP} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Modifier l'événement" })).toBeVisible();
    expect(screen.getByLabelText("Titre *")).toHaveValue("TypeScript Workshop");

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "TypeScript Workshop",
      description: DEMO_TYPESCRIPT_WORKSHOP.description,
      category: "WORKSHOP",
      location: "Hub Central, 12 rue de la République, Lyon",
      startsAt: DEMO_TYPESCRIPT_WORKSHOP.startsAt,
      endsAt: DEMO_TYPESCRIPT_WORKSHOP.endsAt,
      capacity: 30,
    });
    await expectNoA11yViolations(container);
  });

  it("refuse une fin avant le début et une capacité sous les inscrits confirmés", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <EventFormView event={DEMO_TYPESCRIPT_WORKSHOP} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );

    const start = screen.getByLabelText("Début *") as HTMLInputElement;
    const [day] = start.value.split("T");
    fireEvent.change(screen.getByLabelText("Fin *"), { target: { value: `${day}T00:30` } });
    await user.clear(screen.getByLabelText("Capacité *"));
    await user.type(screen.getByLabelText("Capacité *"), "10");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(await screen.findByText("La fin doit être après le début.")).toBeVisible();
    expect(screen.getByText("Minimum 18 (inscrits confirmés).")).toBeVisible();
    expect(
      screen.getByText("La capacité ne peut pas être inférieure au nombre d'inscrits confirmés (18)."),
    ).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
    await expectNoA11yViolations(container);
  });

  it("bloque la modification d'un événement annulé", () => {
    render(<EventFormView event={DEMO_CANCELLED_EVENT} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/Cet événement est annulé/)).toBeVisible();
    expect(screen.getByLabelText("Titre *")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
  });

  it("crée un brouillon et valide les champs obligatoires", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EventFormView onSubmit={onSubmit} onCancel={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Créer un événement" })).toBeVisible();
    expect(screen.getByText("Brouillon")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Enregistrer le brouillon" }));

    expect(await screen.findByText("Entre 3 et 120 caractères.")).toBeVisible();
    expect(screen.getByText("Indiquez le lieu de l'événement.")).toBeVisible();
    expect(screen.getByText("Indiquez la date de début.")).toBeVisible();
    expect(screen.getByText("Indiquez un nombre entier de places.")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("désactive les actions pendant l'enregistrement", () => {
    render(
      <EventFormView event={DEMO_TYPESCRIPT_WORKSHOP} isSubmitting onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Enregistrement…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Annuler" })).toBeDisabled();
  });

  it("affiche le refus du serveur sur la capacité", () => {
    render(
      <EventFormView
        event={DEMO_TYPESCRIPT_WORKSHOP}
        serverError={
          new ApiError({
            status: 409,
            code: "CAPACITY_BELOW_CONFIRMED",
            title: "Capacity below confirmed",
            detail: "Capacity cannot be lower than confirmed registrations.",
          })
        }
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText("La capacité ne peut pas être inférieure au nombre d'inscrits confirmés (18)."),
    ).toBeVisible();
  });
});
