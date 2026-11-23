import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { AccountRegistrationForm } from "@/components/auth/AccountRegistrationForm";
import { expectNoA11yViolations } from "./a11y";

describe("AccountRegistrationForm (US01)", () => {
  it("exige un mot de passe d'au moins 12 caractères", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<AccountRegistrationForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Nom affiché/i), "Ada");
    await user.type(screen.getByLabelText(/Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Mot de passe/i), "tropcourt");
    await user.click(screen.getByRole("button", { name: /Créer mon compte/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/au moins 12 caractères/i)).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("affiche un message dédié avec lien de connexion sur 409 EMAIL_ALREADY_USED", async () => {
    const { container } = render(
      <AccountRegistrationForm
        serverError={
          new ApiError({
            status: 409,
            code: "EMAIL_ALREADY_USED",
            title: "Email already used",
            detail: "Duplicate email.",
          })
        }
        onSubmit={vi.fn()}
      />,
    );

    const alerts = screen.getAllByRole("alert");
    expect(alerts[0]).toHaveTextContent(/compte existe déjà avec cette adresse email/i);
    expect(screen.getAllByRole("link", { name: /Se connecter/i }).length).toBeGreaterThan(0);
    await expectNoA11yViolations(container);
  });

  it("rattache les erreurs serveur 422 au champ concerné", async () => {
    const { container } = render(
      <AccountRegistrationForm
        serverError={
          new ApiError({
            status: 422,
            code: "VALIDATION_FAILED",
            title: "Validation failed",
            detail: "Validation failed.",
            errors: [
              {
                field: "displayName",
                code: "MIN_LENGTH",
                message: "Nom affiché trop court côté serveur.",
              },
            ],
          })
        }
        onSubmit={vi.fn()}
      />,
    );

    expect(await screen.findByText("Nom affiché trop court côté serveur.")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
